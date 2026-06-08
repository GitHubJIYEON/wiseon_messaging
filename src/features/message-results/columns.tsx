import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  NoBorderStatus,
  NoBorderStatusLabel,
} from "@/shared/components/ui/status-noborder";
import { formatDateTime } from "@/shared/utils/formatDate";
import { formatPhoneNumber } from "@/shared/utils/formatPhoneNumber";
import {
  CONTENT_TYPE_CONFIG,
  MESSAGE_TYPE_CONFIG,
  STATUS_CONFIG,
} from "./constants";
import type { MessageResultItem } from "./types";

export const messageResultsColumns: ColumnDef<MessageResultItem>[] = [
  {
    header: "발송 요청 일시",
    accessorKey: "requestedAt",
    size: 160,
    cell: ({ row }) => (
      <div className="text-sm">{formatDateTime(row.original.requestedAt)}</div>
    ),
  },
  {
    header: "메시지 본문",
    accessorKey: "messageBody",
    cell: ({ row }) => (
      <div
        className="max-w-[280px] truncate text-sm"
        title={row.original.messageBody}
      >
        {row.original.messageBody}
      </div>
    ),
  },
  {
    header: "발신 번호",
    accessorKey: "senderNumber",
    size: 140,
    cell: ({ row }) => (
      <div className="text-sm">
        {formatPhoneNumber(row.original.senderNumber)}
      </div>
    ),
  },
  {
    header: "수신번호 갯수",
    accessorKey: "recipientCount",
    size: 120,
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.recipientCount.toLocaleString()}건
      </div>
    ),
  },
  {
    header: "발송 유형",
    accessorKey: "messageType",
    size: 120,
    cell: ({ row }) => {
      const { label, variant } = MESSAGE_TYPE_CONFIG[row.original.messageType];
      const { label: contentLabel } =
        CONTENT_TYPE_CONFIG[row.original.contentType];
      return (
        <div className="flex items-center justify-center gap-2">
          <NoBorderStatus variant={variant}>
            <NoBorderStatusLabel>{label}</NoBorderStatusLabel>
          </NoBorderStatus>
          <Badge variant="secondary">{contentLabel}</Badge>
        </div>
      );
    },
  },
  {
    header: "발송 상태",
    accessorKey: "status",
    size: 110,
    cell: ({ row }) => {
      const { label, variant } = STATUS_CONFIG[row.original.status];
      return (
        <Badge variant={variant as "green" | "red" | "gray"}>{label}</Badge>
      );
    },
  },
  {
    id: "action",
    header: "",
    size: 100,
    cell: ({ row }) => {
      if (row.original.status === "RESERVED") {
        return (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-black underline"
          >
            취소하기
          </Button>
        );
      }
      return (
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to={`/message-results/${row.original.id}`}>상세보기</Link>
        </Button>
      );
    },
  },
];
