'use client';

import {
  SubaccountTable,
  AgencySidebarOption,
  SubaccountSidebarOption,
  User,
} from '@/schema';

type MenuOptionsProps = {
  defaultOpen?: boolean;
  subaccount: SubaccountTable[];
  sidebarOptions: AgencySidebarOption[] | SubaccountSidebarOption[];
  sidebarLogo: string;
  details: unknown;
  user: User;
  id: string;
};

const MenuOptions = ({
  defaultOpen,
  subaccount,
  sidebarLogo,
  sidebarOptions,
  user,
  details,
  id,
}: MenuOptionsProps) => {
  return <div></div>;
};

export { MenuOptions };
