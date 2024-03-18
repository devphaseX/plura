import { type ClassValue, clsx } from 'clsx';
import { HookResult } from 'next-safe-action/hooks';
import { twMerge } from 'tailwind-merge';
import { Schema } from 'zod';
import { GENERIC_ERROR_MESSAGE } from './constant';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getActionErrorMessage(
  result: Omit<HookResult<Schema, unknown>, 'data'>
) {
  if (result.serverError) {
    return result.serverError;
  }

  const validationErrors = Object.values(result.validationErrors ?? {});
  if (validationErrors.length) {
    return validationErrors[0]!.toString();
  }

  return GENERIC_ERROR_MESSAGE;
}

export function termToSlug(term: string) {
  return encodeURIComponent(term.replace(/(\-)|(\s+)/g, '-$1'));
}

export function slugToTerm(slug: string) {
  return decodeURIComponent(slug).replace(/(\-){1,2}/, (match) =>
    match === '-' ? ' ' : '-'
  );
}

export class ActionError extends Error {
  constructor(message = GENERIC_ERROR_MESSAGE, options?: ErrorOptions) {
    super(message, options);
  }
}
