import { role, userTable } from '@/schema';
import { createInsertSchema } from 'drizzle-zod';
import { TypeOf, z } from 'zod';

export const UserSchema = createInsertSchema(userTable, {
  email: ({ email }) => email.email(),
  avatarUrl: ({ avatarUrl }) => avatarUrl.url(),
  agencyId: ({ agencyId }) => agencyId.uuid(),
  userId: ({ userId }) => userId.min(3),
  role: z.enum(role.enumValues).default('subaccount-user'),
}).extend({ name: z.string().min(3).optional() });

export type UserInput = TypeOf<typeof UserSchema>;
