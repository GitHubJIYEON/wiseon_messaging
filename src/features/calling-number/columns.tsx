import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Switch } from "@/shared/components/ui/switch";
import { formatDate } from "@/shared/utils/formatDate";
import { formatPhoneNumber } from "@/shared/utils/formatPhoneNumber";
import type { CallingNumber, CallingNumberStatus } from "./types";

const STATUS_STYLE: Record<
  CallingNumberStatus,
  { label: string; variant: "green" | "blue" | "yellow" | "red" }
> = {
  정상: { label: "정상", variant: "green" },
  검수중: { label: "검수중", variant: "blue" },
  만료: { label: "만료", variant: "yellow" },
  반려: { label: "반려", variant: "red" },
};

interface CallingNumberColumnsOptions {
  onDetail?: (item: CallingNumber) => void;
  onRenew?: (item: CallingNumber) => void;
  onReAuth?: (item: CallingNumber) => void;
  onUsageEnabledChange?: (item: CallingNumber, checked: boolean) => void;
}

export function getCallingNumberColumns({
  onDetail,
  onRenew,
  onReAuth,
  onUsageEnabledChange,
}: CallingNumberColumnsOptions = {}): ColumnDef<CallingNumber>[] {
  return [
    {
      id: "select",
      size: 50,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(checked) =>
            table.toggleAllPageRowsSelected(checked === true)
          }
          aria-label="전체 선택"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(checked) => row.toggleSelected(checked === true)}
            aria-label="선택"
          />
        </div>
      ),
    },
    {
      id: "phoneNumber",
      accessorKey: "phoneNumber",
      header: "발신번호",
      size: 160,
      cell: ({ row }) => (
        <div className="text-center">
          {formatPhoneNumber(row.original.phoneNumber)}
        </div>
      ),
    },
    {
      id: "name",
      accessorKey: "name",
      header: "발신번호명",
      size: 220,
      cell: ({ row }) => (
        <div className="max-w-[220px] overflow-hidden text-start text-ellipsis">
          {row.original.name}
        </div>
      ),
    },
    {
      id: "registeredAt",
      accessorKey: "registeredAt",
      header: "등록일",
      size: 130,
      cell: ({ row }) => (
        <div className="text-center">
          {formatDate(row.original.registeredAt)}
        </div>
      ),
    },
    {
      id: "certExpiredAt",
      accessorKey: "certExpiredAt",
      header: "인증만료일",
      size: 130,
      cell: ({ row }) => (
        <div className="text-center">
          {formatDate(row.original.certExpiredAt)}
        </div>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "인증상태",
      size: 110,
      cell: ({ row }) => {
        const { label, variant } = STATUS_STYLE[row.original.status];
        return (
          <div className="flex items-center justify-center">
            <Badge variant={variant} className="min-w-[56px]">
              {label}
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
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {item.status === "만료" ? (
              <Button
                type="button"
                variant="outline"
                className="h-8 w-18 border-orange-300 px-3 text-[13px] text-orange-500 hover:bg-orange-50 hover:text-orange-500"
                onClick={() => onRenew?.(item)}
              >
                인증 갱신
              </Button>
            ) : item.status === "반려" ? (
              <Button
                type="button"
                variant="outline"
                className="h-8 w-18 border-red-300 px-3 text-[13px] text-red-500 hover:bg-red-50 hover:text-red-500"
                onClick={() => onReAuth?.(item)}
              >
                재인증
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-8 w-18 px-3 text-[13px]"
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
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Switch
              className="cursor-pointer"
              checked={item.usageEnabled}
              disabled={!canToggle}
              title={
                canToggle
                  ? undefined
                  : "인증 상태가 정상인 번호만 발송 사용을 설정할 수 있습니다."
              }
              aria-label={`${item.phoneNumber} 발송 사용`}
              onCheckedChange={(checked) =>
                onUsageEnabledChange?.(item, checked)
              }
            />
          </div>
        );
      },
    },
  ];
}
