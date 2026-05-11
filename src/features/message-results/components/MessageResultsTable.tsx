import { useMemo, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { messageResultsColumns } from "@/features/message-results/columns";
import messageResultsData from "@/features/message-results/data/message-results.json";
import type { MessageResultItem } from "@/features/message-results/types";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import MessageResultsTableSearch from "./MessageResultsTableSearch";

const list = messageResultsData.list as MessageResultItem[];

const PAGE_SIZE = 10;

export default function MessageResultsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));

  const filteredData = useMemo(() => {
    if (!searchTerm) return list;
    return list.filter((item) => item.senderNumber.includes(searchTerm));
  }, [searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, page]);

  const { table } = useDataTable({
    data: paginatedData,
    pageCount: Math.ceil(filteredData.length / PAGE_SIZE),
    columns: messageResultsColumns,
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
      <DataTable table={table} totalCount={filteredData.length}>
        <MessageResultsTableSearch
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          lastRefreshedAt={lastRefreshedAt}
        />
      </DataTable>
    </div>
  );
}
