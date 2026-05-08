import { useMemo, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { unsubscribesColumns } from "@/features/unsubscribes/columns";
import unsubscribesData from "@/features/unsubscribes/data/unsubscribes.json";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import UnsubscribesTableActionBar from "./UnsubscribesTableActionBar";
import UnsubscribesTableSearch from "./UnsubscribesTableSearch";

const PAGE_SIZE = 10;

export default function UnsubscribesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));

  const filteredData = useMemo(() => {
    if (!searchTerm) return unsubscribesData.blockList;
    return unsubscribesData.blockList.filter((item) =>
      item.phoneNumber.includes(searchTerm),
    );
  }, [searchTerm]);

  // manualPagination: true이므로 현재 페이지 데이터만 슬라이싱해서 전달
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, page]);

  const { table } = useDataTable({
    data: paginatedData,
    pageCount: Math.ceil(filteredData.length / PAGE_SIZE),
    columns: unsubscribesColumns,
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    table.setPageIndex(0);
  };

  const handleRefresh = () => {
    setLastRefreshedAt(new Date());
  };

  return (
    <div className="rounded-md bg-white p-7">
      <DataTable
        table={table}
        totalCount={filteredData.length}
        actionBar={<UnsubscribesTableActionBar table={table} />}
      >
        <UnsubscribesTableSearch
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          lastRefreshedAt={lastRefreshedAt}
        />
      </DataTable>
    </div>
  );
}
