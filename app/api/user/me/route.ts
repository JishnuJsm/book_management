import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {

    try {
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({
                status: 'warning',
                message: 'User Authenticated, but userId is missing in headers, please login again',
            },
                { status: 400 });
        }

        // Check if user exists or not
        const user = await db.user.findFirst({ 
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                password: false
            }
        });

        if (!user) {
            return NextResponse.json({
                status: 'warning',
                message: 'User not exists'
            }, { status: 404 });
        }

        return NextResponse.json({
            status: 'success',
            message: 'User fetched successfully',
            result: user
        }, { status: 201 });
    } catch (error) {
        console.error('fetching user error:', error);

        return NextResponse.json({
            status: 'error',
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
