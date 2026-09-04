import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { routes } from './routes';

export const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api', routes);

const handleError: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({ error: 'Dados inválidos', details: error.flatten() });
    return;
  }

  console.error(error);
  response.status(500).json({ error: 'Erro interno do servidor' });
};

app.use(handleError);
