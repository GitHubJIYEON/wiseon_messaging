import { useState } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import { useAddressBookGroupMutation } from "../hooks/mutations/useAddressBookGroupMutation";
import { useAddressBookListQuery } from "../hooks/queries/useAddressBookListQuery";
import AddressBookAddMembersDialog from "./AddressBookAddMembersDialog";
import AddressBookTableActionBar from "./AddressBookTableActionBar";
import AddressBookTableColumns from "./AddressBookTableColumns";
import AddressBookTableSearch from "./AddressBookTableSearch";

export default function AddressBookTable() {
  const navigate = useNavigate();

  const { mutateAsync: addAddressBookGroup } = useAddressBookGroupMutation();

  // ── URL 쿼리 파라미터: 요청에 필요한 값만 관리
  const [filters, setFilters] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    size: parseAsInteger.withDefault(10),
    keyword: parseAsString.withDefault(""),
  });

  const { data: addressBookGroupList } = useAddressBookListQuery({
    ...filters,
  });

  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState("");

  function moveToDetail(groupId: number) {
    navigate(`/address-book/${groupId}`);
  }

  function handleSearch(value: string) {
    void setFilters({ keyword: value, page: 1 });
  }

  async function handleAddGroup(groupName: string) {
    await addAddressBookGroup({ groupName });
    toast.success(`"${groupName}" 그룹이 추가되었습니다.`);
  }

  function handleAddMembers(groupName: string) {
    setSelectedGroupName(groupName);
    setAddMembersOpen(true);
  }

  const { table } = useDataTable({
    data: addressBookGroupList?.content || [],
    columns: AddressBookTableColumns({ moveToDetail, handleAddMembers }),
    pageCount: addressBookGroupList?.totalPages ?? 1,
    meta: {
      totalCount: addressBookGroupList?.totalElements,
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
