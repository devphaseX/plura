import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  RowSelectionState,
  TableMeta,
} from '@tanstack/react-table';

import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from '@/types';
import { z } from 'zod';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from './useDebounce';

type UseDataTableProps<TData, TValue> = {
  /**
   * The data for the table
   * @default []
   * @type TData[]
   */
  data: TData[];

  /**
   * The columns of the table
   * @default []
   * @type ColumnDef<TData, TValue>[]
   */
  columns: ColumnDef<TData, TValue>[];

  /**
   * The number of pages in the table
   * @type number
   */
  pageCount: number;

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
  meta?: TableMeta<TData>;
};

const schema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
});

export function useDataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  filterableColumns,
  searchableColumns,
  meta,
}: UseDataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { page, per_page, sort } = schema.parse(
    Object.fromEntries(searchParams)
  );

  const [column, order] = sort?.split('.') ?? [];

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const initialColumnFilters = useMemo(
    () =>
      Array.from(searchParams).reduce<ColumnFiltersState>(
        (filters, [key, value]) => {
          const filterableColumn = filterableColumns?.find(
            (column) => column.id === key
          );

          const searchableColumn = searchableColumns?.find(
            (column) => column.id === key
          );

          if (filterableColumn) {
            filters.push({
              id: key,
              value: value.split('.'),
            });
          } else if (searchableColumn) {
            filters.push({
              id: key,
              value: [value],
            });
          }
          return filters;
        },
        []
      ),
    [filterableColumns, searchableColumns, searchParams]
  );

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters);
  // Handle server-side pagination
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: per_page,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        page: pageIndex + 1,
        per_page: pageSize,
      })}`,
      {
        scroll: false,
      }
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);

  // Handle server-side sorting
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: column ?? '',
      desc: order === 'desc',
    },
  ]);

  const debouncedSearableColumnFilters: ColumnFiltersState = JSON.parse(
    useDebounce(
      JSON.stringify(
        columnFilters.filter((filter) =>
          searchableColumns?.find((column) => column.id === filter.id)
        )
      ),
      500
    )
  );

  const filterableColumnFilters = columnFilters.filter((filter) =>
    filterableColumns?.find((column) => column.id === filter.id)
  );

  useEffect(() => {
    const newParams = {
      page: 1,
    };

    //Handle debounced searable column filters

    for (const column of debouncedSearableColumnFilters) {
      if (typeof column.value === 'string') {
        Object.assign(newParams, {
          [column.id]: column.value,
        });
      }
    }
    // Handle filterable column filters

    for (const column of filterableColumnFilters) {
      if (Array.isArray(column.value)) {
        Object.assign(newParams, { [column.id]: column.value.join('.') });
      }
    }

    for (const key of searchParams.keys()) {
      const searchableColumn = searchableColumns?.find(
        (column) => column.id === key
      );

      const searchableColumnInUsed = !debouncedSearableColumnFilters.find(
        (column) => column.id === key
      );

      const filterableColumn = filterableColumns?.find(
        (column) => column.id === key
      );

      const filterableColumnInUsed = filterableColumnFilters.find(
        (column) => column.id === key
      );

      if (
        (searchableColumn && !searchableColumnInUsed) ||
        (filterableColumn && !filterableColumnInUsed)
      ) {
        Object.assign(newParams, {
          [key]: null,
        });
      }

      router.push(`${pathname}?${createQueryString(newParams)}`);
    }
  }, [
    JSON.stringify(debouncedSearableColumnFilters),
    JSON.stringify(filterableColumnFilters),
  ]);

  const dataTable = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // getFacetedRowModel: getFacetedRowModel(),
    // getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    meta,
  });

  return { dataTable };
}
