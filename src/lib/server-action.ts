'use server';

import { createSafeActionClient } from 'next-safe-action';
import { GENERIC_ERROR_MESSAGE } from './constant';
import { getUserDetails } from './queries';
import { ActionError } from './utils';

export const serverAction = createSafeActionClient({
  handleReturnedServerError: (error) =>
    error instanceof ActionError ? error.message : GENERIC_ERROR_MESSAGE,
});

export const protectServerAction = createSafeActionClient({
  handleReturnedServerError: (error) =>
    error instanceof ActionError ? error.message : GENERIC_ERROR_MESSAGE,
  middleware: async () => {
    const userDetails = await getUserDetails();
    if (!userDetails) {
      throw new ActionError('Authenication required');
    }

    return userDetails;
  },
});

export const agencyAdminAndOwnerServerAction = createSafeActionClient({
  handleReturnedServerError: (error) =>
    error instanceof ActionError ? error.message : GENERIC_ERROR_MESSAGE,
  middleware: async () => {
    const userDetails = await getUserDetails();
    if (!userDetails) {
      throw new ActionError('Authenication required');
    }

    if (
      userDetails.role !== 'agency-owner' &&
      userDetails.role !== 'agency-admin'
    ) {
      throw new ActionError('Insufficient permission');
    }

    return userDetails;
  },
});
