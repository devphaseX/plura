import { agencyTable } from '@/schema';
import { createInsertSchema } from 'drizzle-zod';

import { phone as validatePhone } from 'phone';
import z, { TypeOf } from 'zod';

export const CreateAgencyFormSchema = createInsertSchema(agencyTable, {
  name: ({ name }) =>
    name.min(2, { message: 'Agency name must be atleast 2 chars' }),
  companyEmail: ({ companyEmail }) => companyEmail.email(),
  companyPhone: ({ companyPhone }) =>
    companyPhone.refine(
      (phone) => validatePhone(phone, { country: 'NG' }).isValid,
      {
        message: 'Invalid phone no format',
      }
    ),
  address: ({ address }) => address.min(1),
  city: ({ city }) => city.min(1),
  zipCode: ({ zipCode }) => zipCode.min(1),
  state: ({ state }) => state.min(1),
  country: ({ country }) => country.min(1),
}).partial({ customerId: true });

export type CreateAgencyFormData = TypeOf<typeof CreateAgencyFormSchema>;

export const upsertAgencySchema = z.union([
  z.object({
    type: z.enum(['update']),
    data: CreateAgencyFormSchema.partial({
      name: true,
      address: true,
      agencyLogo: true,
      city: true,
      companyPhone: true,
      state: true,
      country: true,
      zipCode: true,
      goal: true,
      customerId: true,
      whiteLabel: true,
      connectedAccountId: true,
    }),
  }),

  z.object({ type: z.enum(['create']), data: CreateAgencyFormSchema }),
]);

export type UpsertAgencyInput = TypeOf<typeof upsertAgencySchema>;
