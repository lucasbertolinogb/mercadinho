import { Router } from 'express';
import { entrar } from './controllers/authController';
import { listarPedidos } from './controllers/pedidoController';
import {
  consultarPagamento,
  criarPagamento,
  receberWebhookPagamento,
} from './controllers/pagamentoController';
import {
  atualizarProduto,
  criarProduto,
  excluirProduto,
  listarProdutos,
} from './controllers/produtoController';
import { requireAdmin } from './auth';

export const routes = Router();

routes.post('/auth/login', entrar);
routes.get('/produtos', listarProdutos);
routes.post('/produtos', requireAdmin, criarProduto);
routes.put('/produtos/:id', requireAdmin, atualizarProduto);
routes.delete('/produtos/:id', requireAdmin, excluirProduto);
routes.post('/pagamento', criarPagamento);
routes.post('/pagamento/webhook', receberWebhookPagamento);
routes.get('/pagamento/:paymentId', consultarPagamento);
routes.post('/pedidos', criarPagamento);
routes.get('/pedidos', listarPedidos);
