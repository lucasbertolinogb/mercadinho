# Mercadinho Online

Aplicação web para gestão e venda de produtos de um mercadinho, com fluxo de compra para clientes e painel administrativo para controlar o catálogo e pedidos.

## Status atual

A base do projeto já está funcional e inclui os principais fluxos de uma loja online, tanto para clientes quanto para administradores.

## O que já foi implementado

### Administração e catálogo
- CRUD completo de produtos: cadastro, listagem, edição e exclusão;
- autenticação de administrador com sessão e validação por token;
- controle de acesso às rotas administrativas;
- cadastro de produtos com preço, estoque, categoria, descrição e imagem.

### Loja para clientes
- cadastro de cliente com nome, e-mail e senha;
- login e logout de cliente;
- armazenamento seguro da senha com hash utilizando bcrypt;
- sessão do cliente validada no backend;
- histórico de pedidos acessível ao cliente autenticado;
- carrinho de compras com adição, remoção e ajuste de quantidade;
- fluxo de compra com finalização do pedido e integração com o checkout do Mercado Pago.

### Pagamentos e estoque
- criação de preferência de pagamento com o Mercado Pago;
- redirecionamento para o checkout do Mercado Pago;
- webhook de confirmação de pagamento;
- consulta do status do pagamento no backend;
- reserva do estoque durante o fluxo de pagamento;
- liberação do estoque quando o pagamento falha;
- atualização do estoque ao concluir a compra;
- persistência das transações e pedidos no banco de dados.

### Segurança e experiência
- controle de sessão para impedir que cliente e administrador fiquem ativos ao mesmo tempo;
- logout automático de sessão inválida ou expirada;
- bloqueio de ações do painel administrativo quando o usuário não está autenticado;
- interface centralizada, com comportamento adaptado para uso em desktop e dispositivos móveis.

## Tecnologias

- React + TypeScript
- Vite
- Node.js + Express
- Prisma ORM
- SQLite
- Mercado Pago SDK
- bcrypt
- Zod para validação de dados

## Estrutura principal

- frontend: interface da loja e painel administrativo;
- backend: API REST para autenticação, produtos, pedidos e pagamento;
- banco: Prisma com SQLite para persistência dos dados;
- integrações: checkout e webhook do Mercado Pago.

## Como rodar localmente

1. Instale as dependências do projeto:
   - npm install
2. Acesse a pasta do app:
   - cd mercadinho
3. Configure as variáveis de ambiente necessárias para autenticação e integração com o Mercado Pago.
4. Rode as migrations do Prisma:
   - npx prisma migrate dev
5. Inicie o backend:
   - npm run server
6. Inicie o frontend em outro terminal:
   - npm run dev

## Observações importantes

- O status final do pagamento é validado pelo backend via webhook, e não apenas pela página de retorno do Mercado Pago.
- O fluxo de autenticação foi implementado tanto para administrador quanto para cliente, com regras de exclusão mútua para evitar sessões conflitantes.
- O projeto já possui parte prática do funcionamento de e-commerce completo, com a lógica de compra e gestão de estoque funcionando em conjunto.

## Próximos passos planejados

- aprimorar o gerenciamento de contas de clientes;
- criar edição de dados pessoais e recuperação de senha;
- melhorar a gestão administrativa de usuários e pedidos;
- preparar a aplicação para ambiente de produção com segurança e deploy mais robustos.

## Objetivo do projeto

Construir uma loja online completa para mercadinho, com uma experiência simples para o cliente, controle eficiente de estoque e ferramentas práticas para administração do negócio.
