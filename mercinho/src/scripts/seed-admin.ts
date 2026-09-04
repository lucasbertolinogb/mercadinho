import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const libsql = createClient({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
});
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Verificar se já existe admin
  const existingAdmin = await prisma.empregado.findUnique({
    where: { name: 'admin' }
  });

  if (!existingAdmin) {
    await prisma.empregado.create({
      data: {
        name: 'admin',
        senha: '1234'
      }
    });
    console.log('✅ Admin criado com sucesso!');
    console.log('   Usuário: admin');
    console.log('   Senha: 1234');
  } else {
    console.log('ℹ️ Admin já existe');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());