import { createSafeActionClient } from 'next-safe-action';

export const serverAction = createSafeActionClient({
  handleReturnedServerError: (error) => error.message,
});
