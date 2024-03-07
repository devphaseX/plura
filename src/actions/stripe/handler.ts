'use server';

import { serverAction } from '../../lib/server-action';
import { stripe } from '../../lib/stripe';
import { CreateStripeCustomerSchema } from './input';
import { currentUser } from '@clerk/nextjs';
export const createStripeCustomer = serverAction(
  CreateStripeCustomerSchema,
  async (formData) => {
    try {
      const user = await currentUser();
      if (!user) throw new Error('Unauthorized');

      const customer = await stripe.customers.create(formData);
      return { customerId: customer.id };
    } catch (e) {
      console.log(e);
      throw new Error('An error occurred while creating stripe account', {
        cause: e,
      });
    }
  }
);
