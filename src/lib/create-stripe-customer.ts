'use server';

import { TypeOf, z } from 'zod';
import { serverAction } from './server-action';
import { getUserDetails } from './queries';
import { stripe } from './stripe';

export const CreateStripeCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(3),
  shipping: z.object({
    address: z.object({
      city: z.string().min(1),
      country: z.string().min(2),
      line1: z.string().min(1),
      postal_code: z.string().min(2),
      state: z.string().min(2),
    }),
    name: z.string().min(3),
  }),
  address: z.object({
    city: z.string().min(1),
    country: z.string().min(2),
    line1: z.string().min(1),
    postal_code: z.string().min(2),
    state: z.string().min(2),
  }),
});

export type CreateStripCustomerInput = TypeOf<
  typeof CreateStripeCustomerSchema
>;
export const createStripeCustomer = serverAction(
  CreateStripeCustomerSchema,
  async (formData) => {
    try {
      const user = await getUserDetails();
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
