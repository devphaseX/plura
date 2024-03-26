'use client';

import { useDataTable } from '@/hooks/useDataTable';
import { use } from 'react';
import { TeamData, columns, searchableColumns } from './columns';
import { DataTable } from './data-table';
import { Table } from '@tanstack/react-table';
import { GetUserWithAgencyAssetsReturnType } from '@/types';
import { Plus } from 'lucide-react';
import SendInvitation from '@/components/forms/send-invitation';

type TeamTableProps = {
  teamDataPromise: Promise<GetUserWithAgencyAssetsReturnType[]>;
};

export const TeamTable = ({ teamDataPromise }: TeamTableProps) => {
  const teams = use(teamDataPromise);

  const { dataTable } = useDataTable({
    columns,
    data: teams,
    searchableColumns,
    pageCount: teams.length,
  });

  return (
    <div>
      <DataTable
        dataTable={dataTable}
        columns={columns}
        searchableColumns={searchableColumns}
        modalChildren={<SendInvitation />}
        actionButtonText={
          <>
            <Plus size={15} /> Add
          </>
        }
        defaultSearchColumn="name"
      ></DataTable>
    </div>
  );
};
