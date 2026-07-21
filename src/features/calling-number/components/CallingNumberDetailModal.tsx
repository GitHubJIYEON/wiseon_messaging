import { DialogClose } from "@radix-ui/react-dialog";
import { DownloadIcon, FileTextIcon } from "lucide-react";
import { DOCUMENT_TYPE_LABEL } from "@/features/calling-number/constants";
import callingNumberDetailData from "@/features/calling-number/data/callingNumberDetail.json";
import type { CallingNumber } from "@/features/calling-number/types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/shared/components/ui/field";

interface CallingNumberDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: CallingNumber | null;
}

export default function CallingNumberDetailModal({
  open,
  onOpenChange,
  item,
}: CallingNumberDetailModalProps) {
  const detail = callingNumberDetailData[0];

  const handleDownloadAttachment = (fileName: string) => {
    console.log(fileName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <div className="text-sm font-medium">{item?.phoneNumber}</div>
              </div>
              <div className="flex items-center justify-start gap-2">
                <div className="w-20 text-sm font-medium text-gray-600">
                  발신번호명
                </div>
                <div className="text-sm font-medium">{item?.name}</div>
              </div>
              <div className="flex items-center justify-start gap-2">
                <div className="w-20 text-sm font-medium text-gray-600">
                  등록일
                </div>
                <div className="text-sm font-medium">{item?.registeredAt}</div>
              </div>
              <div className="flex items-center justify-start gap-2">
                <div className="w-20 text-sm font-medium text-gray-600">
                  인증 만료일
                </div>
                <div className="text-sm font-medium">{item?.certExpiredAt}</div>
              </div>
            </FieldContent>
          </Field>
          {/* 첨부 서류 */}
          <div id="add-documents-file">
            <p className="font-apple-medium text-md mb-2 leading-5 text-gray-700">
              첨부 서류
            </p>
            <div>
              {detail.documents.map((doc) => (
                <div
                  key={doc.documentId}
                  className="mb-2 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  <div className="flex w-full min-w-0 items-center justify-between pr-2">
                    <p className="font-apple-medium flex gap-2 truncate text-[13px] text-gray-600">
                      <FileTextIcon className="size-4 shrink-0 text-gray-500" />
                      {DOCUMENT_TYPE_LABEL[doc.documentType]}
                    </p>
                    <div className="flex min-w-0 flex-row">
                      <p className="font-apple-light flex truncate text-[12px] text-gray-700">
                        {doc.originalFileName}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-7 shrink-0 px-2.5 text-[12px] text-gray-500 hover:text-gray-700"
                    onClick={() =>
                      handleDownloadAttachment(doc.originalFileName)
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
                {detail.requestContent}
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
  );
}
