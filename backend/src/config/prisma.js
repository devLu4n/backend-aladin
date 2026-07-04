const { PrismaClient } = require("@prisma/client");

// Instância única do Prisma Client, reaproveitada em toda a aplicação
const prisma = new PrismaClient();

module.exports = prisma;
