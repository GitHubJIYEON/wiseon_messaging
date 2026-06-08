import { useRef, useState } from "react";
import { DownloadIcon, FileUp, PlusIcon, Trash2Icon, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

const MAX_ROW_COUNT = 1000;
const MAX_COLUMN_COUNT = 10;

const ACCEPTED_EXTENSIONS =
  ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv";

type MemberRow = {
  name: string;
  phone: string;
  [key: string]: string;
};

type FormValues = {
  groupName: string;
  rows: MemberRow[];
};

interface AddressBookAddMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialGroupName?: string;
}

export default function AddressBookAddMembersDialog({
  open,
  onOpenChange,
  initialGroupName = "",
}: AddressBookAddMembersDialogProps) {
  const [excelFileName, setExcelFileName] = useState<string | null>(null);
  const [columnCount, setColumnCount] = useState(2);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      groupName: initialGroupName,
      rows: [{ name: "", phone: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rows",
  });

  const columnHeaders = [
    "이름",
    "전화번호",
    ...Array.from({ length: columnCount - 2 }, (_, i) => `컬럼 ${i + 3}`),
  ];

  function handleExcelFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);
  }

  function resetExcelSelection() {
    setExcelFileName(null);
    if (excelInputRef.current) excelInputRef.current.value = "";
  }

  function handleAddRow() {
    if (fields.length >= MAX_ROW_COUNT) return;
    append({ name: "", phone: "" });
  }

  function handleAddColumn() {
    if (columnCount >= MAX_COLUMN_COUNT) return;
    setColumnCount((prev) => prev + 1);
  }

  function handleRemoveColumn() {
    if (columnCount <= 2) return;
    setColumnCount((prev) => prev - 1);
  }

  function handleSubmit(values: FormValues) {
    console.log("구성원 추가:", values);
    onOpenChange(false);
  }

  function handleClose() {
    form.reset({
      groupName: initialGroupName,
      rows: [{ name: "", phone: "" }],
    });
    setExcelFileName(null);
    setColumnCount(2);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-[720px] p-0" showCloseButton>
        <DialogHeader>
          <DialogTitle>주소록 구성원 추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-5 p-7">
            {/* 그룹명 */}
            <Field id="add-members-group-name">
              <FieldLabel
                htmlFor="add-members-group-name"
                className="font-apple-medium text-sm leading-5 text-gray-700"
              >
                주소록 그룹명
              </FieldLabel>
              <Input
                id="add-members-group-name"
                placeholder="예: 기관 1차 만족도 조사"
                {...form.register("groupName")}
              />
            </Field>

            {/* 엑셀 파일 */}
            <Field id="add-members-excel-file">
              <FieldLabel
                htmlFor="add-members-excel-file"
                className="font-apple-medium text-sm leading-5 text-gray-700"
              >
                파일 등록 <Badge variant="secondary">선택</Badge>
              </FieldLabel>
              <div className="bg-point-gray-100 flex min-h-[52px] flex-row items-center justify-between rounded-md border px-4 py-3">
                <p className="font-apple-medium min-w-0 flex-1 truncate text-sm leading-5 text-gray-700">
                  {excelFileName ? excelFileName : "파일 선택"}
                </p>
                {excelFileName ? (
                  <div>
                    <Input
                      type="text"
                      value={excelFileName}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={resetExcelSelection}
                      className="h-auto"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-400 bg-white px-4 py-2 text-center hover:bg-gray-100"
                    onClick={() => excelInputRef.current?.click()}
                  >
                    <Input
                      type="file"
                      accept={ACCEPTED_EXTENSIONS}
                      className="hidden"
                    />
                    <FileUp className="size-4 text-gray-600" />{" "}
                    <span className="text-[13px] leading-5 text-gray-700">
                      파일 선택
                    </span>
                  </div>
                )}
                <div className="flex shrink-0 flex-wrap items-center pl-4">
                  <Button type="button" variant="outline" onClick={() => {}}>
                    <DownloadIcon className="size-3.5" />
                    샘플 다운로드
                  </Button>
                </div>
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  className="hidden"
                  onChange={handleExcelFileChange}
                />
              </div>
              <FieldDescription className="text-[13px] text-gray-500">
                엑셀 또는 CSV 파일
              </FieldDescription>
            </Field>

            {/* 입력 테이블 */}
            <div className="col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-apple-medium text-[14px] leading-5 text-gray-700">
                  입력 테이블
                </p>
                <p className="font-apple-light text-[13px] leading-5 text-gray-500">
                  최대 {MAX_ROW_COUNT.toLocaleString()}행, {MAX_COLUMN_COUNT}열
                </p>
              </div>

              <div className="rounded-md border border-gray-300 px-4 py-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {columnHeaders
                          .slice(0, columnCount)
                          .map((header, colIdx) => (
                            <th
                              key={colIdx}
                              className="font-apple-medium px-2 py-2 text-left text-gray-600"
                            >
                              {header}
                            </th>
                          ))}
                        <th className="w-10 px-2 py-2">
                          <div className="flex gap-1">
                            {columnCount < MAX_COLUMN_COUNT && (
                              <button
                                type="button"
                                onClick={handleAddColumn}
                                className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                title="열 추가"
                              >
                                <PlusIcon className="size-3.5" />
                              </button>
                            )}
                            {columnCount > 2 && (
                              <button
                                type="button"
                                onClick={handleRemoveColumn}
                                className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                                title="마지막 열 삭제"
                              >
                                <Trash2Icon className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, rowIdx) => (
                        <tr
                          key={field.id}
                          className="border-b border-gray-100 last:border-0"
                        >
                          {columnHeaders
                            .slice(0, columnCount)
                            .map((_, colIdx) => {
                              const fieldKey =
                                colIdx === 0
                                  ? "name"
                                  : colIdx === 1
                                    ? "phone"
                                    : `col${colIdx}`;
                              return (
                                <td key={colIdx} className="px-2 py-1">
                                  <Input
                                    className="h-8 border-0 bg-transparent px-1 shadow-none focus-visible:ring-1"
                                    placeholder={columnHeaders[colIdx]}
                                    {...form.register(
                                      `rows.${rowIdx}.${fieldKey}` as any,
                                    )}
                                  />
                                </td>
                              );
                            })}
                          <td className="px-2 py-1">
                            <button
                              type="button"
                              onClick={() => remove(rowIdx)}
                              className="rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-red-500"
                            >
                              <Trash2Icon className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={handleAddRow}
                  className="mt-2 flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-[13px] text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                >
                  <PlusIcon className="size-3.5" />행 추가
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={handleClose}>
                취소
              </Button>
            </DialogClose>
            <Button type="submit">추가</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
