-- CreateTable
CREATE TABLE "Cliente" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Cartao" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "validade" TEXT NOT NULL,
    "cvv" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    CONSTRAINT "Cartao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Produto" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" REAL NOT NULL,
    "imagem" TEXT,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Carrinho" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Carrinho_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CarrinhoItem" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "quantidade" INTEGER NOT NULL,
    "preco" REAL NOT NULL,
    "produtoId" TEXT NOT NULL,
    "carrinhoId" TEXT NOT NULL,
    CONSTRAINT "CarrinhoItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CarrinhoItem_carrinhoId_fkey" FOREIGN KEY ("carrinhoId") REFERENCES "Carrinho" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Empregado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Transacao" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "itens" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cartao_clienteId_key" ON "Cartao"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Empregado_name_key" ON "Empregado"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Empregado_senha_key" ON "Empregado"("senha");
