# Use Node.js as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install system dependencies for Prisma
RUN apk add --no-cache openssl

# Define build arguments (passed during `docker build`)
ARG DATABASE_URL
ARG DIRECT_URL

# Set environment variables from the build arguments
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL

# Copy Prisma schema first
COPY prisma prisma/

# Copy package.json and package-lock.json first (for better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Apply Prisma migrations (comment this if unnecessary)
RUN npx prisma migrate deploy

# Build the Next.js app
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
