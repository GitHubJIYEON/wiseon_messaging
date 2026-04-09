import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { isAxiosError } from "axios";
import { format, parseISO } from "date-fns";
import { PhoneOffIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { messagesApi } from "@/features/messaging/api/messagesApi";
import {
  MOCK_SENS_UNSUBSCRIBE_LIST,
  REGISTER_TYPE_LABEL,
  type SensUnsubscribeTableRow,
} from "@/features/messaging/components/blockAddress/sensUnsubscribeListData";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import {
  DataTableActionBar,
  DataTableActionBarAction,
} from "@/shared/components/dataTable/DataTableActionBar";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";

function formatRegisterTime(iso: string) {
  try {
    return format(parseISO(iso), "yyyy.MM.dd HH:mm:ss");
  } catch {
    return iso;
  }
}

function formatClientTelNo(digits: string) {
  const d = digits.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("010")) {
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10 && d.startsWith("02")) {
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  }
  if (d.length === 10) {
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return digits;
}

function registerTypeLabel(code: string) {
  return REGISTER_TYPE_LABEL[code] ?? code;
}

/** SENS 삭제 API: clientTelNo는 숫자만, 요청당 최대 1,000건 */
const UNSUBSCRIBE_DELETE_CHUNK = 1000;

function toDeletePayload(rows: SensUnsubscribeTableRow[]) {
  return rows
    .map((row) => ({
      clientTelNo: row.clientTelNo.replace(/\D/g, ""),
    }))
    .filter((p) => p.clientTelNo.length > 0);
}

export default function BlockAddressRegisterPage() {
  const [unsubscribeRows, setUnsubscribeRows] = useState<
    SensUnsubscribeTableRow[]
  >([]);
  const [isListLoading, setIsListLoading] = useState(false);

  const fetchUnsubscribes = useCallback(
    async (options?: { notify?: boolean }) => {
      setIsListLoading(true);
      try {
        setUnsubscribeRows(
          MOCK_SENS_UNSUBSCRIBE_LIST.map((row) => ({ ...row })),
        );
        if (options?.notify) {
          toast.success("목록을 새로고침했습니다.");
        }
      } finally {
        setIsListLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchUnsubscribes();
  }, [fetchUnsubscribes]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const handleRowSelectionChange = useCallback(
    (
      updater:
        | RowSelectionState
        | ((old: RowSelectionState) => RowSelectionState),
    ) => {
      setRowSelection((prev) =>
        typeof updater === "function" ? updater(prev) : updater,
      );
    },
    [],
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const pendingDeleteRef = useRef<{ clientTelNo: string }[]>([]);
  const [pendingDeleteCount, setPendingDeleteCount] = useState(0);

  const [customNumberInput, setCustomNumberInput] = useState("");
  const [customNumberTargetId, setCustomNumberTargetId] = useState<
    number | null
  >(null);

  const handleSaveCustomNumber = () => {
    if (customNumberTargetId === null) return;
  };

  const columns = useMemo<ColumnDef<SensUnsubscribeTableRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table: t }) => (
          <Checkbox
            checked={
              t.getIsAllPageRowsSelected()
                ? true
                : t.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(checked) =>
              t.toggleAllPageRowsSelected(checked === true)
            }
            aria-label="전체 선택"
          />
        ),
        cell: ({ row }) => (
          <div
            className="flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(checked) =>
                row.toggleSelected(checked === true)
              }
              aria-label="행 선택"
            />
          </div>
        ),
        size: 48,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "clientTelNo",
        accessorKey: "clientTelNo",
        header: "수신 거부 전화번호",
        size: 200,
        cell: ({ row }) => (
          <div className="px-2.5 text-center font-mono text-[13px]">
            {formatClientTelNo(row.getValue<string>("clientTelNo"))}
          </div>
        ),
      },
      {
        id: "registerTime",
        accessorKey: "registerTime",
        header: "등록 일시",
        size: 200,
        cell: ({ row }) => (
          <div className="font-apple-light px-2.5 text-center text-[13px] text-gray-800">
            {formatRegisterTime(row.getValue<string>("registerTime"))}
          </div>
        ),
      },
      {
        id: "registerType",
        accessorKey: "registerType",
        header: "유입 경로",
        size: 140,
        cell: ({ row }) => {
          const code = row.getValue<string>("registerType");
          const label = registerTypeLabel(code);
          return (
            <div className="flex items-center justify-center px-2.5">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                  code === "C"
                    ? "bg-sky-50 text-sky-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {label}
              </span>
            </div>
          );
        },
      },
    ],
    [],
  );

  const { table } = useDataTable({
    data: unsubscribeRows,
    columns,
    pageCount: 1,
    meta: { totalCount: unsubscribeRows.length },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    rowSelection,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const openDeleteDialog = useCallback(() => {
    const originals = table
      .getFilteredSelectedRowModel()
      .rows.map((r) => r.original);
    const payload = toDeletePayload(originals);
    if (payload.length === 0) {
      toast.error("삭제할 번호를 선택해 주세요.");
      return;
    }
    pendingDeleteRef.current = payload;
    setPendingDeleteCount(payload.length);
    setDeleteDialogOpen(true);
  }, [table]);

  const handleConfirmDelete = useCallback(async () => {
    const payload = pendingDeleteRef.current;
    if (payload.length === 0) {
      setDeleteDialogOpen(false);
      return;
    }
    setIsDeleting(true);
    try {
      for (let i = 0; i < payload.length; i += UNSUBSCRIBE_DELETE_CHUNK) {
        const chunk = payload.slice(i, i + UNSUBSCRIBE_DELETE_CHUNK);
        await messagesApi.deleteUnsubscribes(chunk);
      }
      toast.success(`${payload.length}건의 수신 거부 번호를 삭제했습니다.`);
      setRowSelection({});
      setDeleteDialogOpen(false);
      pendingDeleteRef.current = [];
      await fetchUnsubscribes();
    } catch (e) {
      const message = isAxiosError(e)
        ? (e.response?.data as { message?: string } | undefined)?.message
        : undefined;
      toast.error(
        message ??
          "수신 거부 번호 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsDeleting(false);
    }
  }, [fetchUnsubscribes]);

  return (
    <section className="mx-auto flex w-[1200px] flex-col gap-8 pb-[30px]">
      <div className="pt-10">
        <h1 className="font-apple-ultra text-center text-[32px] leading-[45px] text-[#1B1D21]">
          수신거부 관리 등록 후
        </h1>
        <p className="font-apple-light mt-3 text-center text-[16px] leading-6 text-gray-500">
          광고 메시지 수신을 거부한 번호를 조회하고, 직접 등록하거나 삭제할 수
          있습니다.
        </p>
      </div>

      {/* 수신거부번호 서비스 이용하면 보이는 컴포넌트 - 자동 제공  1개  */}
      <div className="rounded-lg border border-gray-300 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-primary-50 text-primary-500 flex h-12 w-12 items-center justify-center rounded-full">
              <PhoneOffIcon className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-apple-medium text-[16px] text-gray-600">
                수신거부 번호
              </h2>
              <div className="flex flex-row items-baseline gap-2">
                <span className="font-apple-bold text-[22px] leading-tight tracking-wide text-gray-900">
                  080-1111-2222
                </span>
                {/* <span className="font-apple-light text-[14px] text-gray-500">
                  기관명
                </span> */}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" className="h-[40px]" variant="outline">
              수신거부번호 철회
            </Button>
            <Button
              type="button"
              className="h-[40px]"
              onClick={() => setCustomNumberTargetId(1)}
            >
              수신거부번호 등록
            </Button>
          </div>
        </div>
      </div>

      {/* 수신거부 번호에 등록된 번호 목록 — SENS GET .../unsubscribes 응답 필드 정렬 */}
      <section className="bg-white">
        <h2 className="font-apple-medium mb-4 text-[20px] text-gray-800">
          수신 거부 등록 번호 목록
        </h2>
        <p className="font-apple-light mb-4 text-[13px] text-gray-500">
          광고 수신 거부로 등록된 번호입니다. (네이버 클라우드 SENS 수신 거부
          번호 조회 API 응답 필드: 수신 거부 전화번호, 등록 일시, 유입 경로)
        </p>
        <DataTable
          table={table}
          className="bg-white"
          actionBar={
            <DataTableActionBar table={table}>
              <div className="font-apple-medium flex h-7 items-center rounded-md border px-2.5 text-xs whitespace-nowrap text-gray-700">
                {selectedCount}건 선택
              </div>
              <DataTableActionBarAction
                tooltip="선택한 번호를 수신 거부 목록에서 삭제합니다."
                className="text-destructive hover:text-destructive border-red-200 bg-red-50/80 hover:bg-red-100/80"
                onClick={openDeleteDialog}
              >
                <Trash2Icon />
                선택 삭제
              </DataTableActionBarAction>
            </DataTableActionBar>
          }
        >
          <section className="mb-2.5 flex items-center justify-between gap-3">
            <h3 className="font-apple-medium text-lg text-gray-700">
              총 {unsubscribeRows.length}건
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              disabled={isListLoading}
              onClick={() => void fetchUnsubscribes({ notify: true })}
            >
              <RefreshCwIcon
                className={`size-4 ${isListLoading ? "animate-spin" : ""}`}
              />
              새로고침
            </Button>
          </section>
        </DataTable>
      </section>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) pendingDeleteRef.current = [];
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>수신 거부 번호 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 {pendingDeleteCount}건을 수신 거부 목록에서 삭제합니다. 이
              작업은 되돌릴 수 없습니다. 계속하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isDeleting}>
              취소
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeleting ? "삭제 중…" : "삭제"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={customNumberTargetId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCustomNumberTargetId(null);
            setCustomNumberInput("");
          }
        }}
      >
        <DialogContent className="w-[560px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>사용자 지정 수신거부 번호 추가</DialogTitle>
          </DialogHeader>

          <div className="p-8">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-apple-medium text-[14px] leading-5 text-gray-700">
                  전화번호 입력
                </p>
                <p className="font-apple-light text-[13px] leading-5 text-gray-500">
                  최대 1,000건
                </p>
              </div>
              <Textarea
                value={customNumberInput}
                onChange={(e) => setCustomNumberInput(e.target.value)}
                placeholder={
                  "수신거부할 전화번호를 입력해주세요.\n줄바꿈, 쉼표(,), 세미콜론(;)으로 구분합니다.\n\n예:\n01012345678\n010-9876-5432\n01011112222, 01033334444"
                }
                className="min-h-[200px] resize-none bg-white"
              />
              <div className="mt-2 flex items-center justify-between text-[13px] leading-5 text-gray-500">
                <span>숫자 외 문자(하이픈 등)는 자동으로 제거됩니다.</span>
                {/* <span>
                  {parsedPhoneCount > 0
                    ? `${parsedPhoneCount}건 인식됨`
                    : "번호를 입력해주세요"}
                </span> */}
              </div>
            </div>

            <DialogFooter className="mt-8 flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCustomNumberTargetId(null)}
              >
                취소
              </Button>
              <Button type="button" onClick={handleSaveCustomNumber}>
                등록하기
                {/* {isCustomNumberSaving
                  ? "등록 중..."
                  : `등록하기 (${parsedPhoneCount}건)`} */}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
