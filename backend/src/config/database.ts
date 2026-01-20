import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Explicitly set the DATABASE_URL with correct password
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://bboy:6676@127.0.0.1:5432/my_ticket_db';

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
