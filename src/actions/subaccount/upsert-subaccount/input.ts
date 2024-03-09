import { createInsertSchema } from 'drizzle-zod';
import { phone as validatePhone } from 'phone';
import { subaccountTable } from '@/schema';
import { TypeOf } from 'zod';

export const CreateSubaccountSchema = createInsertSchema(subaccountTable, {
  name: ({ name }) =>
    name.min(2, { message: 'Subaccount name must be at least 2 chars' }),
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
});

export type CreateSubaccountInput = TypeOf<typeof CreateSubaccountSchema>;

export const UpdateSubaccountSchema = CreateSubaccountSchema.partial({
  name: true,
  companyEmail: true,
  companyPhone: true,
  address: true,
  city: true,
  zipCode: true,
  state: true,
  country: true,
});

export type UpdateSubaccountInput = TypeOf<typeof UpdateSubaccountSchema>;
