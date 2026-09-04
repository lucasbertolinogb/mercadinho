import type { Request, Response } from 'express';
import { z } from 'zod';
import { login } from '../auth';

const loginSchema = z.object({
  name: z.string().min(1),
  senha: z.string().min(1),
});

export async function entrar(request: Request, response: Response) {
  const { name, senha } = loginSchema.parse(request.body);
  const session = await login(name, senha);

  if (!session) {
    response.status(401).json({ error: 'Nome ou senha incorretos' });
    return;
  }

  response.json(session);
}
