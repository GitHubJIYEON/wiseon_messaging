import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import type {
  MessageResultItem,
  SmsType,
} from "@/features/messaging/types/messages";
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
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";

const SMS_TYPE_LABEL: Record<SmsType, string> = {
  SMS: "SMS",
  LMS: "LMS",
  MMS: "MMS",
};

const CONTENT_TYPE_LABEL: Record<string, string> = {
  COMM: "일반",
  AD: "광고",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  READY: {
    label: "대기중",
    className: "bg-yellow-50 text-yellow-600 border-yellow-200",
  },
  PROCESSING: {
    label: "처리중",
    className: "bg-blue-50 text-blue-600 border-blue-200",
  },
  COMPLETED: {
    label: "완료",
    className: "bg-green-50 text-green-600 border-green-200",
  },
};

const STATUS_NAME_CONFIG: Record<string, { label: string; className: string }> =
  {
    success: {
      label: "성공",
      className: "bg-green-50 text-green-600 border-green-200",
    },
    fail: {
      label: "실패",
      className: "bg-red-50 text-red-600 border-red-200",
    },
    reserved: {
      label: "예약",
      className: "bg-purple-50 text-purple-600 border-purple-200",
    },
  };

const MOCK_SEND_RESULTS: MessageResultItem[] = [
  {
    requestTime: "2026-03-31 10:00:00",
    contentType: "COMM",
    content: "안녕하세요. 위즈온에서 발송하는 테스트 메시지입니다.",
    countryCode: "82",
    from: "02-1234-5678",
    to: "010-1234-5678",
    status: "COMPLETED",
    statusCode: "0",
    statusName: "success",
    statusMessage: "성공",
    completeTime: "2026-03-31 10:00:05",
    telcoCode: "SKT",
  },
  {
    requestTime: "2026-03-31 10:01:00",
    contentType: "AD",
    content: "[광고] 봄맞이 특별 이벤트 안내입니다. 무료수신거부 080-000-0000",
    countryCode: "82",
    from: "02-1234-5678",
    to: "010-9876-5432",
    status: "COMPLETED",
    statusCode: "3001",
    statusName: "fail",
    statusMessage: "가입자 없음",
    completeTime: "2026-03-31 10:01:03",
    telcoCode: "KT",
  },
  {
    requestTime: "2026-03-31 10:02:00",
    contentType: "COMM",
    content: "설문 참여 안내 메시지입니다. 링크를 통해 참여해 주세요.",
    countryCode: "82",
    from: "02-1234-5678",
    to: "010-5555-6666",
    status: "PROCESSING",
    statusCode: "",
    statusName: "reserved",
    statusMessage: "처리중",
    completeTime: "",
    telcoCode: "",
  },
  {
    requestTime: "2026-03-30 15:30:00",
    contentType: "COMM",
    content: "안녕하세요. 설문조사 결과를 안내드립니다.",
    countryCode: "82",
    from: "02-1234-5678",
    to: "010-7777-8888",
    status: "COMPLETED",
    statusCode: "0",
    statusName: "success",
    statusMessage: "성공",
    completeTime: "2026-03-30 15:30:04",
    telcoCode: "LGU",
  },
  {
    requestTime: "2026-03-30 09:00:00",
    contentType: "COMM",
    content: "회원님, 이번 달 이벤트에 초대합니다.",
    countryCode: "82",
    from: "02-1234-5678",
    to: "010-2222-3333",
    status: "READY",
    statusCode: "",
    statusName: "reserved",
    statusMessage: "대기중",
    completeTime: "",
    telcoCode: "",
  },
];

const formatDateTime = (value: string) => {
  if (!value) return "-";
  try {
    return format(new Date(value.replace(" ", "T")), "yyyy.MM.dd HH:mm:ss");
  } catch {
    return value;
  }
};

