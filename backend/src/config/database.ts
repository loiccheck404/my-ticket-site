import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Explicitly set the DATABASE_URL if needed
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://bboy:password123@localhost:5432/my_ticket_db';

// Create Prisma Client with explicit datasource
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

// Optional: Log queries in development
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query' as never, (e: any) => {
    console.log('Query: ' + e.query);
  });
}

export default prisma;
