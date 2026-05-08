import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { formatPhoneNumber } from "@/shared/utils/format";
import type { BlockItem } from "./types";

export const unsubscribesColumns: ColumnDef<BlockItem>[] = [
  {
    id: "select",
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
    cell: ({ row }) => <div>{formatPhoneNumber(row.original.phoneNumber)}</div>,
  },
  {
    header: "등록일시",
    accessorKey: "createdAt",
    cell: ({ row }) => <div>{row.original.createdAt}</div>,
  },
  {
    header: "유입 경로",
    accessorKey: "blockType",
    cell: ({ row }) => (
      <div>
        {row.original.blockType === "WEB" ? (
          <Badge variant="secondary">수동</Badge>
        ) : (
          <Badge variant="blue">ARS</Badge>
        )}
      </div>
    ),
  },
];