export default function SendResultPage() {
  const [data, setData] = useState<MessageResultItem[]>(MOCK_SEND_RESULTS);
  const [selectedMessage, setSelectedMessage] =
    useState<MessageResultItem | null>(null);

  const handleRefresh = () => {
    setData([...MOCK_SEND_RESULTS]);
  };

  const columns = useMemo<ColumnDef<MessageResultItem>[]>(
    () => [
      {
        id: "requestTime",
        accessorKey: "requestTime",
        header: "발송 요청 일시",
        cell: ({ row }) => (
          <div className="px-2.5 text-[13px] whitespace-nowrap">
            {formatDateTime(row.getValue<string>("requestTime"))}
          </div>
        ),
        size: 170,
      },
      {
        id: "content",
        accessorKey: "content",
        header: "메시지 본문",
        cell: ({ row }) => (
          <div className="max-w-[300px] overflow-hidden px-2.5">
            <button
              type="button"
              className="hover:text-primary-500 max-w-full overflow-hidden text-[13px] text-ellipsis whitespace-nowrap underline underline-offset-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMessage(row.original);
              }}
            >
              {row.getValue<string>("content")}
            </button>
          </div>
        ),
        size: 300,
      },
      {
        id: "from",
        accessorKey: "from",
        header: "발신 번호",
        cell: ({ row }) => (
          <div className="px-2.5 text-[13px]">
            {row.getValue<string>("from")}
          </div>
        ),
        size: 140,
      },
      {
        id: "type",
        header: "발송 유형",
        cell: ({ row }) => {
          const original = row.original;
          const typeLabel = SMS_TYPE_LABEL[original.type ?? "SMS"] ?? "SMS";
          const contentLabel =
            CONTENT_TYPE_LABEL[original.contentType] ?? original.contentType;
          return (
            <div className="flex items-center gap-1.5 px-2.5">
              <Badge
                variant="outline"
                className="border-gray-300 bg-gray-50 px-1.5 py-0 text-[12px] text-gray-600"
              >
                {typeLabel}
              </Badge>
              <Badge
                variant="outline"
                className="border-gray-300 bg-gray-50 px-1.5 py-0 text-[12px] text-gray-600"
              >
                {contentLabel}
              </Badge>
            </div>
          );
        },
        size: 130,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "요청 상태",
        cell: ({ row }) => {
          const status = row.getValue<string>("status");
          const config = STATUS_CONFIG[status] ?? {
            label: status,
            className: "bg-gray-50 text-gray-600 border-gray-200",
          };
          return (
            <div className="px-2.5">
              <Badge
                variant="outline"
                className={`px-2 py-0.5 text-[12px] ${config.className}`}
              >
                {config.label}
              </Badge>
            </div>
          );
        },
        size: 110,
      },
      {
        id: "statusName",
        accessorKey: "statusName",
        header: "수신 상태",
        cell: ({ row }) => {
          const statusName = row.getValue<string>("statusName");
          const statusCode = row.original.statusCode;
          const statusMessage = row.original.statusMessage;
          const config = STATUS_NAME_CONFIG[statusName] ?? {
            label: statusName,
            className: "bg-gray-50 text-gray-600 border-gray-200",
          };
          return (
            <div className="flex items-center gap-2 px-2.5">
              <Badge
                variant="outline"
                className={`shrink-0 px-2 py-0.5 text-[12px] ${config.className}`}
              >
                {config.label}
              </Badge>
              {statusCode && (
                <span
                  className="max-w-[160px] truncate text-[12px] text-gray-500"
                  title={statusMessage}
                >
                  {statusCode} · {statusMessage}
                </span>
              )}
            </div>
          );
        },
        size: 260,
      },
    ],
    [setSelectedMessage],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    meta: { totalCount: data.length },
    getRowId: (row) => `${row.requestTime}-${row.to}`,
  });

  return (
    <>
      <section className="mx-auto w-[1200px] pb-[30px]">
        <h1 className="font-apple-ultra py-10 text-center text-[32px] leading-[45px] text-[#1B1D21]">
          발송 결과
        </h1>

        <DataTable table={table} className="bg-white">
          <section className="mb-2.5 flex items-center justify-between">
            <h2 className="font-apple-medium text-lg text-gray-700">
              총 {data.length}건
            </h2>
            <Button
              type="button"
              variant="outline"
              className="font-apple-medium h-[42px] gap-2 rounded text-[14px]/[24px] text-gray-700"
              onClick={handleRefresh}
            >
              <RefreshCw className="size-4" />
              새로고침
            </Button>
          </section>
        </DataTable>
      </section>

      <Dialog
        open={selectedMessage !== null}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
      >
        <DialogContent className="w-[520px]" showCloseButton>
          <DialogHeader>
            <DialogTitle>메시지 상세보기</DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4 px-8 py-6">
              <div className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-2.5 text-[13px]">
                <span className="font-apple-medium text-gray-500">
                  발송 유형
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="border-gray-300 bg-gray-50 px-1.5 py-0 text-[12px] text-gray-600"
                  >
                    {SMS_TYPE_LABEL[selectedMessage.type ?? "SMS"]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-gray-300 bg-gray-50 px-1.5 py-0 text-[12px] text-gray-600"
                  >
                    {CONTENT_TYPE_LABEL[selectedMessage.contentType]}
                  </Badge>
                </div>

                <span className="font-apple-medium text-gray-500">
                  발신 번호
                </span>
                <span className="text-gray-700">{selectedMessage.from}</span>

                <span className="font-apple-medium text-gray-500">
                  수신 번호
                </span>
                <span className="text-gray-700">{selectedMessage.to}</span>

                <span className="font-apple-medium text-gray-500">
                  요청 일시
                </span>
                <span className="text-gray-700">
                  {formatDateTime(selectedMessage.requestTime)}
                </span>

                {selectedMessage.completeTime && (
                  <>
                    <span className="font-apple-medium text-gray-500">
                      완료 일시
                    </span>
                    <span className="text-gray-700">
                      {formatDateTime(selectedMessage.completeTime)}
                    </span>
                  </>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="font-apple-medium text-[13px] text-gray-500">
                  메시지 본문
                </p>
                <div className="min-h-[100px] rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap text-gray-700">
                  {selectedMessage.content}
                </div>
              </div>

              {selectedMessage.statusName === "reserved" && (
                <DialogFooter className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => {
                      setData((prev) =>
                        prev.filter(
                          (item) =>
                            !(
                              item.requestTime ===
                                selectedMessage.requestTime &&
                              item.to === selectedMessage.to
                            ),
                        ),
                      );
                      setSelectedMessage(null);
                    }}
                  >
                    예약 취소
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-800"
                    onClick={() => setSelectedMessage(null)}
                  >
                    취소
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
