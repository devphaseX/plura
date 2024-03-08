import { verifyAndAcceptInvitation } from '@/lib/queries';
import { AgencyPageParams } from '@/lib/validations/queries';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import UnauthorizedPage from '../unauthorized/page';

type LayoutProps = {
  children: React.ReactNode;
  params: AgencyPageParams;
};

const Layout = async ({ children, params }: LayoutProps) => {
  const agencyId = await verifyAndAcceptInvitation();
  const user = await currentUser();
  console.log({ agencyId, meta: user?.privateMetadata });
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

  let currentNotifications = [];
  return <div>{children}</div>;
};

export default Layout;
