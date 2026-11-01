export function getFriendlyErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  if (typeof error === 'string') return error;

  if (typeof error === 'object' && error !== null) {
    const err = error as { message?: string; statusCode?: number };

    if (err.statusCode === 429) {
      return 'Too many attempts. For security reasons, please pause a few minutes before trying again.';
    }

    if (err.statusCode === 404) {
      return 'The requested record was not found or the verification credentials did not match.';
    }

    if (err.statusCode === 400) {
      return err.message || 'Please verify the submitted details and correct any highlighted errors.';
    }

    if (err.statusCode === 500) {
      return 'Our secure intake system encountered a temporary error. Please try again or call our 24/7 Operations Command.';
    }

    if (err.message) return err.message;
  }

  return 'Unable to reach the Covenant Shield dispatch server. Please check your connection.';
}
