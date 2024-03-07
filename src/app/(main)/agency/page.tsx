import { AgencyDetails } from '@/components/forms/agency-details';
import { getUserDetails, verifyAndAcceptInvitation } from '@/lib/queries';
import {
  AgencyPageQueries,
  AgencyPageQueriesSchema,
} from '@/lib/validations/queries';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

const AgencyPage = async ({
  searchParams,
}: {
  searchParams: AgencyPageQueries;
}) => {
  searchParams = AgencyPageQueriesSchema.parse(searchParams);
  const agencyId = await verifyAndAcceptInvitation();
  const user = await getUserDetails();
  if (agencyId) {
    if (user?.role === 'subaccount-user' || user?.role === 'subaccount-guest') {
      return redirect('/subaccount');
    } else if (user?.role === 'agency-admin' || user?.role === 'agency-owner') {
      if (searchParams.plan) {
        return redirect(
          `/agency/${agencyId}/billing?plan=${searchParams.plan}`
        );
      }

      if (searchParams.state) {
        const statePath = searchParams.state.split('__').at(0);
        const stateAgencyId = searchParams.state.split('___').at(1);
        if (!stateAgencyId) {
          return <div>Not authorized</div>;
        }

        return redirect(
          `/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`
        );
      } else {
        return redirect(`/agency/${agencyId}`);
      }
    } else {
      return <div>Not authorized</div>;
    }
  }

  const authUser = await currentUser();

  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl">Create An Agency</h1>
        <AgencyDetails
          data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }}
        />
      </div>
    </div>
  );
};

export default AgencyPage;
