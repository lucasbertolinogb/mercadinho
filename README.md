# Mercadinho Online

Aplicação web para gerenciamento e venda de produtos de um mercadinho. O projeto utiliza React, TypeScript, Vite, Express e Prisma para oferecer uma experiência simples de compra e uma área administrativa para manutenção do catálogo.

## Versão 1.0

Depois de retomar o desenvolvimento do projeto, implementei uma primeira versão funcional com os principais fluxos de uma loja online:

- CRUD completo de produtos: cadastro, consulta, edição e exclusão;
- autenticação para acesso administrativo;
- listagem de produtos com busca por nome e categoria;
- carrinho de compras com alteração de quantidade e remoção de itens;
- finalização de pedidos;
- integração de pagamento com checkout do Mercado Pago;
- criação de preferência de pagamento e redirecionamento para o checkout;
- confirmação do pagamento pelo webhook do Mercado Pago, com consulta do status no backend;
- reserva do estoque durante o pagamento e liberação quando o pagamento falha;
- atualização do estoque durante a compra;
- registro persistente das transações no banco de dados;
- interface centralizada e adaptada para uso em dispositivos móveis;
- cadastro de produtos por administradores, incluindo preço, estoque, categoria, descrição e imagem.

O status exibido após o checkout é confirmado pelo backend a partir do webhook; a página de retorno do Mercado Pago, sozinha, não confirma a aprovação. Para habilitar os pagamentos, é necessário configurar as credenciais do Mercado Pago e as URLs públicas do frontend e do webhook.

## Tecnologias

- React e TypeScript;
- Vite;
- Node.js e Express;
- Prisma ORM;
- SDK do Mercado Pago;
- SQLite;
- Zod para validação dos dados.

## Próximos passos

- melhorar o gerenciamento de usuários e contas de clientes;
- reforçar a segurança da autenticação e das sessões;
- adicionar histórico de pedidos para clientes;
- preparar a aplicação para publicação em produção.

## Objetivo

O objetivo do projeto é construir uma aplicação de mercadinho online completa, com uma experiência de compra simples para clientes e ferramentas práticas para que administradores gerenciem os produtos e o estoque.





