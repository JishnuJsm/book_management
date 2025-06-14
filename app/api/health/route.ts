import { testConnection } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    const dbStatus = await testConnection();

    // Return health status
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
