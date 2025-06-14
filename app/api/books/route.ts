import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {

    try {
        const books = await db.book.findMany();

        return NextResponse.json({
            status: 'success',
            message: 'User fetched successfully',
            count: books.length,
            result: books
        }, { status: 200 });
    } catch (error) {
        console.error('fetching books error:', error);

        return NextResponse.json({
            status: 'error',
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}