import { AgencyDetails } from '@/components/forms/agency-details';
import { UserDetails } from '@/components/forms/user-details';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getUserDetails } from '@/lib/queries';
import {
  AgencyPageParams,
  AgencyPageParamsSchema,
} from '@/lib/validations/queries';
import { Agency } from '@/schema';
import { currentUser } from '@clerk/nextjs';
import { notFound, redirect } from 'next/navigation';

type SettingsPageProps = {
  params: AgencyPageParams;
};

const SettingsPage = async ({ params }: SettingsPageProps) => {
  {
    const safeParams = AgencyPageParamsSchema.safeParse(params);
    if (!safeParams.success) {
      return notFound();
    }
    params = safeParams.data;
    const authUser = await currentUser();
    if (!authUser) {
      return redirect('/sign-in');
    }
  }

  const userDetails = await getUserDetails();

  if (!userDetails) {
    return null;
  }

  if (userDetails.agencyId !== params.agencyId) {
    return redirect(`/agency/${params.agencyId}/unauthorized`);
  }

  return (
    <div className="flex lg:flex-row flex-col gap-4">
      <AgencyDetails data={userDetails.agency as Agency} />
      <UserDetails
        type="agency"
        id={params.agencyId}
        subaccounts={userDetails.agency?.subaccounts}
        userDetails={userDetails}
      />
    </div>
  );
};

export default SettingsPage;
