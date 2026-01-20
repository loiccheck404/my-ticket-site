"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables FIRST
dotenv_1.default.config();
// Explicitly set the DATABASE_URL if needed
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://bboy:password123@localhost:5432/my_ticket_db';
// Create Prisma Client with explicit datasource
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL
        }
    }
});
// Optional: Log queries in development
if (process.env.NODE_ENV !== 'production') {
    prisma.$on('query', (e) => {
        console.log('Query: ' + e.query);
    });
}
exports.default = prisma;
