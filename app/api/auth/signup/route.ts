import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { generateToken } from '@/utils/jose_jwt';
import { formatZodErrors, userSchema } from '@/utils/schema_validator';

export async function POST(req: NextRequest) {


    try {
        const body = await req.json();

        // Check for missing required inputs
        if (!body.email || !body.name || !body.password) {
            return NextResponse.json({
                status: 'error',
                message: 'Missing required fields',
                fields: {
                    email: !body.email ? 'Email is required' : undefined,
                    name: !body.name ? 'Name is required' : undefined,
                    password: !body.password ? 'Password is required' : undefined,
                }
            }, { status: 400 });
        }

        const validation = userSchema.safeParse(body)

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

        const { email, name, password } = validation.data;

        // Check if user already exists
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({
                status: 'warning',
                message: 'User already exists'
            }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await db.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            },
        });

        // Create verification token
        const token = await generateToken({ email, userId: user.id });

        return NextResponse.json({
            status: 'success',
            message: 'User created successfully',
            result: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                token, // Include the JWT token in the response
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Signup error:', error);
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
