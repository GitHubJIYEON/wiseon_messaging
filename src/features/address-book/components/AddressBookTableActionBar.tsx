import { useCallback } from "react";
import { type Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@/shared/components/dataTable/DataTableActionBar";
import { Separator } from "@/shared/components/ui/separator";
import { useDeleteAddressBookGroupMutation } from "../hooks/mutations/useAddressBookGroupMutation";
import type { AddressBookGroupItem } from "../types/addressBookGroup";

interface AddressBookTableActionBarProps {
  table: Table<AddressBookGroupItem>;
}

export default function AddressBookTableActionBar({
  table,
}: AddressBookTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const { mutate: deleteAddressBookGroups, isPending } =
    useDeleteAddressBookGroupMutation();

  const onDelete = useCallback(() => {
    if (rows.length === 0) return;

    deleteAddressBookGroups(
      rows.map((row) => Number(row.original.groupId)),
      {
        onSuccess: () => {
          toast.success(`${rows.length}건 주소록 그룹이 삭제되었습니다.`);
          table.toggleAllRowsSelected(false);
        },
        onError: (error) => {
          toast.error(`주소록 그룹 삭제 실패: ${error.message}`);
        },
      },
    );
  }, [rows, deleteAddressBookGroups]);

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <Separator
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-5 sm:block"
      />
      <div className="flex items-center gap-1.5">
        <DataTableActionBarAction
          size="icon"
          tooltip="주소록 그룹 삭제"
          isPending={isPending}
          onClick={onDelete}
        >
          <Trash2 color="#000" />
        </DataTableActionBarAction>
      </div>
      <DataTableActionBarSelection table={table} />
    </DataTableActionBar>
  );
}
