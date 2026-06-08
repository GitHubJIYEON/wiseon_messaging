import { useCallback, useMemo, useRef, useState } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import { DownloadIcon, FileTextIcon, FileUp, X } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { getCallingNumberColumns } from "@/features/calling-number/columns";
import callingNumberDetailData from "@/features/calling-number/data/callingNumberDetail.json";
import callingNumbersData from "@/features/calling-number/data/callingNumbers.json";
import type { CallingNumber } from "@/features/calling-number/types";
import { DataTable } from "@/shared/components/dataTable/DataTable";
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
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Textarea } from "@/shared/components/ui/textarea";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import CallingNumberTableSearch from "./CallingNumberTableSearch";

const PAGE_SIZE = 10;

const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png";

const DOCUMENT_FIELDS = [
  { key: "businessRegistration", label: "사업자 등록증", hasSample: false },
  {
    key: "telecomServiceCertificate",
    label: "통신 서비스 이용증명원",
    hasSample: false,
  },
  { key: "powerOfAttorney", label: "위임장", hasSample: true },
  {
    key: "representativeProof",
    label: "대표자 신분증 또는 재직증명서",
    hasSample: false,
  },
] as const;

type DocumentKey = (typeof DOCUMENT_FIELDS)[number]["key"];

const createEmptyDocuments = <T,>(value: T) =>
  Object.fromEntries(DOCUMENT_FIELDS.map(({ key }) => [key, value])) as Record<
    DocumentKey,
    T
  >;

const documentTypeToLabel = {
  BUSINESS_REGISTRATION: "사업자 등록증",
  TELECOM_SERVICE_CERTIFICATE: "통신 서비스 이용증명원",
  POWER_OF_ATTORNEY: "위임장",
  REPRESENTATIVE_PROOF: "대표자 신분증 또는 재직증명서",
};

