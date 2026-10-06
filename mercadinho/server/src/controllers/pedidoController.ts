import { z } from 'zod';
import type { Request, Response } from 'express';
import { prisma } from '../prisma';
import { getCustomerIdFromToken, isAdminToken } from '../auth';

const pedidoSchema = z.object({
  itens: z.array(z.object({
    produtoId: z.string().uuid(),
    quantidade: z.number().int().positive(),
  })).min(1),
});

export async function criarPedido(request: Request, response: Response) {
  const { itens } = pedidoSchema.parse(request.body);
  const authorization = request.get('authorization') || '';
  const sessionToken = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';
  const authenticatedClienteId = sessionToken ? getCustomerIdFromToken(sessionToken) : null;
  if (sessionToken && !authenticatedClienteId) {
    response.status(401).json({ error: 'Sessão expirada. Entre novamente para continuar.' });
    return;
  }

  const produtos = await prisma.produto.findMany({
    where: { id: { in: itens.map(item => item.produtoId) } },
  });

  if (produtos.length !== itens.length) {
    response.status(400).json({ error: 'Um ou mais produtos não existem' });
    return;
  }

  const total = itens.reduce((sum, item) => {
    const produto = produtos.find(current => current.id === item.produtoId)!;
    return sum + produto.preco * item.quantidade;
  }, 0);

  const cliente = authenticatedClienteId
    ? await prisma.cliente.findUnique({ where: { id: authenticatedClienteId }, select: { id: true } })
    : await prisma.cliente.upsert({
      where: { email: 'guest@mercadinho.local' },
      update: {},
      create: { email: 'guest@mercadinho.local', name: 'Cliente visitante' },
      select: { id: true },
    });
  if (!cliente) {
    response.status(401).json({ error: 'Conta de cliente não encontrada' });
    return;
  }

  const pedido = await prisma.$transaction(async transaction => {
    for (const item of itens) {
      const updated = await transaction.produto.updateMany({
        where: { id: item.produtoId, estoque: { gte: item.quantidade } },
        data: { estoque: { decrement: item.quantidade } },
      });

      if (updated.count !== 1) {
        throw new Error('Estoque insuficiente');
      }
    }

    return transaction.transacao.create({
      data: {
        valor: total,
        clienteId: cliente.id,
        status: 'concluido',
        itens: JSON.stringify(itens),
      },
    });
  });

  response.status(201).json(pedido);
}

export async function listarPedidos(request: Request, response: Response) {
  const authorization = request.get('authorization') || '';
  const sessionToken = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';
  const clienteId = sessionToken ? getCustomerIdFromToken(sessionToken) : null;
  if (!clienteId && !isAdminToken(sessionToken)) {
    response.status(401).json({ error: 'Entre na sua conta para consultar os pedidos' });
    return;
  }

  const pedidos = await prisma.transacao.findMany({
    where: clienteId ? { clienteId } : undefined,
    orderBy: { data: 'desc' },
  });

  const itensDosPedidos = pedidos.flatMap(pedido => {
    const itens = JSON.parse(pedido.itens) as Array<{ produtoId: string; quantidade: number }>;
    return itens;
  });
  const produtos = await prisma.produto.findMany({
    where: { id: { in: itensDosPedidos.map(item => item.produtoId) } },
  });

  response.json(pedidos.map(pedido => ({
    ...pedido,
    itens: (JSON.parse(pedido.itens) as Array<{ produtoId: string; quantidade: number }>).map(item => ({
      ...item,
      produto: produtos.find(produto => produto.id === item.produtoId) || null,
    })),
  })));
}
