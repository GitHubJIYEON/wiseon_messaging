import { useCallback, useMemo } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type RowSelectionState,
  type TableOptions,
  type Updater,
} from "@tanstack/react-table";
import { parseAsInteger, useQueryState, type UseQueryStateOptions } from "nuqs";

const PAGE_KEY = "page";
const PER_PAGE = 10;

interface UseDataTableProps<TData>
  extends Omit<
      TableOptions<TData>,
      "state" | "pageCount" | "getCoreRowModel" | "manualPagination"
    >,
    Required<Pick<TableOptions<TData>, "pageCount">> {
  getRowId?: (originalRow: TData) => string;
  rowSelection?: RowSelectionState;
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
  const { columns, pageCount = -1, getRowId, rowSelection, ...tableProps } =
    props;

  const queryStateOptions = useMemo<
    Omit<UseQueryStateOptions<string>, "parse">
  >(() => ({}), []);

  const [page, setPage] = useQueryState(
    PAGE_KEY,
    parseAsInteger.withOptions(queryStateOptions).withDefault(1),
  );

  const pagination: PaginationState = useMemo(() => {
    return {
      pageIndex: page - 1,
      pageSize: PER_PAGE,
    };
  }, [page]);

  const onPaginationChange = useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      if (typeof updaterOrValue === "function") {
        const newPagination = updaterOrValue(pagination);
        void setPage(newPagination.pageIndex + 1);
      } else {
        void setPage(updaterOrValue.pageIndex + 1);
      }
    },
    [pagination, setPage],
  );

  const table = useReactTable({
    ...tableProps,
    columns,
    pageCount,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange,
    ...(getRowId && { getRowId }),
    state: {
      pagination,
      ...(rowSelection !== undefined && { rowSelection }),
    },
    defaultColumn: {
      ...tableProps.defaultColumn,
    },
  });

  return {
    table,
  };
}
