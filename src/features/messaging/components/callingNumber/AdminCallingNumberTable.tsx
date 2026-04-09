import { useCallback, useMemo, useState } from "react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { format } from "date-fns";
import { FileIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import type { AdminCallingNumber } from "./adminCallingNumberData";
import { MOCK_ADMIN_CALLING_NUMBERS } from "./adminCallingNumberData";
import type { CallingNumberStatus } from "./CallingNumberTable";

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
  반려: { label: "반려", className: "border-red-200 bg-red-50 text-red-600" },
  만료: {
    label: "만료",
    className: "border-gray-200 bg-gray-100 text-gray-500",
  },
};

const ALL_STATUS = "전체" as const;
type StatusFilter = CallingNumberStatus | typeof ALL_STATUS;

const formatDate = (value: string) => format(new Date(value), "yyyy.MM.dd");

interface AdminCallingNumberTableProps {
  data?: AdminCallingNumber[];
  actionBar?: React.ReactNode;
  onSelectionChange?: (items: AdminCallingNumber[]) => void;
}

export default function AdminCallingNumberTable({
  data: externalData,
  actionBar,
  onSelectionChange,
}: AdminCallingNumberTableProps) {
  const navigate = useNavigate();
  const [internalData] = useState<AdminCallingNumber[]>(
    MOCK_ADMIN_CALLING_NUMBERS,
  );
  const data = externalData ?? internalData;

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_STATUS);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const filteredData = useMemo(() => {
    const keyword = searchInput.trim().toLowerCase();
    return data.filter((item) => {
      const matchesStatus =
        statusFilter === ALL_STATUS || item.status === statusFilter;
      const matchesKeyword =
        !keyword ||
        item.phoneNumber.includes(keyword) ||
        item.name.toLowerCase().includes(keyword) ||
        item.organizationName.toLowerCase().includes(keyword) ||
        item.projectName.toLowerCase().includes(keyword);
      return matchesStatus && matchesKeyword;
    });
  }, [data, searchInput, statusFilter]);

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
          .filter(Boolean) as AdminCallingNumber[];
        onSelectionChange?.(selectedItems);
        return next;
      });
    },
    [filteredData, onSelectionChange],
  );

  const handleReset = () => {
    setSearchInput("");
    setStatusFilter(ALL_STATUS);
  };

  const columns = useMemo<ColumnDef<AdminCallingNumber>[]>(
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
        size: 48,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "organizationName",
        accessorKey: "organizationName",
        header: "기관명",
        size: 150,
        cell: ({ row }) => (
          <div className="px-2.5 text-[13px] font-medium text-gray-800">
            {row.getValue<string>("organizationName")}
          </div>
        ),
      },
      {
        id: "projectName",
        accessorKey: "projectName",
        header: "프로젝트명",
        size: 140,
        cell: ({ row }) => (
          <div className="px-2.5 text-[13px] text-gray-600">
            {row.getValue<string>("projectName")}
          </div>
        ),
      },
      {
        id: "name",
        accessorKey: "name",
        header: "발신번호명",
        size: 160,
        cell: ({ row }) => (
          <div className="max-w-[160px] truncate px-2.5 text-[13px] text-gray-700">
            {row.getValue<string>("name")}
          </div>
        ),
      },
      {
        id: "phoneNumber",
        accessorKey: "phoneNumber",
        header: "발신번호",
        size: 140,
        cell: ({ row }) => (
          <div className="px-2.5 text-center text-[13px] text-gray-800 tabular-nums">
            {row.getValue<string>("phoneNumber")}
          </div>
        ),
      },
      {
        id: "registeredAt",
        accessorKey: "registeredAt",
        header: "등록일",
        size: 110,
        cell: ({ row }) => (
          <div className="px-2.5 text-center text-[13px] text-gray-600">
            {formatDate(row.getValue<string>("registeredAt"))}
          </div>
        ),
      },
      {
        id: "certExpiredAt",
        accessorKey: "certExpiredAt",
        header: "인증만료일",
        size: 110,
        cell: ({ row }) => {
          const dateStr = row.getValue<string>("certExpiredAt");
          const isExpired = new Date(dateStr) < new Date();
          return (
            <div
              className={cn(
                "px-2.5 text-center text-[13px]",
                isExpired ? "text-red-500" : "text-gray-600",
              )}
            >
              {formatDate(dateStr)}
            </div>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: "신청상태",
        size: 100,
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
        id: "inUse",
        accessorKey: "inUse",
        header: "활성 여부",
        size: 88,
        cell: ({ row }) => {
          const inUse = row.getValue<boolean>("inUse");
          return (
            <div className="flex items-center justify-center px-2.5">
              <Badge
                variant="outline"
                className={cn(
                  "min-w-[52px] text-[12px]",
                  inUse
                    ? "border-gray-600 bg-gray-100 text-black"
                    : "border-gray-200 bg-gray-50 text-gray-500",
                )}
              >
                {inUse ? "활성" : "비활성"}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "attachments",
        header: "첨부파일",
        size: 90,
        cell: ({ row }) => {
          const count = row.original.attachments?.length ?? 0;
          return (
            <div className="flex items-center justify-center gap-1 px-2.5">
              <FileIcon className="size-3.5 text-gray-400" />
              <span className="text-[13px] text-gray-600">{count}건</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "관리",
        size: 90,
        cell: ({ row }) => (
          <div
            className="flex items-center justify-center px-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="outline"
              className="h-8 px-3 text-[13px]"
              onClick={() =>
                navigate(
                  `/messaging/admin/calling-number-management/${row.original.id}`,
                )
              }
            >
              상세보기
            </Button>
          </div>
        ),
      },
    ],
    [navigate],
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
        <div className="flex h-10 items-center gap-1.5">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="h-[42px] w-[110px] text-[13px] text-gray-700">
              <SelectValue placeholder="상태 전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUS}>전체</SelectItem>
              <SelectItem value="검수중">검수중</SelectItem>
              <SelectItem value="정상">정상</SelectItem>
              <SelectItem value="반려">반려</SelectItem>
              <SelectItem value="만료">만료</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="기관명, 프로젝트명, 발신번호"
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
