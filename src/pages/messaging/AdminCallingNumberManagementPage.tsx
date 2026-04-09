import { useCallback, useState } from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { AdminCallingNumber } from "@/features/messaging/components/callingNumber/adminCallingNumberData";
import AdminCallingNumberTable from "@/features/messaging/components/callingNumber/AdminCallingNumberTable";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@/shared/components/dataTable/DataTableActionBar";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";

export default function AdminCallingNumberManagementPage() {
  const [selectedItems, setSelectedItems] = useState<AdminCallingNumber[]>([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const DELETE_CONFIRM_TEXT = "삭제된 발신번호는 복구할 수 없습니다.";
  const isDeleteConfirmed = deleteConfirmInput === DELETE_CONFIRM_TEXT;

  const handleSelectionChange = useCallback((items: AdminCallingNumber[]) => {
    setSelectedItems(items);
  }, []);

  const handleOpenDeleteModal = useCallback(() => {
    if (selectedItems.length === 0) return;
    setDeleteConfirmInput("");
    setIsDeleteModalOpen(true);
  }, [selectedItems]);

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmInput("");
  };

  const handleConfirmDelete = () => {
    if (!isDeleteConfirmed) return;
    toast.success(`${selectedItems.length}건의 발신번호가 삭제되었습니다.`);
    handleCloseDeleteModal();
    setSelectedItems([]);
  };

  const { table: actionBarTable } = useDataTable({
    data: selectedItems,
    columns: [],
    pageCount: 1,
    getRowId: (row) => String(row.id),
  });

  return (
    <section className="mx-auto w-[1200px] rounded-xl px-8 pb-[30px]">
      <h1 className="font-apple-ultra pt-10 text-center text-[32px] leading-[45px] text-[#1B1D21]">
        기관별 발신번호 관리
      </h1>
      <p className="font-apple-light mb-10 text-center text-[16px] leading-6 text-gray-500">
        사용자 또는 관리자가 신청한 발신번호를 검수·승인·반려합니다.
      </p>

      <div>
        <h2 className="font-apple-medium mb-4 text-[20px] text-gray-800">
          발신번호 목록
        </h2>
        <AdminCallingNumberTable
          onSelectionChange={handleSelectionChange}
          actionBar={
            <DataTableActionBar
              table={actionBarTable}
              visible={selectedItems.length > 0}
            >
              <DataTableActionBarSelection table={actionBarTable} />
              <Separator
                orientation="vertical"
                className="hidden data-[orientation=vertical]:h-5 sm:block"
              />
              <DataTableActionBarAction
                size="icon"
                tooltip="선택 삭제"
                onClick={handleOpenDeleteModal}
              >
                <Trash2Icon />
              </DataTableActionBarAction>
            </DataTableActionBar>
          }
        />
      </div>

      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => !open && handleCloseDeleteModal()}
      >
        <DialogContent className="w-[520px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>발신번호 삭제</DialogTitle>
          </DialogHeader>

          <div className="px-8 py-6">
            <p className="font-apple-light text-[14px] leading-6 text-gray-700">
              선택한{" "}
              <span className="font-apple-medium">
                {selectedItems.length}건
              </span>
              의 발신번호를 삭제하시겠습니까?
            </p>

            {selectedItems.length <= 5 && (
              <ul className="mt-3 space-y-1">
                {selectedItems.map((item) => (
                  <li
                    key={item.id}
                    className="font-apple-light text-[13px] text-gray-500"
                  >
                    • {item.phoneNumber} ({item.organizationName} · {item.name})
                  </li>
                ))}
              </ul>
            )}

            <p className="font-apple-light mt-3 text-[13px] leading-5 text-gray-500">
              삭제된 발신번호는 복구할 수 없으며, 해당 번호로는 더 이상 메시지를
              발송할 수 없습니다.
            </p>

            <div className="mt-5 space-y-2">
              <Label
                htmlFor="delete-confirm-input"
                className="font-apple-medium text-[13px] text-gray-600"
              >
                아래 문구를 정확히 입력해주세요.
              </Label>
              <p className="font-apple-light rounded border border-red-100 bg-red-50/50 px-3 py-2 text-[13px] leading-5 text-red-500 select-none">
                {DELETE_CONFIRM_TEXT}
              </p>
              <Input
                id="delete-confirm-input"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder="위 문구를 입력해주세요"
                className="h-[42px] text-[13px]"
              />
            </div>

            <DialogFooter className="mt-6 flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDeleteModal}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                onClick={handleConfirmDelete}
                disabled={!isDeleteConfirmed}
              >
                {selectedItems.length}건 삭제
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
