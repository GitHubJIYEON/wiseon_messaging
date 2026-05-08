import { useCallback } from "react";
import { type Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { BlockItem } from "@/features/unsubscribes/types";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@/shared/components/dataTable/DataTableActionBar";
import { Separator } from "@/shared/components/ui/separator";

interface UnsubscribesTableActionBarProps {
  table: Table<BlockItem>;
}

export default function UnsubscribesTableActionBar({
  table,
}: UnsubscribesTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;

  const onDelete = useCallback(() => {
    if (rows.length === 0) return;
    // TODO: 삭제 mutation 연동
    toast.success(`${rows.length}건 수신거부 번호가 삭제되었습니다.`);
    table.toggleAllRowsSelected(false);
  }, [rows, table]);

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-5 sm:block"
      />
      <div className="flex items-center gap-1.5">
        <DataTableActionBarAction
          size="icon"
          tooltip="수신거부 삭제"
          isPending={false}
          onClick={onDelete}
        >
          <Trash2 color="#000" />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  );
}
