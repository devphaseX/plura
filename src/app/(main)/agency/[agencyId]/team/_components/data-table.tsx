'use client';

import { CustomModal } from '@/components/global/custom-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useModal } from '@/providers/modal-provider';
import { DataTableFilterableColumn, DataTableSearchableColumn } from '@/types';
import {
  ColumnDef,
  Table as TanstackTable,
  flexRender,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

type DataTableProps<TData, TValue> = {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type TanstackTable<TData>
   */
  dataTable: TanstackTable<TData>;

  /**
   * The columns of the table
   * @default []
   * @type ColumnDef<TData, TValue>[]
   */
  columns: ColumnDef<TData, TValue>[];

  /**
   * The searchable columns of the table
   * @default []
   * @type {id: keyof TData, title: string}[]
   * @example searchableColumns={[{ id: "title", title: "titles" }]}
   */
  searchableColumns?: DataTableSearchableColumn<TData>[];

  /**
   * The filterable columns of the table. When provided, renders dynamic faceted filters, and the advancedFilter prop is ignored.
   * @default []
   * @type {id: keyof TData, title: string, options: { label: string, value: string, icon?: React.ComponentType<{ className?: string }> }[]}[]
   * @example filterableColumns={[{ id: "status", title: "Status", options: ["todo", "in-progress", "done", "canceled"]}]}
   */
  filterableColumns?: DataTableFilterableColumn<TData>[];

  defaultSearchColumn: string;
  actionButtonText?: React.ReactNode;
  modalChildren?: React.ReactNode;
};

export const DataTable = <TData, TValue>({
  dataTable,
  columns,
  searchableColumns,
  // filterableColumns,
  defaultSearchColumn,
  modalChildren,
  actionButtonText,
}: DataTableProps<TData, TValue>) => {
  const [activeSearchColumnKey, setActiveSearchColumnKey] =
    useState(defaultSearchColumn);
  const { setOpen } = useModal();

  useEffect(() => {
    return () => {
      dataTable.getColumn(activeSearchColumnKey as string)?.setFilterValue('');
    };
  }, [activeSearchColumnKey]);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center py-4 gap-2">
          <Search />
          <Input
            placeholder={`Search ${activeSearchColumnKey}...`}
            value={
              (dataTable
                .getColumn(activeSearchColumnKey)
                ?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              dataTable
                .getColumn(activeSearchColumnKey as string)
                ?.setFilterValue(event.target.value)
            }
            className="h-12 outline-none border-none"
          />
        </div>
        <Button
          className="flex gap-2"
          onClick={() => {
            if (modalChildren) {
              setOpen(
                <CustomModal
                  title="Add a team member"
                  subheading="Send an invitation"
                >
                  {modalChildren}
                </CustomModal>
              );
            }
          }}
        >
          {actionButtonText}
        </Button>
      </div>
      <div className="border bg-background rounded-lg">
        <Table>
          <TableHeader>
            {dataTable.getHeaderGroups()?.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {dataTable.getRowModel().rows.length ? (
              dataTable.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No Results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
