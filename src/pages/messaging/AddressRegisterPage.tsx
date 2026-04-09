import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DownloadIcon, FileUpIcon, PlusIcon, RotateCcw } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormTable } from "@/features/surveys/deploy/personalLink/components/personalLinkTable/formTable/FormTable";
import { useUploadExcelMutation } from "@/features/surveys/deploy/personalLink/hooks/mutations/useUploadExcellMutation";
import { FormTableSchema } from "@/features/surveys/deploy/personalLink/schemas/formTable";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
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
import { downloadBlobAsFile } from "@/shared/utils/downloadFiles";

type AddressBookRegisterMethod = "파일 업로드" | "직접 입력";
type AddressBookRegisterStatus = "등록 완료" | "검수중";

const MAX_ROW_COUNT = 10_000;
const MAX_COLUMN_COUNT = 50;
const TEMP_UPLOAD_SID = 414;

interface AddressBookRegisterHistory {
  id: number;
  title: string;
  method: AddressBookRegisterMethod;
  targetCount: number;
  manager: string;
  registeredAt: string;
  status: AddressBookRegisterStatus;
}

interface ManualEntryFormState {
  addressBookTitle: string;
  memo: string;
}

const INITIAL_MANUAL_ENTRY_FORM: ManualEntryFormState = {
  addressBookTitle: "",
  memo: "",
};

const INITIAL_MANUAL_TABLE_VALUES: FormTableSchema = {
  title: "",
  columns: [
    { name: "이름", type: "NONE" },
    { name: "휴대폰번호", type: "PHONE" },
    { name: "이메일", type: "EMAIL" },
  ],
  rows: [["", "", ""]],
};

const createInitialHistoryRows = (): AddressBookRegisterHistory[] => [
  {
    id: 104,
    title: "2026 봄 캠페인 안내 대상자",
    method: "파일 업로드",
    targetCount: 248,
    manager: "김민지",
    registeredAt: "2026-03-16T09:30:00",
    status: "등록 완료",
  },
  {
    id: 103,
    title: "신규 가입 고객 1차 발송",
    method: "직접 입력",
    targetCount: 1,
    manager: "박서준",
    registeredAt: "2026-03-15T17:10:00",
    status: "등록 완료",
  },
  {
    id: 102,
    title: "세미나 초청 대상자",
    method: "파일 업로드",
    targetCount: 84,
    manager: "이수빈",
    registeredAt: "2026-03-15T11:45:00",
    status: "검수중",
  },
  {
    id: 101,
    title: "VIP 고객 케어 리스트",
    method: "직접 입력",
    targetCount: 3,
    manager: "운영자",
    registeredAt: "2026-03-14T14:20:00",
    status: "등록 완료",
  },
];

const formatDateTime = (value: string) => {
  return format(new Date(value), "yyyy.MM.dd HH:mm");
};

const formatCount = (value: number) => {
  return new Intl.NumberFormat("ko-KR").format(value);
};

const getStatusBadgeClassName = (status: AddressBookRegisterStatus) => {
  if (status === "등록 완료") {
    return "border-positive-200 bg-positive-50 text-positive-600";
  }

  return "border-primary-200 bg-primary-50 text-primary-600";
};

const addressBookRegisterColumns: ColumnDef<AddressBookRegisterHistory>[] = [
  {
    id: "id",
    accessorKey: "id",
    header: "NO.",
    size: 80,
  },
  {
    id: "title",
    accessorKey: "title",
    header: "주소록명",
    cell: ({ row }) => (
      <div className="max-w-[320px] overflow-hidden px-2.5 text-start text-ellipsis">
        {row.getValue<string>("title")}
      </div>
    ),
    size: 320,
  },
  {
    id: "method",
    accessorKey: "method",
    header: "등록 방식",
    size: 140,
  },
  {
    id: "targetCount",
    accessorKey: "targetCount",
    header: "대상자 수",
    cell: ({ row }) => (
      <div className="px-2.5 text-end">
        {formatCount(row.getValue<number>("targetCount"))}명
      </div>
    ),
    size: 140,
  },
  {
    id: "manager",
    accessorKey: "manager",
    header: "등록자",
    size: 120,
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
    id: "status",
    accessorKey: "status",
    header: "상태",
    cell: ({ row }) => {
      const status = row.getValue<AddressBookRegisterStatus>("status");

      return (
        <div className="flex items-center justify-center">
          <Badge variant="outline" className={getStatusBadgeClassName(status)}>
            {status}
          </Badge>
        </div>
      );
    },
    size: 120,
  },
];

