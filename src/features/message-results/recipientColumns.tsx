import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  FAILURE_REASON_CONFIG,
  RECIPIENT_STATUS_CONFIG,
} from "@/features/message-results/constants";
import type { MessageResultRecipient } from "@/features/message-results/types";
import { formatDateTime } from "@/shared/utils/formatDate";
import { formatPhoneNumber } from "@/shared/utils/formatPhoneNumber";

export const messageResultRecipientColumns: ColumnDef<MessageResultRecipient>[] =
  [
    {
      id: "select",
      size: 50,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(checked) => {
            table.toggleAllPageRowsSelected(!!checked);
          }}
          aria-label="전체 선택"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => {
            row.toggleSelected(!!checked);
          }}
          aria-label="선택"
        />
      ),
    },
    {
      header: "수신번호",
      accessorKey: "phoneNumber",
      size: 160,
      cell: ({ row }) => (
        <div className="text-sm">
          {formatPhoneNumber(row.original.phoneNumber)}
        </div>
      ),
    },
    {
      header: "발송 상태",
      accessorKey: "status",
      size: 110,
      cell: ({ row }) => {
        const { label, variant } =
          RECIPIENT_STATUS_CONFIG[row.original.status];
        return (
          <Badge variant={variant as "green" | "red" | "yellow"}>
            {label}
          </Badge>
        );
      },
    },
    {
      header: "실패 사유",
      accessorKey: "failureReason",
      cell: ({ row }) => {
        const reason = row.original.failureReason;
        if (!reason) return <div className="text-sm text-gray-400">-</div>;
        return (
          <div className="text-sm">
            {FAILURE_REASON_CONFIG[reason].label}
          </div>
        );
      },
    },
    {
      header: "발송 완료 일시",
      accessorKey: "completedAt",
      size: 180,
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.completedAt
            ? formatDateTime(row.original.completedAt)
            : "-"}
        </div>
      ),
    },
  ];
