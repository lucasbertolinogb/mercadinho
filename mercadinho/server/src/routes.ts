import { Router } from 'express';
import { entrar } from './controllers/authController';
import { criarPedido, listarPedidos } from './controllers/pedidoController';
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
routes.post('/pedidos', criarPedido);
routes.get('/pedidos', listarPedidos);
