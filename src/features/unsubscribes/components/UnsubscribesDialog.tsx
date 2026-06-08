import { useRef, useState } from "react";
import { DownloadIcon, FileUp, X } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];
const ACCEPTED_EXTENSIONS = ".xlsx,.xls,.csv";

interface UnsubscribesDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export default function UnsubscribesDialog({
  open: controlledOpen,
  onOpenChange,
  trigger,
}: UnsubscribesDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  function applyFile(file: File | null) {
    if (!file) return;
    if (
      !ACCEPTED_TYPES.includes(file.type) &&
      !file.name.match(/\.(xlsx|xls|csv)$/i)
    ) {
      alert("xlsx, xls, csv 파일만 등록할 수 있습니다.");
      return;
    }
    setSelectedFile(file);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFile(e.target.files?.[0] ?? null);
  };
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        trigger
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline">번호 추가</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>수신거부 번호 추가</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 p-7">
          {/* 일괄 파일 등록 */}
          <Field>
            <FieldLabel className="font-apple-semibold">
              파일 등록 <Badge variant="secondary">선택</Badge>
            </FieldLabel>
            <div className="bg-point-gray-100 flex min-h-[52px] flex-row items-center justify-between rounded-md border px-4 py-3">
              <p className="font-apple-medium min-w-0 flex-1 truncate text-[14px] leading-5 text-gray-700">
                {selectedFile ? selectedFile.name : "파일 선택"}
              </p>
              {selectedFile ? (
                <div>
                  <Input
                    type="text"
                    value={selectedFile.name}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemoveFile}
                    className="h-auto"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-400 bg-white px-4 py-2 text-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Input
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    className="hidden"
                    onChange={(e) => {
                      applyFile(e.target.files?.[0] ?? null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
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
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <FieldDescription className="text-[13px] text-gray-500">
              엑셀 또는 CSV 파일
            </FieldDescription>
          </Field>
          {/* 직접 등록 */}
          <Field>
            <FieldLabel
              htmlFor="input-field-username"
              className="font-apple-semibold"
            >
              직접 입력
            </FieldLabel>
            <Textarea
              placeholder={
                "수신거부 번호를 입력해주세요.\n줄바꿈, 쉼표(,), 세미콜론(;)으로 구분합니다. \n\n예시:\n01012345678\n010-9876-5432\n01011112222, 01033334444"
              }
              className="min-h-[200px] resize-none bg-white"
            />
            <div className="flex items-center justify-between text-[13px] leading-5 text-gray-500">
              <span>숫자 외 문자 (-, /, 공백 등)는 자동 제거</span>
            </div>
          </Field>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button type="submit">추가</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
