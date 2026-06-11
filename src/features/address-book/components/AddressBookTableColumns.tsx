import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { formatDateTime } from "@/shared/utils/formatDate";
import type { AddressBookGroupItem } from "../types/addressBookGroup";

interface AddressBookTableColumnsProps {
  handleAddMembers: (groupName: string) => void;
  moveToDetail: (groupId: number) => void;
}

export default function AddressBookTableColumns({
  handleAddMembers,
  moveToDetail,
}: AddressBookTableColumnsProps): ColumnDef<AddressBookGroupItem>[] {
  return [
    {
      id: "select",
      size: 50,
      header: ({ table }) => (
        <Checkbox
          name="address-book-group-select-all"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(checked) => {
            table.toggleAllPageRowsSelected(!!checked);
          }}
          aria-label="전체 행 선택"
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
      id: "groupName",
      size: 400,
      header: "주소록 그룹명",
      accessorKey: "groupName",
      cell: ({ row }) => (
        <div className="text-left">{row.original.groupName}</div>
      ),
    },
    {
      id: "groupCount",
      header: "구성원 수",
      accessorKey: "groupCount",
      cell: ({ row }) => <div>{row.original.groupCount}</div>,
    },
    {
      id: "createdAt",
      header: "등록 일시",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <div>{formatDateTime(new Date(row.original.createdAt))}</div>
      ),
    },
    {
      id: "members",
      size: 100,
      header: "구성원 추가",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddMembers(row.original.groupName)}
        >
          구성원 추가
        </Button>
      ),
    },
    {
      id: "detail",
      size: 100,
      header: "관리하기",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => moveToDetail(row.original.groupId)}
        >
          관리하기
        </Button>
      ),
    },
  ];
}
