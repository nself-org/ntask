import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name is too long');

export const urlSchema = z.string().url('Invalid URL');

export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

export function createFormSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

export type InferFormData<T extends z.ZodType> = z.infer<T>;

export function validateField<T extends z.ZodType>(schema: T, value: unknown): { valid: boolean; error: string | null } {
  const result = schema.safeParse(value);
  return result.success
    ? { valid: true, error: null }
    : { valid: false, error: result.error.errors[0]?.message || 'Invalid value' };
}

export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.errors) {
    const path = issue.path.join('.');
    if (!errors[path]) errors[path] = issue.message;
  }
  return errors;
}
