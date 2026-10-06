import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { z } from 'zod';
import { prisma } from '../prisma';

const itensSchema = z.object({
  itens: z.array(z.object({
    produtoId: z.string().uuid(),
    quantidade: z.number().int().positive(),
  })).min(1),
});

const getMercadoPagoClients = () => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado');
  }

  const client = new MercadoPagoConfig({ accessToken });
  return {
    payment: new Payment(client),
    preference: new Preference(client),
  };
};

const getRequiredUrl = (name: 'PUBLIC_FRONTEND_URL' | 'PUBLIC_WEBHOOK_URL') => {
  const value = process.env[name];
  if (!value || value.includes('localhost') || value.includes('127.0.0.1')) {
    throw new Error(`${name} deve ser uma URL pública HTTPS`);
  }
  return value.replace(/\/$/, '');
};

const normalizeItems = (items: Array<{ produtoId: string; quantidade: number }>) => {
  const quantities = new Map<string, number>();
  for (const item of items) {
    quantities.set(item.produtoId, (quantities.get(item.produtoId) || 0) + item.quantidade);
  }
  return [...quantities.entries()].map(([produtoId, quantidade]) => ({ produtoId, quantidade }));
};

const parseNotification = (request: Request) => {
  const bodyId = request.body?.data?.id;
  const queryId = request.query['data.id'] || request.query.id;
  const type = request.body?.type || request.query.type;
  return { id: bodyId || queryId, type: String(type || '') };
};

