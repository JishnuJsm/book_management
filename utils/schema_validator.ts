import { z } from 'zod';

export const userSchema = z.object({
  email: z.string({ message: "Email cannot be empty" }).email({ message: "Invalid email format" }),
  password: z.string({ message: "Password cannot be empty" }).min(6, { message: "Password must be at least 6 characters long" }),
  name: z.string({ message: "Name cannot be empty" }).min(1, { message: "Name cannot be empty" })
});

export const loginuserSchema = z.object({
  email: z.string({ message: "Email cannot be empty" }).email({ message: "Invalid email format" }),
  password: z.string({ message: "Password cannot be empty" }).min(6, { message: "Password must be at least 6 characters long" }),
});

export const bookSchema = z.object({
  title: z.string({ message: "Title cannot be empty" }).min(1, { message: "Title cannot be empty" }),
  author: z.string({ message: "Author cannot be empty" }).min(1, { message: "Author cannot be empty" }),
  publishedDate: z.string({ message: "Published date cannot be empty" }),
  isbn: z.string({ message: "ISBN cannot be empty" }).min(1, { message: "ISBN cannot be empty" }),
});

export const updatebookSchema = z.object({
  title: z.string({ message: "Title cannot be empty" }).min(1, { message: "Title cannot be empty" }).optional(),
  author: z.string({ message: "Author cannot be empty" }).min(1, { message: "Author cannot be empty" }).optional(),
  publishedDate: z.string({ message: "Published date cannot be empty" }).optional(),
  isbn: z.string({ message: "ISBN cannot be empty" }).min(1, { message: "ISBN cannot be empty" }).optional()
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