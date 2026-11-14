const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('projects', 'id'), COALESCE(max(id), 0) + 1, false) FROM projects;`);
  console.log('Fixed projects sequence');
  await prisma.$disconnect();
}
fix();

