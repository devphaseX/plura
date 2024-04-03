import { AgencyDetails } from '@/components/forms/agency-details';
import { getUserDetails, verifyAndAcceptInvitation } from '@/lib/queries';
import {
  AgencyPageQueries,
  AgencyPageQueriesSchema,
} from '@/lib/validations/queries';
import { role } from '@/schema';
import { currentUser } from '@clerk/nextjs';
import { ColumnAliasProxyHandler } from 'drizzle-orm';
import { redirect } from 'next/navigation';

const AgencyPage = async ({
  searchParams,
}: {
  searchParams: AgencyPageQueries;
}) => {
  searchParams = AgencyPageQueriesSchema.parse(searchParams);

  const authUser = await currentUser();
  if (!authUser) {
    return redirect('/sign-in?callbackUrl=/agency');
  }
  const userDetails = await getUserDetails();

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

  if (agencyId) {
    if (
      userDetails?.role === 'subaccount-user' ||
      userDetails?.role === 'subaccount-guest'
    ) {
      return redirect('/subaccount');
    } else if (
      userDetails?.role === 'agency-admin' ||
      userDetails?.role === 'agency-owner'
    ) {
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
