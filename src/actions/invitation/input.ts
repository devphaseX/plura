import { role } from './../../schema/index';
import { object, string, z, TypeOf } from 'zod';

export const InvitationSchema = object({
  email: string().email(),
  role: z.enum(role.enumValues).default('subaccount-user'),
});

export type InvitationInput = TypeOf<typeof InvitationSchema>;
