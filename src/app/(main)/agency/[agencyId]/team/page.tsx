import { db } from '@/lib/db';
import { getUserDetails, getUserWithAgencyAssets } from '@/lib/queries';
import {
  AgencyPageParams,
  AgencyPageParamsSchema,
} from '@/lib/validations/queries';
import { agencyTable } from '@/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import React, { Suspense } from 'react';
import { TeamTable } from './_components/team-table';
import { DataTableSkeleton } from './_components/data-table-skeleton';
import { columns, searchableColumns } from './_components/columns';

type TeamPageProps = {
  params: AgencyPageParams;
};

const TeamPage = async ({ params }: TeamPageProps) => {
  {
    params = AgencyPageParamsSchema.parse(params);
  }

  const authUser = await getUserDetails();

  const [queriedAgency] = await db
    .select()
    .from(agencyTable)
    .where(eq(agencyTable.id, params.agencyId));

  if (!queriedAgency) {
    return notFound();
  }

  if (authUser?.agencyId !== params.agencyId) {
    return redirect(`/agency/unauthorized`);
  }

  return (
    <div>
      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={columns.length}
            searchableColumnCount={searchableColumns.length}
          />
        }
      >
        <TeamTable teamDataPromise={getUserWithAgencyAssets(params.agencyId)} />
      </Suspense>
    </div>
  );
};

export default TeamPage;