const isValidSignature = (request: Request, dataId: string) => {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;

  const signature = request.get('x-signature');
  const requestId = request.get('x-request-id');
  if (!signature || !requestId) return false;

  const values = Object.fromEntries(
    signature.split(',').map(part => {
      const [key, value] = part.split('=');
      return [key, value];
    }),
  );
  if (!values.ts || !values.v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${values.ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const received = Buffer.from(values.v1, 'hex');
  const calculated = Buffer.from(expected, 'hex');
  return received.length === calculated.length && crypto.timingSafeEqual(received, calculated);
};

const releaseReservedStock = async (transactionId: string) => {
  await prisma.$transaction(async transaction => {
    const order = await transaction.transacao.findUnique({ where: { id: transactionId } });
    if (!order || !order.estoqueReservado || order.status === 'PAGO') return;

    const items = JSON.parse(order.itens) as Array<{ produtoId: string; quantidade: number }>;
    for (const item of items) {
      await transaction.produto.update({
        where: { id: item.produtoId },
        data: { estoque: { increment: item.quantidade } },
      });
    }

    await transaction.transacao.update({
      where: { id: order.id },
      data: { estoqueReservado: false, status: 'FALHOU' },
    });
  });
};

export async function criarPagamento(request: Request, response: Response) {
  const missingConfiguration = [
    !process.env.MERCADOPAGO_ACCESS_TOKEN && 'MERCADOPAGO_ACCESS_TOKEN',
    (!process.env.PUBLIC_FRONTEND_URL || process.env.PUBLIC_FRONTEND_URL.includes('localhost')) && 'PUBLIC_FRONTEND_URL pública',
    (!process.env.PUBLIC_WEBHOOK_URL || process.env.PUBLIC_WEBHOOK_URL.includes('localhost')) && 'PUBLIC_WEBHOOK_URL pública',
  ].filter(Boolean);

  if (missingConfiguration.length > 0) {
    response.status(503).json({
      error: `Pagamento não configurado: ${missingConfiguration.join(', ')}`,
    });
    return;
  }

  const { itens: rawItems } = itensSchema.parse(request.body);
  const itens = normalizeItems(rawItems);
  const produtos = await prisma.produto.findMany({
    where: { id: { in: itens.map(item => item.produtoId) } },
  });

  if (produtos.length !== itens.length) {
    response.status(400).json({ error: 'Um ou mais produtos não existem' });
    return;
  }

  const cliente = await prisma.cliente.upsert({
    where: { email: 'guest@mercadinho.local' },
    update: {},
    create: { email: 'guest@mercadinho.local', name: 'Cliente visitante' },
  });

  const pedido = await prisma.$transaction(async transaction => {
    let total = 0;
    const snapshot = [];

    for (const item of itens) {
      const produto = produtos.find(current => current.id === item.produtoId)!;
      const updated = await transaction.produto.updateMany({
        where: { id: produto.id, estoque: { gte: item.quantidade } },
        data: { estoque: { decrement: item.quantidade } },
      });
      if (updated.count !== 1) throw new Error('ESTOQUE_INSUFICIENTE');

      total += produto.preco * item.quantidade;
      snapshot.push({ produtoId: produto.id, quantidade: item.quantidade, preco: produto.preco });
    }

    return transaction.transacao.create({
      data: {
        valor: total,
        clienteId: cliente.id,
        status: 'PENDENTE',
        itens: JSON.stringify(snapshot),
        estoqueReservado: true,
      },
    });
  }).catch(error => {
    if (error instanceof Error && error.message === 'ESTOQUE_INSUFICIENTE') {
      response.status(409).json({ error: 'Estoque insuficiente' });
      return null;
    }
    throw error;
  });

  if (!pedido) return;

  try {
    const { preference } = getMercadoPagoClients();
    const frontendUrl = getRequiredUrl('PUBLIC_FRONTEND_URL');
    const webhookUrl = getRequiredUrl('PUBLIC_WEBHOOK_URL');
    const createdPreference = await preference.create({
      body: {
        items: produtos.map(produto => {
          const item = itens.find(current => current.produtoId === produto.id)!;
          return {
            id: produto.id,
            title: produto.nome,
            quantity: item.quantidade,
            unit_price: produto.preco,
            currency_id: 'BRL',
          };
        }),
        external_reference: pedido.id,
        notification_url: webhookUrl,
        back_urls: {
          success: `${frontendUrl}/pagamento/sucesso`,
          failure: `${frontendUrl}/pagamento/falhou`,
          pending: `${frontendUrl}/pagamento/pendente`,
        },
        auto_return: 'approved',
      },
    });

    await prisma.transacao.update({
      where: { id: pedido.id },
      data: { preferenceId: createdPreference.id },
    });

    response.status(201).json({
      pedidoId: pedido.id,
      preferenceId: createdPreference.id,
      init_point: createdPreference.init_point || createdPreference.sandbox_init_point,
    });
  } catch (error) {
    await releaseReservedStock(pedido.id);
    throw error;
  }
}

export async function receberWebhookPagamento(request: Request, response: Response) {
  const notification = parseNotification(request);
  const paymentId = notification.id ? String(notification.id) : '';
  if (notification.type !== 'payment' || !paymentId) {
    response.sendStatus(200);
    return;
  }
  if (!isValidSignature(request, paymentId)) {
    response.status(401).json({ error: 'Assinatura inválida' });
    return;
  }

  const { payment } = getMercadoPagoClients();
  const mercadoPagoPayment = await payment.get({ id: paymentId });
  const externalReference = mercadoPagoPayment.external_reference;
  if (!externalReference) {
    response.sendStatus(200);
    return;
  }

  const pedido = await prisma.transacao.findUnique({ where: { id: externalReference } });
  if (!pedido) {
    response.sendStatus(200);
    return;
  }

  const paymentAmount = Math.round(Number(mercadoPagoPayment.transaction_amount) * 100);
  const orderAmount = Math.round(Number(pedido.valor) * 100);
  if (paymentAmount !== orderAmount) {
    response.status(400).json({ error: 'Valor do pagamento não corresponde ao pedido' });
    return;
  }

  const status = mercadoPagoPayment.status;
  const novoStatus = status === 'approved'
    ? 'PAGO'
    : ['rejected', 'cancelled', 'refunded', 'charged_back'].includes(status || '')
      ? 'FALHOU'
      : 'PENDENTE';

  if (pedido.status === 'FALHOU' || pedido.status === 'PAGO') {
    response.sendStatus(200);
    return;
  }

  if (novoStatus === 'FALHOU') {
    await releaseReservedStock(pedido.id);
  } else {
    await prisma.transacao.update({
      where: { id: pedido.id },
      data: { paymentId, status: novoStatus },
    });
  }

  response.sendStatus(200);
}

export async function consultarPagamento(request: Request, response: Response) {
  const pedido = await prisma.transacao.findUnique({
    where: { paymentId: String(request.params.paymentId) },
    select: { id: true, status: true, valor: true },
  });
  if (!pedido) {
    response.status(404).json({ error: 'Pagamento não encontrado' });
    return;
  }
  response.json(pedido);
}