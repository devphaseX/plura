import { BlurPage } from '@/components/global/blur-page';
import { InfoBar } from '@/components/global/info-bar';
import { Sidebar } from '@/components/sidebar';
import { Unauthorized } from '@/components/unauthorized';
import {
  getNotificationWithUser,
  getUserDetails,
  verifyAndAcceptInvitation,
} from '@/lib/queries';
import { SubaccountParams } from '@/lib/validations/queries';
import { role, User } from '@/schema';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
type SubaccountLayoutProps = {
  children: React.ReactNode;
  params: SubaccountParams;
};

const SubaccountLayout = async ({
  params,
  children,
}: SubaccountLayoutProps) => {
  const authUser = await currentUser();
  if (!authUser) {
    return redirect('/subaccount');
  }

  const agencyId = await verifyAndAcceptInvitation({
    firstName: authUser.firstName as string,
    lastName: authUser.lastName as string,
    email: authUser.emailAddresses[0].emailAddress,
    role:
      (authUser.privateMetadata.role as (typeof role.enumValues)[number]) ??
      'subaccount-user',
    userId: authUser.id,
    imageUrl: authUser.imageUrl,
  });

  if (!agencyId) {
    return <Unauthorized />;
  }

  const user = await getUserDetails();

  if (!user) {
    return <Unauthorized />;
  }

  if (!authUser.privateMetadata.role) {
    return <Unauthorized />;
  } else {
    const allowedAccessPermissions = user?.permissions ?? [];
    const allowedSubaccountAccess = !!allowedAccessPermissions.find(
      (permission) => permission.subAccountId === params.subaccountId
    );

    if (!allowedSubaccountAccess) {
      return <Unauthorized />;
    }
  }

  const currentNotifications = await getNotificationWithUser(
    agencyId,
    params.subaccountId
  );

  return (
    <div className="h-screen">
      <Sidebar id={params.subaccountId} type="subaccount" />
      <div className="md:pl-[300px] h-full flex flex-col">
        <InfoBar
          notifications={currentNotifications}
          role={authUser.privateMetadata.role as User['role']}
        />
        <div className="relative flex-1">{children}</div>
      </div>
    </div>
  );
};

export default SubaccountLayout;
