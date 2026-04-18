// lib/prisma.ts
import { PrismaClient } from '../generated/prisma/client';

const url = process.env.MONGODB_URI ?? process.env.DATABASE_URL; // keep both options if you changed the schema

if (!url || !/^mongodb(\+srv)?:\/\//i.test(url)) {
  // Fail fast with a helpful error
  throw new Error(
    'Invalid DB URL: expected mongodb:// or mongodb+srv://. ' +
      'Check your Vercel Environment Variables (DATABASE_URL or MONGODB_URI).',
  );
}

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
