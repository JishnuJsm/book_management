import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatZodErrors, updatebookSchema } from '@/utils/schema_validator';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;
        const book = await db.book.findFirst({
            where: {
                id: id
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
            message: 'Book fetched successfully',
            result: book
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json();

        const validation = updatebookSchema.safeParse(body)

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

        const { id } = await params;

        const { title, author, publishedDate, isbn } = body;

        // Check if at least one field is present
        const isAnyFieldPresent = [title, author, publishedDate, isbn].some(value => value !== undefined && value !== '');

        if (!isAnyFieldPresent) {
            return NextResponse.json({
                status: 'error',
                message: 'At least one field must be provided',
            }, { status: 400 });
        }

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
                id
            }
        });

        if (!existingBook) {
            return NextResponse.json({
                status: 'warning',
                message: 'Book not found with this ID',
            }, { status: 404 });
        }

        if (existingBook.userId !== userId) {
            return NextResponse.json({
                status: 'error',
                message: 'You are not authorized to update this book',
            }, { status: 403 });
        }

        const sameisbnBook = await db.book.findFirst({
            where: {
                isbn: isbn,
                NOT: {
                    id: id,
                }
            }
        });

        if (isbn && sameisbnBook) {
            return NextResponse.json({
                status: 'warning',
                message: 'A book with this ISBN already exists',
            }, { status: 400 });
        }

        const book = await db.book.update({
            where: {
                id
            },
            data: {
                title,
                author,
                publishedDate,
                isbn
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
            message: 'Book updated successfully',
            result: book
        }, { status: 201 });
    } catch (error) {
        console.error('updating book error:', error);

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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({
                status: 'warning',
                message: 'User Authenticated, but userId is missing in headers, please login again',
            },
                { status: 400 });
        }

        const { id } = await params;

        // Check if book exists or not
        const existingBook = await db.book.findFirst({
            where: {
                id: id
            }
        });

        if (!existingBook) {
            return NextResponse.json({
                status: 'warning',
                message: 'Book not found with this ID',
            }, { status: 404 });
        }

        if (existingBook.userId !== userId) {
            return NextResponse.json({
                status: 'error',
                message: 'You are not authorized to delete this book',
            }, { status: 403 });
        }

        await db.book.delete({
            where: {
                id: id
            }
        });

        return NextResponse.json({
            status: 'success',
            message: 'Book deleted successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('deleting book error:', error);

        return NextResponse.json({
            status: 'error',
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}