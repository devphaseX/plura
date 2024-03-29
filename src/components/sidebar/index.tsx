import { getUserDetails } from '@/lib/queries';
import { Subaccount } from '@/schema';
import { MenuOptions } from './menu-options';

type SidebarProps = {
  id: string;
  type: 'agency' | 'subaccount';
};

export const Sidebar = async ({ id, type }: SidebarProps) => {
  const user = await getUserDetails();
  if (!user) return null;

  if (!user.agency) return;

  console.log(user.agency.subaccounts, id);

  const details =
    type === 'agency'
      ? user.agency
      : user.agency.subaccounts?.find((subaccount) => subaccount.id === id);

  const whiteLabledAgency = user.agency.whiteLabel;

  if (!details) return;

  let sidebarLogo = user.agency.agencyLogo ?? '/assets/plura-logo.svg';

  if (!whiteLabledAgency) {
    if (type === 'subaccount') {
      sidebarLogo =
        (details as Subaccount).subAccountLogo ?? user.agency.agencyLogo;
    }
  }

  const sidebarOptions =
    type === 'agency'
      ? user.agency.agencySidebarOptionTable ?? []
      : 'agencyId' in details
      ? details.sidebarOptions ?? []
      : [];

  const accessibleSubaccounts = user.agency.subaccounts.filter((subaccount) =>
    user.permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access
    )
  );

  return (
    <>
      <MenuOptions
        defaultOpen
        details={details as any}
        id={id}
        user={user as any}
        sidebarLogo={sidebarLogo}
        sidebarOptions={sidebarOptions}
        subaccounts={accessibleSubaccounts}
      />
      <MenuOptions
        details={details as any}
        id={id}
        user={user as any}
        sidebarLogo={sidebarLogo}
        sidebarOptions={sidebarOptions}
        subaccounts={accessibleSubaccounts}
      />
    </>
  );
};
