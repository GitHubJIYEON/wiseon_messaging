import { useCallback, useMemo, useRef, useState } from "react";
import type { ColumnDef, Table } from "@tanstack/react-table";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormTable } from "@/features/messaging/components/addressBook/formTable/FormTable";
import { FormTableSchema } from "@/features/messaging/components/addressBook/schemas/formTable";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@/shared/components/dataTable/DataTableActionBar";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Form } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";

const MAX_ROW_COUNT = 10_000;
const MAX_COLUMN_COUNT = 50;

interface AddressBook {
  id: number;
  title: string;
  contactCount: number;
  registeredAt: string;
}

const MOCK_ADDRESS_BOOKS: AddressBook[] = [
  {
    id: 4,
    title: "VIP 고객 주소록",
    contactCount: 1280,
    registeredAt: "2026-03-10T10:00:00",
  },
  {
    id: 3,
    title: "신규 가입 고객",
    contactCount: 340,
    registeredAt: "2026-03-08T14:00:00",
  },
  {
    id: 2,
    title: "이벤트 신청자",
    contactCount: 892,
    registeredAt: "2026-03-05T11:00:00",
  },
  {
    id: 1,
    title: "세미나 초청 대상자",
    contactCount: 84,
    registeredAt: "2026-03-01T09:00:00",
  },
];

const INITIAL_TABLE_VALUES: FormTableSchema = {
  title: "",
  columns: [
    { name: "이름", type: "NONE" },
    { name: "휴대폰번호", type: "PHONE" },
    { name: "이메일", type: "EMAIL" },
  ],
  rows: [["", "", ""]],
};

const formatDateTime = (value: string) =>
  format(new Date(value), "yyyy.MM.dd HH:mm");

const formatCount = (value: number) =>
  new Intl.NumberFormat("ko-KR").format(value);

