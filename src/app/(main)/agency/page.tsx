import { getUserDetails, verifyAndAcceptInvitation } from '@/lib/queries';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

const AgencyPage = async () => {
  const agencyId = await verifyAndAcceptInvitation();
  const user = await getUserDetails();

  return <div>Agency</div>;
};

export default AgencyPage;
