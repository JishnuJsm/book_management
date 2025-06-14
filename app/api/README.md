# Book Management API Documentation

This documentation covers the API endpoints for the Book Management system built with Next.js API routes.

## Environment Variables

Create a `.env` file in the root directory with these variables:

```env
# Database Configuration
DATABASE_URL="your_supabase_postgresql_database_url"
DIRECT_URL="your_supabase_postgresql_direct_url"

# Authentication
JWT_SECRET="your_jwt_secret"
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User signup
- `POST /api/auth/login` - User login

### Current User
- `GET /api/user/me` - User signup (JWT Required)

### Books
- `GET /api/books` - Fetch all books
- `POST /api/books` - Create a new book (JWT Required)
- `GET /api/books/[id]` - Get a specific book
- `PUT /api/books/[id]` - Update a book (JWT Required)
- `DELETE /api/books/[id]` - Delete a book (JWT Required)

## Request/Response Examples

### Create Book
```typescript
// POST /api/books
Request body:
{
  "title": "Book Title",
  "author": "Author Name",
  "publishedDate": "2008-09-13T18:30:00.000Z",
  "isbn": "1234567890"
}

Request header:
{
    'Authorization': 'Bearer eyJhb....'
}

Response (200 OK):
{
    "status": "success",
    "message": "Book added successfully",
    "result": {
        "id": "book_id",
        "title": "Book Title",
        "author": "Author Name",
        "isbn": "1234567890",
        "publishedDate": "2008-09-13T18:30:00.000Z",
        "user": {
            "id": "579bfb59-ccee-4cd3-b9b6-9ae4f611bc29",
            "name": "Tester",
            "email": "demo@books.io",
            "createdAt": "2025-06-14T08:33:07.529Z"
        }
    }
}
```

### Error Responses
```typescript
// Error Response Format
{
  "status": "error or warning",
  "message": "Error Message"
}
```

## Authentication
Enpoints were protected with JWT token includes 
- .

## Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

API will be available at `http://localhost:3000/api`