import { SignJWT } from 'jose';

// Secret key for signing the token (must be a Uint8Array)
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

export async function generateToken({userId, email}: { userId: string; email: string }) {
  const jwt = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' }) // Algorithm for signing
    .setIssuedAt() // Set issued time
    .setExpirationTime('2h') // Token expires in 2 hours
    .sign(secretKey); // Sign the token with the secret key

  return jwt;
}