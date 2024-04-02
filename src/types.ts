import {
  type getUserDetails,
  type getUserWithAgencyAssets,
  type getUserPermissions,
  type getMedia,
} from '@/lib/queries';
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

export type Option = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export interface DataTableFilterOption<TData> {
  id?: string;
  label: string;
  value: keyof TData | string;
  items: Option[];
  isMulti?: boolean;
}

export interface DataTableSearchableColumn<TData> {
  id: keyof TData;
  title: string;
}

export interface DataTableFilterableColumn<TData>
  extends DataTableSearchableColumn<TData> {
  options: Option[];
}

export type GetUserWithAgencyAssetsReturnType = Awaited<
  ReturnType<typeof getUserWithAgencyAssets>
>[number];

export type GetMediaFiles = NonNullable<Awaited<ReturnType<typeof getMedia>>>;
