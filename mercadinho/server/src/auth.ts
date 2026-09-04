import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma';

const tokens = new Set<string>();

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
