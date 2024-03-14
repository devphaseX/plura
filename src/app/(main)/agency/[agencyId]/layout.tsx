import {
  getNotificationWithUser,
  getUserDetails,
  verifyAndAcceptInvitation,
} from '@/lib/queries';
import { AgencyPageParams } from '@/lib/validations/queries';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import UnauthorizedPage from '../unauthorized/page';
import { Sidebar } from '@/components/sidebar';
import { BlurPage } from '@/components/global/blur-page';
import { InfoBar } from '@/components/global/info-bar';
import { User } from '@/schema';

type LayoutProps = {
  children: React.ReactNode;
  params: AgencyPageParams;
};

const Layout = async ({ children, params }: LayoutProps) => {
  const agencyId = await verifyAndAcceptInvitation();
  const user = await currentUser();
  if (!user) {
    return redirect('/');
  }

  if (!agencyId) {
    return redirect('/agency');
  }

  if (
    user.privateMetadata.role !== 'agency-owner' &&
    user.privateMetadata.role !== 'agency-admin'
  ) {
    return <UnauthorizedPage />;
  }

  let currentNotifications = await getNotificationWithUser(agencyId);
  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={params.agencyId} type="agency" />
      <div className="md:pl-[300px]">
        <InfoBar
          notifications={currentNotifications}
          role={
            (user.privateMetadata.role as User['role']) ??
            (await getUserDetails())?.role
          }
        />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default Layout;
