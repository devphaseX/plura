import { z, TypeOf } from 'zod';

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