export default function AddressRegisterPage() {
  // const [searchParams] = useSearchParams();
  // const uploadSid = Number(searchParams.get("sid"));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualTableRef = useRef<HTMLDivElement>(null);
  const [historyRows, setHistoryRows] = useState<AddressBookRegisterHistory[]>(
    createInitialHistoryRows,
  );
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());
  const [manualEntryForm, setManualEntryForm] = useState<ManualEntryFormState>(
    INITIAL_MANUAL_ENTRY_FORM,
  );
  const { mutate: uploadExcelFile, isPending: isUploadingExcel } =
    useUploadExcelMutation(TEMP_UPLOAD_SID);
  const manualTableForm = useForm<FormTableSchema>({
    defaultValues: INITIAL_MANUAL_TABLE_VALUES,
  });
  const {
    fields: manualTableRowFields,
    append: appendManualTableRow,
    remove: removeManualTableRow,
  } = useFieldArray({
    control: manualTableForm.control,
    name: "rows",
  });

  const columns = useMemo(() => addressBookRegisterColumns, []);
  const manualTableColumnCount = manualTableForm.watch("columns")?.length ?? 0;

  const { table } = useDataTable({
    data: historyRows,
    columns,
    pageCount: 1,
    meta: {
      totalCount: historyRows.length,
    },
    getRowId: (row) => String(row.id),
  });

  const resetManualEntryForm = () => {
    setManualEntryForm(INITIAL_MANUAL_ENTRY_FORM);
    manualTableForm.reset(INITIAL_MANUAL_TABLE_VALUES);
  };

  const handleRefreshTable = () => {
    setHistoryRows((prev) =>
      [...prev].sort(
        (left, right) =>
          new Date(right.registeredAt).getTime() -
          new Date(left.registeredAt).getTime(),
      ),
    );
    setLastRefreshedAt(new Date());
    toast.success("주소록 등록 내역을 새로고침했습니다.");
  };

  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadSampleFile = () => {
    const csvContent = [
      ["이름", "휴대폰번호", "이메일"],
      ["홍길동", "01012345678", "hong@example.com"],
      ["김민지", "01087654321", "minji@example.com"],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    downloadBlobAsFile(blob, "address-book-sample.csv");
    toast.success("샘플 파일을 다운로드했습니다.");
  };

  const handleUploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validExtensions = [".xlsx", ".xls", ".csv"];
    const lowerCasedFileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some((extension) =>
      lowerCasedFileName.endsWith(extension),
    );

    if (!isValidExtension) {
      toast.error("엑셀 파일(.xlsx, .xls, .csv)만 업로드 가능합니다.");
      event.target.value = "";
      return;
    }

    uploadExcelFile(file, {
      onSuccess: (data) => {
        manualTableForm.reset({
          title: data.personalLinksTitle,
          columns: data.personalLinksItems.columns,
          rows: data.personalLinksItems.rows,
        });
        setManualEntryForm({
          addressBookTitle:
            data.personalLinksTitle || file.name.replace(/\.[^.]+$/, ""),
          memo: "",
        });
        setIsManualDialogOpen(true);
        toast.success("엑셀 데이터를 직접 입력 테이블에 불러왔습니다.");
      },
      onError: (error: Error) => {
        toast.error(error.message || "파일 업로드에 실패했습니다.");
      },
      onSettled: () => {
        event.target.value = "";
      },
    });
  };

  const handleChangeManualEntryForm = (
    key: keyof ManualEntryFormState,
    value: string,
  ) => {
    setManualEntryForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddManualTableRow = () => {
    if (manualTableRowFields.length >= MAX_ROW_COUNT) {
      toast.error(`행은 최대 ${MAX_ROW_COUNT}개까지 추가할 수 있습니다.`);
      return;
    }

    const nextColumnCount = manualTableForm.getValues("columns").length;
    const newRow = Array(nextColumnCount).fill("");

    appendManualTableRow([newRow]);

    requestAnimationFrame(() => {
      if (manualTableRef.current) {
        manualTableRef.current.scrollTo({
          top: manualTableRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  };

  const handleAddManualTableColumn = () => {
    const currentColumns = manualTableForm.getValues("columns");

    if (currentColumns.length >= MAX_COLUMN_COUNT) {
      toast.error(`컬럼은 최대 ${MAX_COLUMN_COUNT}개까지 추가할 수 있습니다.`);
      return;
    }

    const currentRows = manualTableForm.getValues("rows");
    const updatedRows = currentRows.map((row) => [...row, ""]);

    manualTableForm.setValue(
      "columns",
      [...currentColumns, { name: "", type: "NONE" }],
      {
        shouldValidate: false,
      },
    );
    manualTableForm.setValue("rows", updatedRows, {
      shouldValidate: false,
    });

    requestAnimationFrame(() => {
      if (manualTableRef.current) {
        manualTableRef.current.scrollTo({
          left: manualTableRef.current.scrollWidth,
          behavior: "smooth",
        });
      }
    });
  };

  const handleRemoveManualTableRow = (rowIndex: number) => {
    if (manualTableRowFields.length === 1) {
      toast.error("행은 최소 1개 이상 입력해주세요.");
      return;
    }

    removeManualTableRow(rowIndex);
  };

  const handleRemoveManualTableColumn = (columnIndex: number) => {
    const currentColumns = manualTableForm.getValues("columns");

    if (currentColumns.length === 1) {
      toast.error("컬럼은 최소 1개 이상 필요합니다.");
      return;
    }

    const updatedColumns = currentColumns.filter(
      (_, index) => index !== columnIndex,
    );
    const currentRows = manualTableForm.getValues("rows");
    const updatedRows = currentRows.map((row) =>
      row.filter((_, index) => index !== columnIndex),
    );

    manualTableForm.setValue("columns", updatedColumns, {
      shouldValidate: false,
    });
    manualTableForm.setValue("rows", updatedRows, {
      shouldValidate: false,
    });
  };

  const handleSubmitManualEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!manualEntryForm.addressBookTitle.trim()) {
      toast.error("주소록명을 입력해주세요.");
      return;
    }

    const validRows = manualTableForm
      .getValues("rows")
      .filter((row) => row.some((cell) => cell.trim() !== ""));

    if (validRows.length === 0) {
      toast.error("직접 입력 테이블에 최소 1명 이상 입력해주세요.");
      return;
    }

    const now = new Date();

    setHistoryRows((prev) => [
      {
        id: now.getTime(),
        title: manualEntryForm.addressBookTitle.trim(),
        method: "직접 입력",
        targetCount: validRows.length,
        manager: "운영자",
        registeredAt: now.toISOString(),
        status: "등록 완료",
      },
      ...prev,
    ]);
    setLastRefreshedAt(now);
    setIsManualDialogOpen(false);
    resetManualEntryForm();
    toast.success("직접 입력한 주소록을 등록했습니다.");
  };

  return (
    <>
      <section className="mx-auto flex w-[1200px] flex-col gap-8 pb-[30px]">
        <div className="pt-10">
          <h1 className="font-apple-ultra text-center text-[32px] leading-[45px] text-[#1B1D21]">
            주소록 등록
          </h1>
          <p className="font-apple-light mt-3 text-center text-[16px] leading-6 text-gray-500">
            파일 업로드 또는 직접 입력으로 발송 대상 주소록을 등록하고 이력을
            관리할 수 있습니다.
          </p>
        </div>

        {/* 파일 업로드 + 직접 입력 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 파일 업로드 */}
          <article className="rounded-[16px] border border-gray-300 bg-white p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary-50 text-primary-500 flex size-12 items-center justify-center rounded-full">
                <FileUpIcon className="size-5" />
              </div>
              <div>
                <h2 className="font-apple-medium text-[20px] leading-7 text-gray-700">
                  파일 업로드
                </h2>
                <p className="font-apple-light mt-1 text-[14px] leading-5 text-gray-500">
                  엑셀 또는 CSV 파일을 업로드해 주소록을 한 번에 등록합니다.
                </p>
              </div>
            </div>

            <div className="bg-point-gray-100 flex min-h-[220px] flex-col items-center justify-center rounded-[12px] border border-dashed border-gray-400 px-6 py-5 text-center">
              <div className="text-primary-500 flex size-14 items-center justify-center rounded-full bg-white shadow-sm">
                <FileUpIcon className="size-6" />
              </div>
              <p className="font-apple-medium mt-5 text-[18px] leading-6 text-gray-700">
                업로드할 파일을 선택해주세요
              </p>
              <p className="font-apple-light mt-2 text-[14px] leading-5 text-gray-500">
                지원 형식: `.xlsx`, `.xls`, `.csv`
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="dark"
                  className="mt-6 h-11 min-w-[160px]"
                  onClick={handleOpenFileSelector}
                  disabled={isUploadingExcel}
                >
                  파일 선택
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 h-11 min-w-[160px] bg-white"
                  onClick={handleDownloadSampleFile}
                >
                  <DownloadIcon className="size-4" />
                  샘플 파일 다운로드
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleUploadFile}
              />
            </div>
          </article>

          <article className="rounded-[16px] border border-gray-300 bg-white p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-point-gray-100 flex size-12 items-center justify-center rounded-full text-gray-700">
                <PlusIcon className="size-5" />
              </div>
              <div>
                <h2 className="font-apple-medium text-[20px] leading-7 text-gray-700">
                  직접 입력
                </h2>
                <p className="font-apple-light mt-1 text-[14px] leading-5 text-gray-500">
                  단건 등록이나 긴급 발송 대상자는 모달에서 바로 추가할 수
                  있습니다.
                </p>
              </div>
            </div>

            <div className="bg-point-gray-100 flex min-h-[220px] flex-col justify-between rounded-[12px] border border-gray-300 p-6">
              <div className="space-y-3">
                <p className="font-apple-medium text-[18px] leading-6 text-gray-700">
                  빠르게 한 명씩 등록하세요
                </p>
                <ul className="font-apple-light list-disc space-y-1 pl-5 text-[14px] leading-6 text-gray-500">
                  <li>주소록명, 수신자 이름, 휴대폰 번호를 입력해 즉시 등록</li>
                  <li>이메일과 메모를 함께 남겨 후속 작업까지 관리</li>
                  <li>등록 직후 하단 이력 테이블에서 최신 상태 확인</li>
                </ul>
              </div>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 h-11 min-w-[160px] self-start bg-white"
                  onClick={() => setIsManualDialogOpen(true)}
                >
                  <PlusIcon className="size-4" />
                  직접 입력하기
                </Button>
              </div>
            </div>
          </article>
        </div>

        {/* 주소록 등록 내역 테이블 */}
        {/* <section className="bg-white p-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-apple-medium text-[20px] leading-7 text-gray-700">
                주소록 등록 내역
              </h2>
              <p className="font-apple-light mt-2 text-[14px] leading-5 text-gray-500">
                총 {historyRows.length}건
                <span className="mx-2 text-gray-300">|</span>
                마지막 갱신 {format(lastRefreshedAt, "yyyy.MM.dd HH:mm")}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={handleRefreshTable}
            >
              <RotateCcw className="size-4" />
              새로고침
            </Button>
          </div>

          <DataTable table={table} className="bg-white" />
        </section> */}
      </section>

      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="max-w-[720px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>주소록 직접 입력</DialogTitle>
          </DialogHeader>

          <form className="p-8" onSubmit={handleSubmitManualEntry}>
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 space-y-2">
                <label
                  htmlFor="addressBookTitle"
                  className="font-apple-medium text-[14px] leading-5 text-gray-700"
                >
                  주소록 그룹명
                </label>
                <Input
                  id="addressBookTitle"
                  value={manualEntryForm.addressBookTitle}
                  placeholder="예: 기관 1차 만족도 조사"
                  onChange={(event) =>
                    handleChangeManualEntryForm(
                      "addressBookTitle",
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-apple-medium text-[14px] leading-5 text-gray-700">
                    직접 입력 테이블
                  </p>
                  <p className="font-apple-light text-[13px] leading-5 text-gray-500">
                    최대 {MAX_ROW_COUNT.toLocaleString()}행, {MAX_COLUMN_COUNT}
                    열
                  </p>
                </div>

                <div className="rounded-[12px] border border-gray-300 px-4 py-3">
                  <Form {...manualTableForm}>
                    <div className="flex min-h-0 flex-1 flex-col">
                      <FormTable
                        ref={manualTableRef}
                        columnCount={manualTableColumnCount}
                        rowFields={manualTableRowFields}
                        onAddRow={handleAddManualTableRow}
                        onAddColumn={handleAddManualTableColumn}
                        onRemoveRow={handleRemoveManualTableRow}
                        onRemoveColumn={handleRemoveManualTableColumn}
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
                onClick={() => {
                  setIsManualDialogOpen(false);
                  resetManualEntryForm();
                }}
              >
                취소
              </Button>
              <Button type="submit">등록하기</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
