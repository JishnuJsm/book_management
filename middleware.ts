import { NextRequest, NextResponse } from 'next/server'

export default async function middleware(req: NextRequest) {
    // 1. Check if the current route is protected or public
    const path = req.nextUrl.pathname
    const method = req.method

    if (path.split('/').includes('books') && method === 'GET') {
        return NextResponse.next()
    }

    // 2. Get Bearer token from the request headers
    const authHeader = req.headers.get('Authorization')

    // 3. If the authHeader is not present, return a 401 Unauthorized response
    if (!authHeader) {
        return NextResponse.json(
            { message: 'Unauthorized or missing Authorization header' },
            { status: 401 }
        )
    }

    // 4. Extract the token from the authHeader and verify
    const token = authHeader.split(' ')[1]
    const { verifyToken } = await import('@/utils/jose_jwt')
    const session = await verifyToken(token)

    // 5. Return if the user is not authenticated
    if (!session || !session.userId) {
        return NextResponse.json(
            { message: 'Unauthorized or invalid token' },
            { status: 401 }
        )
    }

    // 6. Set userId in the request headers as x-user-id
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', String(session.userId));

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/api/user/:path*', '/api/books/:path*'],
}