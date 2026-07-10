import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
// import { useAddressBookGroupMutation } from "../hooks/mutations/useAddressBookGroupMutation";
// import { useAddressBookListQuery } from "../hooks/queries/useAddressBookListQuery";
import AddressBookAddMembersDialog from "./AddressBookAddMembersDialog";
import AddressBookTableActionBar from "./AddressBookTableActionBar";
import AddressBookTableColumns from "./AddressBookTableColumns";
import AddressBookTableSearch from "./AddressBookTableSearch";

const MOCK_ADDRESS_BOOK_LIST = {
  totalElements: 2,
  totalPages: 1,
  page: 1,
  size: 10,
  content: [
    {
      groupId: 1,
      groupName: "와이즈온 기본 주소록",
      groupCount: 1000,
      createdAt: "2026-05-01T10:00:00.000Z",
      updatedAt: "2026-05-01T10:00:00.000Z",
    },
    {
      groupId: 2,
      groupName: "와이즈온 수영장 주소록",
      groupCount: 800,
      createdAt: "2026-04-05T09:30:00.000Z",
      updatedAt: "2026-04-05T09:30:00.000Z",
    },
    {
      groupId: 3,
      groupName: "와이즈온 체육관 주소록",
      groupCount: 500,
      createdAt: "2026-03-10T09:00:00.000Z",
      updatedAt: "2026-03-10T09:00:00.000Z",
    },
    {
      groupId: 4,
      groupName: "서울시 체육관 주소록",
      groupCount: 500,
      createdAt: "2026-02-10T09:00:00.000Z",
      updatedAt: "2026-02-10T09:00:00.000Z",
    },
    {
      groupId: 5,
      groupName: "경기도 체육관 주소록",
      groupCount: 500,
      createdAt: "2026-01-10T09:00:00.000Z",
      updatedAt: "2026-01-10T09:00:00.000Z",
    },
  ],
};

export default function AddressBookTable() {
  const navigate = useNavigate();

  // TODO: API 연동 시 아래 코드로 교체
  // const { mutateAsync: addAddressBookGroup } = useAddressBookGroupMutation();
  // const [filters, setFilters] = useQueryStates({
  //   page: parseAsInteger.withDefault(1),
  //   size: parseAsInteger.withDefault(10),
  //   keyword: parseAsString.withDefault(""),
  // });
  // const { data } = useAddressBookListQuery({ ...filters });

  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState("");

  function moveToDetail(groupId: number) {
    navigate(`/address-books/${groupId}`);
  }

  function handleSearch(_value: string) {
    // TODO: void setFilters({ keyword: _value, page: 1 });
  }

  async function handleAddGroup(groupName: string) {
    // TODO: await addAddressBookGroup({ groupName });
    toast.success(`"${groupName}" 그룹이 추가되었습니다.`);
  }

  function handleAddMembers(groupName: string) {
    setSelectedGroupName(groupName);
    setAddMembersOpen(true);
  }

  const { table } = useDataTable({
    data: MOCK_ADDRESS_BOOK_LIST.content,
    columns: AddressBookTableColumns({ moveToDetail, handleAddMembers }),
    pageCount: MOCK_ADDRESS_BOOK_LIST.totalPages,
    meta: {
      totalCount: MOCK_ADDRESS_BOOK_LIST.totalElements,
    },
  });

  return (
    <div className="rounded-md bg-white p-7">
      <DataTable
        table={table}
        actionBar={<AddressBookTableActionBar table={table} />}
      >
        <AddressBookTableSearch
          onSearch={handleSearch}
          onAddGroup={handleAddGroup}
        />
      </DataTable>
      <AddressBookAddMembersDialog
        open={addMembersOpen}
        onOpenChange={setAddMembersOpen}
        initialGroupName={selectedGroupName}
      />
    </div>
  );
}
