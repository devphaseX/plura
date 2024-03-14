import { permissionTable } from '@/schema';
import { createInsertSchema } from 'drizzle-zod';
import { TypeOf } from 'zod';

export const PermissionSchema = createInsertSchema(permissionTable, {
  subAccountId: ({ subAccountId }) => subAccountId.uuid(),
  email: ({ email }) => email.email(),
});

export type PermissionInput = TypeOf<typeof PermissionSchema>;
