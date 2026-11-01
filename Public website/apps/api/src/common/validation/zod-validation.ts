import { ZodSchema, ZodError } from 'zod';

export function validatePayload<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join('.') || 'general';
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });
      const customErr = new Error('Validation failed');
      (customErr as unknown as { statusCode: number; errors: Record<string, string[]> }).statusCode = 400;
      (customErr as unknown as { statusCode: number; errors: Record<string, string[]> }).errors = fieldErrors;
      throw customErr;
    }
    throw error;
  }
}
