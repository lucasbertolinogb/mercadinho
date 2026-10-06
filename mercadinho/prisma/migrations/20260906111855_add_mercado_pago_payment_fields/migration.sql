-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transacao" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "itens" TEXT NOT NULL,
    "paymentId" TEXT,
    "preferenceId" TEXT,
    "estoqueReservado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Transacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transacao" ("_id", "clienteId", "data", "itens", "status", "valor") SELECT "_id", "clienteId", "data", "itens", "status", "valor" FROM "Transacao";
DROP TABLE "Transacao";
ALTER TABLE "new_Transacao" RENAME TO "Transacao";
CREATE UNIQUE INDEX "Transacao_paymentId_key" ON "Transacao"("paymentId");
CREATE UNIQUE INDEX "Transacao_preferenceId_key" ON "Transacao"("preferenceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
