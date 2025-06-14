import { z } from 'zod';

export const userSchema = z.object({
  email: z.string({ message: "Email cannot be empty" }).email({ message: "Invalid email format" }),
  password: z.string({ message: "Password cannot be empty" }).min(6, { message: "Password must be at least 6 characters long" }),
  name: z.string({ message: "Name cannot be empty" }).min(1, { message: "Name cannot be empty" })
});

// Utility function to format Zod validation errors into user-friendly messages
export function formatZodErrors(error: z.ZodError): string {
  const fieldErrors: { [key: string]: string[] } = {};
  
  // Group errors by field path
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    const fieldName = path || 'root';
    
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = [];
    }
    
    fieldErrors[fieldName].push(issue.message);
  });
  
  // Format as user-friendly message
  const errorMessages = Object.entries(fieldErrors).map(([field, messages]) => {
    const fieldDisplayName = field.charAt(0).toUpperCase() + field.slice(1);
    return `${fieldDisplayName}: ${messages.join(', ')}`;
  });
  
  return errorMessages.join('; ');
}