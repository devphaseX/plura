import { User, Notification } from '@/schema';

export type NotificationWithUser =
  | (Notification & {
      user: User;
    })
  | undefined;
