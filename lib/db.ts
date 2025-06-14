import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function testConnection() {
  try {
    await db.$connect();
    return { success: true, timestamp: new Date().toISOString(), message: "Database is connected" };
  } catch (error) {
    throw new Error('Database connection failed');
  }
}

export { db, testConnection };