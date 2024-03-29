import { Unauthorized } from '@/components/unauthorized';
import { getUserDetails, verifyAndAcceptInvitation } from '@/lib/queries';
import {
  AgencyPageQueries,
  AgencyPageQueriesSchema,
} from '@/lib/validations/queries';
import { role } from '@/schema';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

type SubaccountRootPageProps = {
  searchParams: AgencyPageQueries;
};

const SubaccountRootPage = async ({
  searchParams,
}: SubaccountRootPageProps) => {
  {
    searchParams = AgencyPageQueriesSchema.parse(searchParams);
  }

  const authUser = await currentUser();

  if (!authUser) {
    return redirect(`/agency`);
  }

  const agencyId = await verifyAndAcceptInvitation({
    firstName: authUser.firstName as string,
    lastName: authUser.lastName as string,
    email: authUser.emailAddresses[0].emailAddress,
    userId: authUser.id,
    role:
      (authUser.privateMetadata.role as (typeof role.enumValues)[number]) ??
      'subaccount-user',
    imageUrl: authUser.imageUrl,
  });

  if (!agencyId) {
    return <Unauthorized />;
  }

  const user = await getUserDetails();

  if (!user) {
    return redirect('/agency');
  }

  const defaultSubaccountId = user.permissions.at(0)?.subAccountId;
  const { state: stripeAccountLinkedPayload, code: stripeVerifyToken } =
    searchParams;
  if (stripeAccountLinkedPayload) {
    const [statePath, subaccountId] = stripeAccountLinkedPayload.split('___');

    if (subaccountId) {
      return <Unauthorized />;
    }

    return redirect(`/subaccount/${statePath}?code=${stripeVerifyToken}`);
  }

  if (defaultSubaccountId) {
    return redirect(`/subaccount/${defaultSubaccountId}`);
  }

  return <Unauthorized />;
};

export default SubaccountRootPage;
