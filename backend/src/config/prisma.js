import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

// Single shared client. In dev we attach to globalThis so hot-reload
// doesn't exhaust the connection pool with orphaned clients.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}
