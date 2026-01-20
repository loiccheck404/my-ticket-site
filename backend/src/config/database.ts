import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Create a single Prisma Client instance
const prisma = new PrismaClient();

// Optional: Log queries in development
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query' as never, (e: any) => {
    console.log('Query: ' + e.query);
  });
}

export default prisma;
