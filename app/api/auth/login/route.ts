import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { generateToken } from '@/utils/jose_jwt';
import { formatZodErrors, loginuserSchema } from '@/utils/schema_validator';

export async function POST(req: NextRequest) {

    try {
        const body = await req.json();

        // Check for missing required inputs
        if (!body.email || !body.password) {
            return NextResponse.json({
                status: 'error',
                message: 'Missing required fields',
                fields: {
                    email: !body.email ? 'Email is required' : undefined,
                    password: !body.password ? 'Password is required' : undefined,
                }
            }, { status: 400 });
        }

        const validation = loginuserSchema.safeParse(body)

        if (!validation.success) {
            const errors = formatZodErrors(validation.error);
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors
                },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;

        // Check if user exists or not
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({
                status: 'warning',
                message: 'User not exists'
            }, { status: 404 });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({
                status: 'error',
                message: 'Invalid user password'
            }, { status: 401 });
        }

        // Create verification token
        const token = await generateToken({ email, userId: user.id });

        return NextResponse.json({
            status: 'success',
            message: 'User login successfully',
            result: { token }
        }, { status: 201 });
    } catch (error) {
        console.error('login error:', error);
        if (error instanceof Error ? error.message : String(error) == 'Unexpected end of JSON input') {
            return NextResponse.json({
                status: 'error',
                message: 'Invalid input data',
                error: "Request body is not valid JSON or is empty",
            }, { status: 400 });
        }

        return NextResponse.json({
            status: 'error',
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
