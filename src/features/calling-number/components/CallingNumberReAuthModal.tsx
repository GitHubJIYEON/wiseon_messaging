import { useRef, useState } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import { DownloadIcon, FileUp, X } from "lucide-react";
import {
  ACCEPTED_DOCUMENT_EXTENSIONS,
  DOCUMENT_FIELDS,
  type DocumentKey,
} from "@/features/calling-number/constants";
import type { CallingNumber } from "@/features/calling-number/types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
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
import { Textarea } from "@/shared/components/ui/textarea";

// ─── 커스텀 훅 ──────────────────────────────────────────────────────────────

function useDocumentFiles() {
  const empty = () =>
    Object.fromEntries(DOCUMENT_FIELDS.map(({ key }) => [key, null])) as Record<
      DocumentKey,
      File | null
    >;

  const [files, setFiles] = useState<Record<DocumentKey, File | null>>(empty);
  const inputRefs = useRef<Record<DocumentKey, HTMLInputElement | null>>(
    Object.fromEntries(
      DOCUMENT_FIELDS.map(({ key }) => [key, null]),
    ) as Record<DocumentKey, HTMLInputElement | null>,
  );

  const setFile = (key: DocumentKey, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  return { files, inputRefs, setFile };
}

// ─── 서브 컴포넌트 ───────────────────────────────────────────────────────────

interface DocumentUploadFieldProps {
  label: string;
  hasSample: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onTriggerClick: () => void;
  inputRef: (el: HTMLInputElement | null) => void;
}

function DocumentUploadField({
  label,
  hasSample,
  file,
  onFileChange,
  onTriggerClick,
  inputRef,
}: DocumentUploadFieldProps) {
  return (
    <div className="bg-point-gray-100 rounded-md border p-4">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex min-h-[52px] flex-row items-center">
        <p className="font-apple-medium min-w-0 flex-1 truncate text-sm leading-5 text-gray-700">
          {file?.name ?? "파일 선택"}
        </p>
        {file ? (
          <Button
            type="button"
            variant="ghost"
            className="h-auto"
            onClick={() => onFileChange(null)}
          >
            <X className="size-4" />
          </Button>
        ) : (
          <div
            className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-md border border-dashed border-gray-400 bg-white px-4 py-2 text-center hover:bg-gray-100"
            onClick={onTriggerClick}
          >
            <FileUp className="size-4 text-gray-600" />
            <span className="text-[13px] leading-5 text-gray-700">
              파일 선택
            </span>
          </div>
        )}
        {hasSample && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 pl-2">
            <Button type="button" variant="outline" onClick={() => {}}>
              <DownloadIcon className="size-3.5" />
              샘플 다운로드
            </Button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_DOCUMENT_EXTENSIONS}
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────

interface CallingNumberReAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: CallingNumber | null;
}

export default function CallingNumberReAuthModal({
  open,
  onOpenChange,
  item,
}: CallingNumberReAuthModalProps) {
  const { files, inputRefs, setFile } = useDocumentFiles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-2xl">
        <DialogHeader>
          <DialogTitle>발신번호 재인증</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[76vh] flex-col gap-4 overflow-y-auto p-7">
          {/* 반려 사유 */}
          <div className="rounded-md border border-red-200 bg-red-50/60 p-4">
            <p className="text-sm font-medium text-red-600">반려 사유</p>
            <p className="text-sm font-medium text-red-500">
              반려 사유 내용 입니다.
            </p>
          </div>

          {/* 기본 정보 */}
          <Field id="reauth-basic-info">
            <FieldLabel
              htmlFor="reauth-basic-info"
              className="font-apple-medium text-md leading-5 text-gray-700"
            >
              기본 정보
            </FieldLabel>
            <div className="rounded-md border p-4">
              <div className="flex items-center justify-start gap-2">
                <div className="w-20 text-sm font-medium text-gray-600">
                  발신번호
                </div>
                <div className="text-sm font-medium">{item?.phoneNumber}</div>
              </div>
              <div className="flex items-center justify-start gap-2">
                <div className="w-20 text-sm font-medium text-gray-600">
                  발신번호명
                </div>
                <div className="text-sm font-medium">{item?.name}</div>
              </div>
            </div>
          </Field>

          {/* 첨부서류 */}
          <Field id="reauth-documents-file">
            <FieldLabel
              htmlFor="reauth-documents-file"
              className="font-apple-medium text-md leading-5 text-gray-700"
            >
              첨부 서류
            </FieldLabel>
            <div className="flex flex-col gap-2">
              {DOCUMENT_FIELDS.map((field) => (
                <DocumentUploadField
                  key={field.key}
                  label={field.label}
                  hasSample={field.hasSample}
                  file={files[field.key]}
                  onFileChange={(file) => setFile(field.key, file)}
                  onTriggerClick={() => inputRefs.current[field.key]?.click()}
                  inputRef={(el) => {
                    inputRefs.current[field.key] = el;
                  }}
                />
              ))}
            </div>
          </Field>

          {/* 요청 내용 */}
          <Field id="reauth-request-note">
            <FieldLabel
              htmlFor="reauth-request-note"
              className="font-apple-medium text-md leading-5 text-gray-700"
            >
              요청 내용
            </FieldLabel>
            <FieldDescription>
              <Textarea
                placeholder="요청 내용을 입력해주세요."
                maxLength={500}
                defaultValue="고객센터 대표번호로 사용 예정입니다. 빠른 승인 부탁드립니다."
              />
            </FieldDescription>
          </Field>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:justify-between">
          <Button variant="dark">해지하기</Button>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button type="submit" variant="default">
              재인증
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
