'use server';

import { agencyTable } from '@/schema';
import { createInsertSchema } from 'drizzle-zod';

import { phone as validatePhone } from 'phone';
import { TypeOf } from 'zod';

export const CreateAgencyFormSchema = createInsertSchema(agencyTable, {
  name: ({ name }) =>
    name.min(2, { message: 'Agency name must be atleast 2 chars' }),
  companyEmail: ({ companyEmail }) => companyEmail.email(),
  companyPhone: ({ companyPhone }) =>
    companyPhone.refine((phone) => validatePhone(phone).isValid, {
      message: 'Invalid phone no format',
    }),
  address: ({ address }) => address.min(1),
  city: ({ city }) => city.min(1),
  zipCode: ({ zipCode }) => zipCode.min(1),
  state: ({ state }) => state.min(1),
  country: ({ country }) => country.min(1),
});

export type CreateAgencyFormData = TypeOf<typeof CreateAgencyFormSchema>;