export default function AddressBookTable() {
  const [addressBooks, setAddressBooks] =
    useState<AddressBook[]>(MOCK_ADDRESS_BOOKS);
  const [selectedItem, setSelectedItem] = useState<AddressBook | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const tableRef = useRef<HTMLDivElement>(null);

  const editForm = useForm<FormTableSchema>({
    defaultValues: INITIAL_TABLE_VALUES,
  });
  const {
    fields: rowFields,
    append: appendRow,
    remove: removeRow,
  } = useFieldArray({ control: editForm.control, name: "rows" });

  const columnCount = editForm.watch("columns")?.length ?? 0;

  const [filters, setFilters] = useQueryStates({ title: parseAsString });

  const filteredData = useMemo(() => {
    if (!filters.title) return addressBooks;
    return addressBooks.filter((item) =>
      item.title.toLowerCase().includes(filters.title!.toLowerCase()),
    );
  }, [addressBooks, filters.title]);

  const handleOpenDetail = useCallback(
    (item: AddressBook) => {
      setSelectedItem(item);
      setEditTitle(item.title);
      editForm.reset(INITIAL_TABLE_VALUES);
    },
    [editForm],
  );

  const handleCloseDetail = () => {
    setSelectedItem(null);
    editForm.reset(INITIAL_TABLE_VALUES);
  };

  const handleAddRow = () => {
    if (rowFields.length >= MAX_ROW_COUNT) {
      toast.error(`행은 최대 ${MAX_ROW_COUNT}개까지 추가할 수 있습니다.`);
      return;
    }
    appendRow([Array(editForm.getValues("columns").length).fill("")]);
    requestAnimationFrame(() => {
      tableRef.current?.scrollTo({
        top: tableRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const handleAddColumn = () => {
    const currentColumns = editForm.getValues("columns");
    if (currentColumns.length >= MAX_COLUMN_COUNT) {
      toast.error(`컬럼은 최대 ${MAX_COLUMN_COUNT}개까지 추가할 수 있습니다.`);
      return;
    }
    editForm.setValue(
      "columns",
      [...currentColumns, { name: "", type: "NONE" }],
      { shouldValidate: false },
    );
    editForm.setValue(
      "rows",
      editForm.getValues("rows").map((row) => [...row, ""]),
      { shouldValidate: false },
    );
    requestAnimationFrame(() => {
      tableRef.current?.scrollTo({
        left: tableRef.current.scrollWidth,
        behavior: "smooth",
      });
    });
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (rowFields.length === 1) {
      toast.error("행은 최소 1개 이상 입력해주세요.");
      return;
    }
    removeRow(rowIndex);
  };

  const handleRemoveColumn = (columnIndex: number) => {
    const currentColumns = editForm.getValues("columns");
    if (currentColumns.length === 1) {
      toast.error("컬럼은 최소 1개 이상 필요합니다.");
      return;
    }
    editForm.setValue(
      "columns",
      currentColumns.filter((_, i) => i !== columnIndex),
      { shouldValidate: false },
    );
    editForm.setValue(
      "rows",
      editForm
        .getValues("rows")
        .map((row) => row.filter((_, i) => i !== columnIndex)),
      { shouldValidate: false },
    );
  };

  const handleSubmitEdit = () => {
    if (!editTitle.trim()) {
      toast.error("주소록 그룹명을 입력해주세요.");
      return;
    }
    const validRows = editForm
      .getValues("rows")
      .filter((row) => row.some((cell) => cell.trim() !== ""));
    if (validRows.length === 0) {
      toast.error("입력 테이블에 최소 1명 이상 입력해주세요.");
      return;
    }
    setAddressBooks((prev) =>
      prev.map((item) =>
        item.id === selectedItem!.id
          ? { ...item, title: editTitle.trim(), contactCount: validRows.length }
          : item,
      ),
    );
    toast.success("주소록 정보를 수정했습니다.");
    handleCloseDetail();
  };

  const handleReset = useCallback(() => {
    setFilters({ title: null });
  }, [setFilters]);

  const handleDeleteSelected = useCallback((table: Table<AddressBook>) => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id);
    setAddressBooks((prev) =>
      prev.filter((item) => !selectedIds.includes(item.id)),
    );
    table.toggleAllRowsSelected(false);
    toast.success(`${selectedIds.length}개의 주소록을 삭제했습니다.`);
  }, []);

  const columns = useMemo<ColumnDef<AddressBook>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="전체 선택"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="행 선택"
            />
          </div>
        ),
        size: 48,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "title",
        accessorKey: "title",
        header: "주소록 그룹명",
        cell: ({ row }) => (
          <div className="max-w-[400px] overflow-hidden px-2.5 text-start text-ellipsis">
            {row.getValue<string>("title")}
          </div>
        ),
        size: 400,
      },
      {
        id: "registeredAt",
        accessorKey: "registeredAt",
        header: "등록 일시",
        cell: ({ row }) => (
          <div className="px-2.5">
            {formatDateTime(row.getValue<string>("registeredAt"))}
          </div>
        ),
        size: 180,
      },
      {
        id: "contactCount",
        accessorKey: "contactCount",
        header: "대상자 수",
        cell: ({ row }) => (
          <div className="px-2.5">
            {formatCount(row.getValue<number>("contactCount"))}명
          </div>
        ),
        size: 140,
      },
      {
        id: "actions",
        header: "구성원 추가",
        cell: ({ row }) => (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="outline"
              className="h-8 px-3 text-[13px]"
              onClick={() => handleOpenDetail(row.original)}
            >
              구성원 추가
            </Button>
          </div>
        ),
        size: 100,
      },
      {
        id: "detail",
        header: "상세보기",
        cell: () => {
          return (
            <div className="flex items-center justify-center">
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-[13px]"
              >
                상세보기
              </Button>
            </div>
          );
        },
        size: 100,
      },
    ],
    [handleOpenDetail],
  );

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: 1,
    meta: { totalCount: filteredData.length },
    getRowId: (row) => String(row.id),
  });

  return (
    <>
      <DataTable
        table={table}
        className="bg-white"
        actionBar={
          <DataTableActionBar table={table}>
            <DataTableActionBarSelection table={table} />
            <DataTableActionBarAction
              tooltip="선택 항목 삭제"
              onClick={() => handleDeleteSelected(table)}
            >
              <Trash2 />
              삭제
            </DataTableActionBarAction>
          </DataTableActionBar>
        }
      >
        <section className="mb-2.5 flex items-center justify-between">
          <h2 className="font-apple-medium text-lg text-gray-700">
            총 {filteredData.length}개
          </h2>
          <div className="flex h-10 items-center gap-1">
            <Input
              placeholder="주소록 그룹명"
              value={filters.title ?? ""}
              onChange={(e) =>
                setFilters({ title: e.target.value.trim() || null })
              }
              className="h-[42px] w-[229px] rounded text-[13px]/5 text-gray-700 placeholder:text-gray-500"
            />
            <Button
              type="button"
              variant="outline"
              className="font-apple-medium h-[42px] w-[76px] rounded text-[14px]/[24px] text-gray-700"
              onClick={handleReset}
            >
              초기화
            </Button>
          </div>
        </section>
      </DataTable>

      <Dialog
        open={selectedItem !== null}
        onOpenChange={(open) => !open && handleCloseDetail()}
      >
        <DialogContent className="max-w-[720px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>주소록 수정</DialogTitle>
          </DialogHeader>

          <div className="p-8">
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 space-y-2">
                <label
                  htmlFor="edit-address-book-title"
                  className="font-apple-medium text-[14px] leading-5 text-gray-700"
                >
                  주소록 그룹명
                </label>
                <Input
                  id="edit-address-book-title"
                  value={editTitle}
                  placeholder="예: 기관 1차 만족도 조사"
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-apple-medium text-[14px] leading-5 text-gray-700">
                    입력 테이블
                  </p>
                  <p className="font-apple-light text-[13px] leading-5 text-gray-500">
                    최대 {MAX_ROW_COUNT.toLocaleString()}행, {MAX_COLUMN_COUNT}
                    열
                  </p>
                </div>

                <div className="rounded-[12px] border border-gray-300 px-4 py-3">
                  <Form {...editForm}>
                    <div className="flex min-h-0 flex-1 flex-col">
                      <FormTable
                        ref={tableRef}
                        columnCount={columnCount}
                        rowFields={rowFields}
                        onAddRow={handleAddRow}
                        onAddColumn={handleAddColumn}
                        onRemoveRow={handleRemoveRow}
                        onRemoveColumn={handleRemoveColumn}
                      />
                    </div>
                  </Form>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8 flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDetail}
              >
                취소
              </Button>
              <Button type="button" onClick={handleSubmitEdit}>
                수정하기
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
