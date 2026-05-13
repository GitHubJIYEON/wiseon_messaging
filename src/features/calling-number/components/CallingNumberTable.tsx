import { useCallback, useMemo, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { getCallingNumberColumns } from "@/features/calling-number/columns";
import callingNumbersData from "@/features/calling-number/data/callingNumbers.json";
import type { CallingNumber } from "@/features/calling-number/types";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import CallingNumberTableSearch from "./CallingNumberTableSearch";

const PAGE_SIZE = 10;

export default function CallingNumberTable() {
  const [list, setList] = useState<CallingNumber[]>(
    callingNumbersData as CallingNumber[],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));

  const handleUsageEnabledChange = useCallback(
    (item: CallingNumber, checked: boolean) => {
      setList((prev) =>
        prev.map((el) =>
          el.id === item.id ? { ...el, usageEnabled: checked } : el,
        ),
      );
    },
    [],
  );

  const filteredData = useMemo(() => {
    if (!searchTerm) return list;
    return list.filter((item) => item.phoneNumber.includes(searchTerm));
  }, [list, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, page]);

  const columns = useMemo(
    () =>
      getCallingNumberColumns({
        onDetail: (item) => console.log("상세보기", item),
        onRenew: (item) => console.log("인증 갱신", item),
        onReAuth: (item) => console.log("재인증", item),
        onUsageEnabledChange: handleUsageEnabledChange,
      }),
    [handleUsageEnabledChange],
  );

  const { table } = useDataTable({
    data: paginatedData,
    pageCount: Math.ceil(filteredData.length / PAGE_SIZE),
    columns,
  });

  return (
    <div className="rounded-md bg-white p-7">
      <DataTable table={table} totalCount={filteredData.length}>
        <CallingNumberTableSearch onSearch={() => {}} />
      </DataTable>
    </div>
  );
}
