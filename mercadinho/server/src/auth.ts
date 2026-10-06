import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma';

const tokens = new Set<string>();
const customerTokens = new Map<string, string>();

const createCustomerSession = (cliente: { id: string; email: string; name: string | null }) => {
  const token = randomUUID();
  customerTokens.set(token, cliente.id);
  return { token, cliente };
};

export async function registerCustomer(name: string, email: string, password: string) {
  const existingCustomer = await prisma.cliente.findUnique({ where: { email } });
  if (existingCustomer) return null;

  const cliente = await prisma.cliente.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
    select: { id: true, email: true, name: true },
  });
  return createCustomerSession(cliente);
}

export async function loginCustomer(email: string, password: string) {
  const cliente = await prisma.cliente.findUnique({ where: { email } });
  if (!cliente?.passwordHash || !(await bcrypt.compare(password, cliente.passwordHash))) return null;

  return createCustomerSession({ id: cliente.id, email: cliente.email, name: cliente.name });
}

export async function getCustomerSession(token: string) {
  const clienteId = customerTokens.get(token);
  if (!clienteId) return null;
  return prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { id: true, email: true, name: true },
  });
}

export function getCustomerIdFromToken(token: string) {
  return customerTokens.get(token) || null;
}

export function isAdminToken(token: string) {
  return tokens.has(token);
}

export function removeCustomerSession(token: string) {
  customerTokens.delete(token);
}

export function removeAdminSession(token: string) {
  tokens.delete(token);
}

export async function login(name: string, senha: string) {
  let empregado = await prisma.empregado.findUnique({ where: { name } });

  if (
    !empregado &&
    name === process.env.ADMIN_INITIAL_NAME &&
    senha === process.env.ADMIN_INITIAL_PASSWORD
  ) {
    empregado = await prisma.empregado.create({
      data: { name, senha: await bcrypt.hash(senha, 10) },
    });
  }

  if (!empregado || !(await bcrypt.compare(senha, empregado.senha))) {
    return null;
  }

  const token = randomUUID();
  tokens.add(token);
  return { token, name: empregado.name };
}

export function requireAdmin(request: Request, response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';

  if (!tokens.has(token)) {
    response.status(401).json({ error: 'Acesso administrativo necessário' });
    return;
  }

  next();
}