export default function CallingNumberTable() {
  const [list, setList] = useState<CallingNumber[]>(
    callingNumbersData as CallingNumber[],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));

  const [detailOpen, setDetailOpen] = useState(false);
  const [reAuthOpen, setReAuthOpen] = useState(false);

  const [documentFiles, setDocumentFiles] = useState<
    Record<DocumentKey, File | null>
  >(() => createEmptyDocuments<File | null>(null));
  const fileInputRefs = useRef<Record<DocumentKey, HTMLInputElement | null>>(
    createEmptyDocuments<HTMLInputElement | null>(null),
  );

  const handleUsageEnabledChange = useCallback(
    (item: CallingNumber, checked: boolean) => {
      setList((prev) =>
        prev.map((el) =>
          el.id === item.id ? { ...el, usageEnabled: checked } : el,
        ),
      );
    },
    [],
  );

  const filteredData = useMemo(() => {
    if (!searchTerm) return list;
    return list.filter((item) => item.phoneNumber.includes(searchTerm));
  }, [list, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, page]);

  const handleFileChange = (key: DocumentKey, file: File | null) => {
    setDocumentFiles((prev) => ({ ...prev, [key]: file }));
  };

  const renderDocumentField = ({
    key,
    label,
    hasSample,
  }: (typeof DOCUMENT_FIELDS)[number]) => {
    const file = documentFiles[key];

    return (
      <div key={key} className="bg-point-gray-100 rounded-md border p-4">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex min-h-[52px] flex-row items-center">
          <p className="font-apple-medium min-w-0 flex-1 truncate text-sm leading-5 text-gray-700">
            {file?.name ? file.name : "파일 선택"}
          </p>
          {file?.name ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleFileChange(key, null)}
              className="h-auto"
            >
              <X className="size-4" />
            </Button>
          ) : (
            <div
              className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-md border border-dashed border-gray-400 bg-white px-4 py-2 text-center hover:bg-gray-100"
              onClick={() => fileInputRefs.current[key]?.click()}
            >
              <FileUp className="size-4 text-gray-600" />{" "}
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
            ref={(el) => {
              fileInputRefs.current[key] = el;
            }}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            className="hidden"
            onChange={(e) => handleFileChange(key, e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
    );
  };

  const columns = useMemo(
    () =>
      getCallingNumberColumns({
        onDetail: (item) => setDetailOpen(true),
        onReAuth: (item) => setReAuthOpen(true),
        onUsageEnabledChange: handleUsageEnabledChange,
      }),
    [handleUsageEnabledChange],
  );

  const { table } = useDataTable({
    data: paginatedData,
    pageCount: Math.ceil(filteredData.length / PAGE_SIZE),
    columns,
  });

  const handleDownloadAttachment = (fileName: string) => {
    console.log(fileName);
  };

  return (
    <div className="rounded-md bg-white p-7">
      <DataTable table={table} totalCount={filteredData.length}>
        <CallingNumberTableSearch onSearch={() => {}} />
      </DataTable>

      {/* 상세보기 모달*/}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>발신번호 상세보기</DialogTitle>
          </DialogHeader>
          <div className="flex max-h-[76vh] flex-col gap-4 overflow-y-auto p-7">
            {/* 기본 정보 */}
            <Field id="basic-info">
              <FieldLabel
                htmlFor="basic-info"
                className="font-apple-medium text-md leading-5 text-gray-700"
              >
                기본 정보
              </FieldLabel>
              <FieldContent className="rounded-md border p-4">
                <div className="flex items-center justify-start gap-2">
                  <div className="w-20 text-sm font-medium text-gray-600">
                    발신번호
                  </div>
                  <div className="text-sm font-medium">010-1234-5678</div>
                </div>
                <div className="flex items-center justify-start gap-2">
                  <div className="w-20 text-sm font-medium text-gray-600">
                    발신번호명
                  </div>
                  <div className="text-sm font-medium">고객센터 대표번호</div>
                </div>
                <div className="flex items-center justify-start gap-2">
                  <div className="w-20 text-sm font-medium text-gray-600">
                    등록일
                  </div>
                  <div className="text-sm font-medium"> 2026.01.15</div>
                </div>
                <div className="flex items-center justify-start gap-2">
                  <div className="w-20 text-sm font-medium text-gray-600">
                    인증 만료일
                  </div>
                  <div className="text-sm font-medium">2027.01.14</div>
                </div>
              </FieldContent>
            </Field>
            {/* 첨부 서류 */}
            <div id="add-documents-file">
              <p className="font-apple-medium text-md mb-2 leading-5 text-gray-700">
                첨부 서류
              </p>
              <div>
                {callingNumberDetailData[0].documents.map((item) => (
                  <div
                    key={item.documentId}
                    className="mb-2 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3"
                  >
                    <div className="flex w-full min-w-0 items-center justify-between pr-2">
                      <p className="font-apple-medium flex gap-2 truncate text-[13px] text-gray-600">
                        <FileTextIcon className="size-4 shrink-0 text-gray-500" />
                        {documentTypeToLabel[item.documentType]}
                      </p>
                      <div className="flex min-w-0 flex-row">
                        <p className="font-apple-light flex truncate text-[12px] text-gray-700">
                          {/* <FileTextIcon className="size-4 shrink-0 text-gray-500" /> */}
                          {item.originalFileName}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-7 shrink-0 px-2.5 text-[12px] text-gray-500 hover:text-gray-700"
                      onClick={() =>
                        handleDownloadAttachment(item.originalFileName)
                      }
                    >
                      <DownloadIcon className="size-3.5" />
                      다운로드
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            {/* 요청 내용 */}
            <Field id="request-content">
              <FieldLabel
                htmlFor="request-content"
                className="font-apple-medium text-md leading-5 text-gray-700"
              >
                요청 내용
              </FieldLabel>
              <FieldContent className="rounded-md border p-4">
                <p className="text-sm font-medium text-gray-600">
                  {callingNumberDetailData[0].requestContent}
                </p>
              </FieldContent>
            </Field>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">닫기</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 재인증 요청 모달 */}
      <Dialog open={reAuthOpen} onOpenChange={setReAuthOpen}>
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
            {/* 정보 */}
            <Field id="basic-info">
              <FieldLabel
                htmlFor="basic-info"
                className="font-apple-medium text-md leading-5 text-gray-700"
              >
                기본 정보
              </FieldLabel>
              <FieldContent className="rounded-md border p-4">
                <div className="flex items-center justify-start gap-2">
                  <div className="w-20 text-sm font-medium text-gray-600">
                    발신번호
                  </div>
                  <div className="text-sm font-medium">010-1234-5678</div>
                </div>
                <div className="flex items-center justify-start gap-2">
                  <div className="w-20 text-sm font-medium text-gray-600">
                    발신번호명
                  </div>
                  <div className="text-sm font-medium">고객센터 대표번호</div>
                </div>
              </FieldContent>
            </Field>
            {/* 첨부서류 */}
            <Field id="add-documents-file">
              <FieldLabel
                htmlFor="add-documents-file"
                className="font-apple-medium text-md leading-5 text-gray-700"
              >
                첨부 서류
              </FieldLabel>
              <div className="flex flex-col gap-2">
                {DOCUMENT_FIELDS.map(renderDocumentField)}
              </div>
            </Field>
            {/* 요청 내용 */}
            <Field id="request-note">
              <FieldLabel
                htmlFor="request-note"
                className="font-apple-medium text-md leading-5 text-gray-700"
              >
                요청 내용
              </FieldLabel>
              <FieldDescription>
                <Textarea
                  placeholder="요청 내용을 입력해주세요."
                  maxLength={500}
                  value={
                    "고객센터 대표번호로 사용 예정입니다. 빠른 승인 부탁드립니다."
                  }
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
    </div>
  );
}
