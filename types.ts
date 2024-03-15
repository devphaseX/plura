import { getUserDetails, type getUserPermissions } from '@/lib/queries';
import { User, Notification } from '@/schema';

export type NotificationWithUser =
  | (Notification & {
      user: User;
    })
  | undefined;

export type UserWithPermissionsAndSubAccounts = NonNullable<
  Awaited<ReturnType<typeof getUserPermissions>>
>;

export type AuthUserWithAgencySidebarOptionsSubAccounts = NonNullable<
  Awaited<ReturnType<typeof getUserDetails>>
>;
