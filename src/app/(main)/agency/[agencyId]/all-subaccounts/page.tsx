import { getUserDetails } from '@/lib/queries';
import {
  AgencyPageParams,
  AgencyPageParamsSchema,
} from '@/lib/validations/queries';

import { redirect } from 'next/navigation';
import React from 'react';
import { SubaccountList } from './_components/subaccount';

type AllSubaccountsPageProps = {
  params: AgencyPageParams;
};

const AllSubaccountsPage = async ({ params }: AllSubaccountsPageProps) => {
  {
    params = AgencyPageParamsSchema.parse(params ?? {});
  }

  const user = await getUserDetails();

  if (!user) {
    return redirect(
      `/sign-in?callbackUrl=/agency/${params.agencyId}/all-subaccounts`
    );
  }

  if (user.agencyId !== params.agencyId) {
    return redirect(`/agency/${user.agencyId}`);
  }

  return <SubaccountList user={user} />;
};

export default AllSubaccountsPage;
