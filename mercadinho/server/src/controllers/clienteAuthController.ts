import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  getCustomerSession,
  loginCustomer,
  removeAdminSession,
  registerCustomer,
  removeCustomerSession,
} from '../auth';

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

const getToken = (request: Request) => {
  const authorization = request.get('authorization') || '';
  return authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : '';
};

export async function registerCustomerAccount(request: Request, response: Response) {
  const data = registrationSchema.parse(request.body);
  const session = await registerCustomer(
    data.name,
    data.email.toLowerCase(),
    data.password,
  );

  if (!session) {
    response.status(409).json({ error: 'Já existe uma conta com este e-mail' });
    return;
  }

  removeAdminSession(getToken(request));
  response.status(201).json(session);
}

export async function loginCustomerAccount(request: Request, response: Response) {
  const data = loginSchema.parse(request.body);
  const session = await loginCustomer(data.email.toLowerCase(), data.password);

  if (!session) {
    response.status(401).json({ error: 'E-mail ou senha incorretos' });
    return;
  }

  removeAdminSession(getToken(request));
  response.json(session);
}

export async function getCustomerAccount(request: Request, response: Response) {
  const cliente = await getCustomerSession(getToken(request));
  if (!cliente) {
    response.status(401).json({ error: 'Sessão expirada' });
    return;
  }
  response.json(cliente);
}

export function logoutCustomerAccount(request: Request, response: Response) {
  removeCustomerSession(getToken(request));
  response.sendStatus(204);
}