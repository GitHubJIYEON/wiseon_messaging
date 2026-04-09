import { useCallback, useMemo, useState } from "react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { format } from "date-fns";
import { parseAsString, useQueryStates } from "nuqs";
import { cn } from "@/lib/utils";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import { MOCK_CALLING_NUMBERS } from "./callingNumberData";

export type CallingNumberStatus = "검수중" | "정상" | "반려" | "만료";

export interface CallingNumberAttachment {
  label: string;
  fileName: string;
}

export interface CallingNumber {
  id: number;
  phoneNumber: string;
  name: string;
  registeredAt: string;
  certExpiredAt: string;
  status: CallingNumberStatus;
  /** 발송에 사용 여부 (인증 정상인 번호만 변경 가능) */
  usageEnabled: boolean;
  attachments?: CallingNumberAttachment[];
  requestNote?: string;
  rejectReason?: string;
}

const STATUS_STYLE: Record<
  CallingNumberStatus,
  { label: string; className: string }
> = {
  검수중: {
    label: "검수중",
    className: "border-blue-200 bg-blue-50 text-blue-600",
  },
  정상: {
    label: "정상",
    className: "border-green-200 bg-green-50 text-green-600",
  },
  반려: {
    label: "반려",
    className: "border-red-200 bg-red-50 text-red-600",
  },
  만료: {
    label: "만료",
    className: "border-gray-200 bg-gray-100 text-gray-500",
  },
};

const formatDate = (value: string) => format(new Date(value), "yyyy.MM.dd");

interface CallingNumberTableProps {
  data?: CallingNumber[];
  actionBar?: React.ReactNode;
  onDetail?: (item: CallingNumber) => void;
  onReAuth?: (item: CallingNumber) => void;
  onRenew?: (item: CallingNumber) => void;
  onSelectionChange?: (items: CallingNumber[]) => void;
  onUsageEnabledChange?: (item: CallingNumber, enabled: boolean) => void;
}

