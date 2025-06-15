# Book Management System

A modern web application for managing books built with Next.js and Supabase.

## Tech Stack

- **Frontend**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Shadcn UI Components
  - React Query for data fetching

- **Backend**
  - Next.js API Routes
  - Supabase (PostgreSQL)
  - Prisma ORM
  - Jose (JWT authentication)
  - Bcrypt (Password hashing)
  - Zod (Schema validation)

## Prerequisites

- Node.js 18+
- Git
- Supabase account

## Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL="your_supabase_postgresql_database_url"
DIRECT_URL="your_supabase_postgresql_direct_url"

# Authentication
JWT_SECRET="your_jwt_secret_key"
```

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/JishnuJsm/book_management.git
cd book-management
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

4. **Start development server**
```bash
npm run dev
```

Visit http://localhost:3000 to see the application

## Authentication Flow

1. **Registration**
   - User submits email/password
   - Password is hashed using bcrypt
   - User data stored in Supabase
   - JWT token generated using Jose

2. **Login**
   - User provides credentials
   - Password verified with bcrypt
   - JWT token generated and returned
   - Token stored in cookies/local storage

3. **Books Routes**
   - JWT verification middleware
   - API route protection for other than GET methods

## Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  books     Book[]
  createdAt DateTime @default(now())
}

model Book {
  id            String   @id @default(uuid())
  title         String
  author        String
  isbn          String?
  publishedDate DateTime?
  userId        String
  user          User     @relation(fields: [userId], references: [id])
}
```

## API Endpoints

See detailed API documentation in `/app/api/README.md`

## Deployment

### Docker & Azure App Service Deployment

1. **Build Docker Image**
```bash
docker build --build-arg DATABASE_URL="your_database_url" --build-arg DIRECT_URL="your_direct_url" -t book_management .
```

2. **Azure Setup**
- Create a free Azure account at [Azure Portal](https://azure.microsoft.com/en-in/free/apps/search/)
- Install Azure CLI from [Microsoft Documentation](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- Verify installation:
```bash
az --version
```

3. **Push to Azure Container Registry**
```bash
# Login to Azure
az login

# Login to Azure Container Registry
az acr login --name bookmanagement

# Tag your docker image
docker tag book_management bookmanagement.azurecr.io/samples/book_management

# Push image to registry
docker push bookmanagement.azurecr.io/samples/book_management
```

4. **Deploy to Azure App Service**
- Go to Azure Portal
- Create new Web App service
- Select container deployment option
- Choose your pushed container image
- Configure environment variables
- Deploy

### Local Docker Development

Run the container locally:
```bash
docker run -p 3000:3000 book_management
```