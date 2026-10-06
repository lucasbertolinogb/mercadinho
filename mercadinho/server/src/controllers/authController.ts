import type { Request, Response } from 'express';
import { z } from 'zod';
import { isAdminToken, login, removeAdminSession, removeCustomerSession } from '../auth';

const loginSchema = z.object({
  name: z.string().min(1),
  senha: z.string().min(1),
});

const getToken = (request: Request) => {
  const authorization = request.get('authorization') || '';
  return authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';
};

export async function entrar(request: Request, response: Response) {
  const { name, senha } = loginSchema.parse(request.body);
  const session = await login(name, senha);

  if (!session) {
    response.status(401).json({ error: 'Nome ou senha incorretos' });
    return;
  }

  removeCustomerSession(getToken(request));
  response.json(session);
}

export function sair(request: Request, response: Response) {
  removeAdminSession(getToken(request));
  response.sendStatus(204);
}

export function verificarSessaoAdmin(request: Request, response: Response) {
  if (!isAdminToken(getToken(request))) {
    response.status(401).json({ error: 'Sessão administrativa expirada' });
    return;
  }
  response.sendStatus(204);
}
