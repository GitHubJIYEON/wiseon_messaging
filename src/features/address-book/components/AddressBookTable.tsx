import { useState } from "react";
import addressbookData from "@/features/address-book/data/addressbook.json";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import { formatDateTime } from "@/shared/utils/formatDate";
import AddressBookAddMembersDialog from "./AddressBookAddMembersDialog";
import AddressBookTableSearch from "./AddressBookTableSearch";

export default function AddressBookTable() {
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const { table } = useDataTable({
    data: addressbookData,
    columns: [
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
        header: "대상자 수",
        accessorKey: "groupCount",
        cell: ({ row }) => <div>{row.original.groupCount}</div>,
      },
      {
        id: "registeredAt",
        header: "등록 일시",
        accessorKey: "registeredAt",
        cell: ({ row }) => (
          <div>{formatDateTime(new Date(row.original.registeredAt))}</div>
        ),
      },
      {
        id: "members",
        size: 100,
        header: "구성원 추가",
        accessorKey: "members",
        cell: ({ row }) => {
          return (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleAddMembers(row.original);
                }}
              >
                구성원 추가
              </Button>
            </div>
          );
        },
      },
      {
        id: "detail",
        size: 100,
        header: "상세보기",
        accessorKey: "detail",
        cell: ({ row }) => {
          return (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleDetail(row.original);
                }}
              >
                상세보기
              </Button>
            </div>
          );
        },
      },
    ],
    pageCount: 10,
  });

  const handleAddMembers = (row: any) => {
    setSelectedGroupName(row.groupName ?? "");
    setAddMembersOpen(true);
  };

  const handleDetail = (row: any) => {
    console.log(row);
  };
  const handleSearch = (value: string) => {
    console.log(value);
  };

  return (
    <div className="rounded-md bg-white p-7">
      <DataTable table={table}>
        <AddressBookTableSearch onSearch={handleSearch} />
      </DataTable>

      <AddressBookAddMembersDialog
        open={addMembersOpen}
        onOpenChange={setAddMembersOpen}
        initialGroupName={selectedGroupName}
      />
    </div>
  );
}
