import { Router } from 'express';
import { entrar, sair, verificarSessaoAdmin } from './controllers/authController';
import {
  getCustomerAccount,
  loginCustomerAccount,
  logoutCustomerAccount,
  registerCustomerAccount,
} from './controllers/clienteAuthController';
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
routes.post('/auth/logout', sair);
routes.get('/auth/admin/me', verificarSessaoAdmin);
routes.post('/auth/clientes/cadastro', registerCustomerAccount);
routes.post('/auth/clientes/login', loginCustomerAccount);
routes.get('/auth/clientes/me', getCustomerAccount);
routes.post('/auth/clientes/logout', logoutCustomerAccount);
routes.get('/produtos', listarProdutos);
routes.post('/produtos', requireAdmin, criarProduto);
routes.put('/produtos/:id', requireAdmin, atualizarProduto);
routes.delete('/produtos/:id', requireAdmin, excluirProduto);
routes.post('/pagamento', criarPagamento);
routes.post('/pagamento/webhook', receberWebhookPagamento);
routes.get('/pagamento/:paymentId', consultarPagamento);
routes.post('/pedidos', criarPagamento);
routes.get('/pedidos', listarPedidos);
