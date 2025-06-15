import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookSchema, formatZodErrors } from '@/utils/schema_validator';

export async function GET() {

    try {
        const books = await db.book.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        createdAt: true
                    }
                }
            }
        });

        return NextResponse.json({
            status: 'success',
            message: 'Books fetched successfully',
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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Check for missing required inputs
        if (!body.title || !body.author || !body.publishedDate || !body.isbn) {
            return NextResponse.json({
                status: 'error',
                message: 'Missing required fields',
                fields: {
                    title: !body.title ? 'Title is required' : undefined,
                    author: !body.author ? 'Author is required' : undefined,
                    publishedDate: !body.publishedDate ? 'Published date is required' : undefined,
                    isbn: !body.isbn ? 'ISBN is required' : undefined
                }
            }, { status: 400 });
        }

        const validation = bookSchema.safeParse(body)

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

        const { title, author, publishedDate, isbn } = body;

        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({
                status: 'warning',
                message: 'User Authenticated, but userId is missing in headers, please login again',
            },
                { status: 400 });
        }

        // Check if book exists or not
        const existingBook = await db.book.findFirst({
            where: {
                isbn: isbn
            }
        });
        if (existingBook) {
            return NextResponse.json({
                status: 'warning',
                message: 'Book already exists with this ISBN',
            }, { status: 409 });
        }

        const book = await db.book.create({
            data: {
                title,
                author,
                publishedDate,
                isbn,
                userId
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        createdAt: true
                    }
                }
            }
        });

        return NextResponse.json({
            status: 'success',
            message: 'Book added successfully',
            result: book
        }, { status: 201 });
    } catch (error) {
        console.error('creating book error:', error);

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