export default function CallingNumberTable({
  data: externalData,
  actionBar,
  onDetail,
  onReAuth,
  onRenew,
  onSelectionChange,
  onUsageEnabledChange,
}: CallingNumberTableProps) {
  const [internalData] = useState<CallingNumber[]>(MOCK_CALLING_NUMBERS);
  const data = externalData ?? internalData;

  const [, setFilters] = useQueryStates({
    phoneNumber: parseAsString,
    name: parseAsString,
  });

  const [searchInput, setSearchInput] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const filteredData = useMemo(() => {
    const keyword = searchInput.trim().toLowerCase();
    if (!keyword) return data;
    return data.filter(
      (item) =>
        item.phoneNumber.includes(keyword) ||
        item.name.toLowerCase().includes(keyword),
    );
  }, [data, searchInput]);

  const handleRowSelectionChange = useCallback(
    (
      updater:
        | RowSelectionState
        | ((old: RowSelectionState) => RowSelectionState),
    ) => {
      setRowSelection((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        const selectedItems = Object.keys(next)
          .filter((key) => next[key])
          .map((key) => filteredData.find((item) => String(item.id) === key))
          .filter(Boolean) as CallingNumber[];
        onSelectionChange?.(selectedItems);
        return next;
      });
    },
    [filteredData, onSelectionChange],
  );

  const handleReset = useCallback(() => {
    setSearchInput("");
    setFilters({ phoneNumber: null, name: null });
  }, [setFilters]);

  const columns = useMemo<ColumnDef<CallingNumber>[]>(
    () => [
      {
        id: "select",
        header: ({ table: t }) => (
          <Checkbox
            checked={
              t.getIsAllPageRowsSelected()
                ? true
                : t.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(checked) =>
              t.toggleAllPageRowsSelected(checked === true)
            }
          />
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(checked) =>
                row.toggleSelected(checked === true)
              }
            />
          </div>
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "phoneNumber",
        accessorKey: "phoneNumber",
        header: "발신번호",
        size: 180,
        cell: ({ row }) => (
          <div className="px-2.5 text-center">
            {row.getValue<string>("phoneNumber")}
          </div>
        ),
      },
      {
        id: "name",
        accessorKey: "name",
        header: "발신번호명",
        size: 240,
        cell: ({ row }) => (
          <div className="max-w-[240px] overflow-hidden px-2.5 text-start text-ellipsis">
            {row.getValue<string>("name")}
          </div>
        ),
      },
      {
        id: "registeredAt",
        accessorKey: "registeredAt",
        header: "등록일",
        size: 140,
        cell: ({ row }) => (
          <div className="px-2.5 text-center">
            {formatDate(row.getValue<string>("registeredAt"))}
          </div>
        ),
      },
      {
        id: "certExpiredAt",
        accessorKey: "certExpiredAt",
        header: "인증만료일",
        size: 140,
        cell: ({ row }) => (
          <div className="px-2.5 text-center">
            {formatDate(row.getValue<string>("certExpiredAt"))}
          </div>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: "인증상태",
        size: 120,
        cell: ({ row }) => {
          const status = row.getValue<CallingNumberStatus>("status");
          const style = STATUS_STYLE[status];
          return (
            <div className="flex items-center justify-center px-2.5">
              <Badge
                variant="outline"
                className={cn("min-w-[56px] text-[12px]", style.className)}
              >
                {style.label}
              </Badge>
            </div>
          );
        },
      },

      {
        id: "actions",
        header: "관리",
        size: 120,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              className="flex items-center justify-center px-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              {item.status === "만료" ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 border-orange-300 px-3 text-[13px] text-orange-500 hover:bg-orange-50"
                  onClick={() => onRenew?.(item)}
                >
                  인증 갱신
                </Button>
              ) : item.status === "반려" ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 border-red-300 px-3 text-[13px] text-red-500 hover:bg-red-50"
                  onClick={() => onReAuth?.(item)}
                >
                  재인증
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-3 text-[13px]"
                  onClick={() => onDetail?.(item)}
                  disabled={item.status === "검수중"}
                >
                  상세보기
                </Button>
              )}
            </div>
          );
        },
      },
      {
        id: "usageEnabled",
        accessorKey: "usageEnabled",
        header: "사용 여부",
        size: 110,
        cell: ({ row }) => {
          const item = row.original;
          const canToggle = item.status === "정상";
          return (
            <div
              className="flex flex-col items-center justify-center gap-1 px-2 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Switch
                checked={item.usageEnabled}
                disabled={!canToggle}
                title={
                  canToggle
                    ? undefined
                    : "인증 상태가 정상인 번호만 발송 사용을 설정할 수 있습니다."
                }
                aria-label={`${item.phoneNumber} 발송 사용`}
                onCheckedChange={(checked) =>
                  onUsageEnabledChange?.(item, checked === true)
                }
              />
              {/* <span className="font-apple-light text-[10px] text-gray-400">
                {item.usageEnabled ? "사용" : "미사용"}
              </span> */}
            </div>
          );
        },
      },
    ],
    [onDetail, onReAuth, onRenew, onUsageEnabledChange],
  );

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: 1,
    meta: { totalCount: filteredData.length },
    getRowId: (row) => String(row.id),
    enableRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    rowSelection,
  });

  return (
    <DataTable table={table} actionBar={actionBar} className="bg-white">
      <section className="mb-2.5 flex items-center justify-between">
        <h2 className="font-apple-medium text-lg text-gray-700">
          총 {filteredData.length}개
        </h2>
        <div className="flex h-10 items-center gap-1">
          <Input
            placeholder="발신번호 또는 발신번호명"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-[42px] w-[260px] rounded text-[13px]/5 text-gray-700 placeholder:text-gray-500"
          />
          <Button
            type="button"
            variant="outline"
            className="font-apple-medium h-[42px] w-[76px] rounded text-[14px]/[24px] text-gray-700"
            onClick={handleReset}
          >
            초기화
          </Button>
        </div>
      </section>
    </DataTable>
  );
}
