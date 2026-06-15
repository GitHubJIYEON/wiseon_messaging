import { Checkbox } from "@/shared/components/ui/checkbox";

interface AddressBookDetailTableColumnsProps {
  handleDelete: (item: any) => void;
}

// 유동적으로 데이터 받아서 보여줘야 함

export default function AddressBookDetailTableColumns({
  handleDelete,
}: AddressBookDetailTableColumnsProps) {
  return [
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
      id: "name",
      size: 400,
      header: "이름",
      accessorKey: "name",
      cell: ({ row }) => <div>{row.original.name}</div>,
    },
  ];
}
