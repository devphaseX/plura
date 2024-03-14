import { UserDetails } from '@/components/forms/user-details';
import { getUserDetails } from '@/lib/queries';
import {
  AgencyPageParams,
  AgencyPageParamsSchema,
} from '@/lib/validations/queries';
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
      <AgencyDetails data={userDetails.agency} />
      <UserDetails
        type="agency"
        id={params.agencyId}
        subaccount={userDetails.agency?.subaccounts}
        userDetails={userDetails}
      />
    </div>
  );
};

export default SettingsPage;
