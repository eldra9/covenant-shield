export function sanitizeError(err: unknown) {
  const isCustom = typeof err === 'object' && err !== null && 'statusCode' in err;
  const statusCode = isCustom ? (err as { statusCode: number }).statusCode : 500;
  const message = err instanceof Error ? err.message : 'Internal server error';
  const errors = isCustom ? (err as { errors?: Record<string, string[]> }).errors : undefined;

  return {
    statusCode,
    message,
    errors,
  };
}
