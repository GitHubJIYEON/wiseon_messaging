import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";

const PER_PAGE = 10;

const SMS_TYPE_LABEL: Record<string, string> = {
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
    label: "예약",
    className: "bg-yellow-50 text-yellow-600 border-yellow-200",
  },
  PROCESSING: {
    label: "실패",
    className: "bg-red-50 text-red-600 border-red-200",
  },
  COMPLETED: {
    label: "성공",
    className: "bg-green-50 text-green-600 border-green-200",
  },
};

type SendType = "manual" | "auto";

const SEND_TYPE_LABEL: Record<SendType, string> = {
  manual: "일반 발송",
  auto: "자동 발송",
};

type SendResultTableItem = {
  requestId: string;
  messageId: string;
  requestTime: string;
  contentType: string;
  type: string;
  content: string;
  countryCode: string;
  from: string;
  to: string[];
  status: string;
  statusCode: string;
  statusName: string;
  statusMessage: string;
  completeTime: string;
  telcoCode: string;
  sendType: SendType;
};

const MOCK_SEND_RESULTS: SendResultTableItem[] = [
  {
    requestId: "1",
    messageId: "1",
    type: "SMS",
    sendType: "auto",
    requestTime: "2026-03-31 10:02:00",
    contentType: "COMM",
    content: "설문 참여 안내 메시지입니다. 링크를 통해 참여해 주세요.",
    countryCode: "82",
    from: "02-1234-5678",
    to: Array.from(
      { length: 30 },
      (_, i) => `0105556${String(i + 1).padStart(4, "0")}`,
    ),
    status: "PROCESSING",
    statusCode: "",
    statusName: "reserved",
    statusMessage: "처리중",
    completeTime: "",
    telcoCode: "",
  },
  {
    requestId: "2",
    messageId: "2",
    type: "SMS",
    sendType: "manual",
    requestTime: "2026-03-31 10:00:00",
    contentType: "COMM",
    content: "안녕하세요. 위즈온에서 발송하는 테스트 메시지입니다.",
    countryCode: "82",
    from: "02-1234-5678",
    to: Array.from(
      { length: 10 },
      (_, i) => `0101234${String(i + 1).padStart(4, "0")}`,
    ),
    status: "COMPLETED",
    statusCode: "0",
    statusName: "success",
    statusMessage: "성공",
    completeTime: "2026-03-31 10:00:05",
    telcoCode: "SKT",
  },
  {
    requestId: "3",
    messageId: "3",
    type: "LMS",
    sendType: "auto",
    requestTime: "2026-03-31 10:01:00",
    contentType: "AD",
    content: "[광고] 봄맞이 특별 이벤트 안내입니다. 무료수신거부 080-000-0000",
    countryCode: "82",
    from: "02-1234-5678",
    to: Array.from(
      { length: 20 },
      (_, i) => `0109876${String(i + 1).padStart(4, "0")}`,
    ),
    status: "COMPLETED",
    statusCode: "3001",
    statusName: "fail",
    statusMessage: "가입자 없음",
    completeTime: "2026-03-31 10:01:03",
    telcoCode: "KT",
  },
  {
    requestId: "4",
    messageId: "4",
    type: "SMS",
    sendType: "manual",
    requestTime: "2026-03-30 15:30:00",
    contentType: "COMM",
    content: "안녕하세요. 설문조사 결과를 안내드립니다.",
    countryCode: "82",
    from: "02-1234-5678",
    to: Array.from(
      { length: 40 },
      (_, i) => `0107777${String(i + 1).padStart(4, "0")}`,
    ),
    status: "COMPLETED",
    statusCode: "0",
    statusName: "success",
    statusMessage: "성공",
    completeTime: "2026-03-30 15:30:04",
    telcoCode: "LGU",
  },
  {
    requestId: "5",
    messageId: "5",
    type: "MMS",
    sendType: "manual",
    requestTime: "2026-03-30 09:00:00",
    contentType: "COMM",
    content: "회원님, 이번 달 이벤트에 초대합니다.",
    countryCode: "82",
    from: "02-1234-5678",
    to: Array.from(
      { length: 50 },
      (_, i) => `0102222${String(i + 1).padStart(4, "0")}`,
    ),
    status: "READY",
    statusCode: "",
    statusName: "reserved",
    statusMessage: "대기중",
    completeTime: "",
    telcoCode: "",
  },
  {
    requestId: "6",
    messageId: "6",
    type: "SMS",
    sendType: "auto",
    requestTime: "2026-03-29 14:20:00",
    contentType: "COMM",
    content: "예약 확인 안내입니다. 예약 일시를 다시 한번 확인해 주세요.",
    countryCode: "82",
    from: "02-9876-5432",
    to: Array.from(
      { length: 15 },
      (_, i) => `0103333${String(i + 1).padStart(4, "0")}`,
    ),
    status: "COMPLETED",
    statusCode: "0",
    statusName: "success",
    statusMessage: "성공",
    completeTime: "2026-03-29 14:20:08",
    telcoCode: "SKT",
  },
  {
    requestId: "7",
    messageId: "7",
    type: "LMS",
    sendType: "manual",
    requestTime: "2026-03-28 11:00:00",
    contentType: "AD",
    content: "[광고] 신규 서비스 오픈 기념 할인 이벤트를 안내드립니다.",
    countryCode: "82",
    from: "02-1234-5678",
    to: Array.from(
      { length: 25 },
      (_, i) => `0104444${String(i + 1).padStart(4, "0")}`,
    ),
    status: "COMPLETED",
    statusCode: "0",
    statusName: "success",
    statusMessage: "성공",
    completeTime: "2026-03-28 11:00:12",
    telcoCode: "KT",
  },
  {
    requestId: "8",
    messageId: "8",
    type: "SMS",
    sendType: "auto",
    requestTime: "2026-03-27 16:45:00",
    contentType: "COMM",
    content: "고객센터 운영 시간 변경 안내입니다.",
    countryCode: "82",
    from: "02-1234-5678",
    to: Array.from(
      { length: 8 },
      (_, i) => `0106666${String(i + 1).padStart(4, "0")}`,
    ),
    status: "READY",
    statusCode: "",
    statusName: "reserved",
    statusMessage: "대기중",
    completeTime: "",
    telcoCode: "",
  },
  {
    requestId: "9",
    messageId: "9",
    type: "SMS",
    sendType: "manual",
    requestTime: "2026-03-26 09:30:00",
    contentType: "COMM",
    content: "결제가 정상적으로 완료되었습니다. 이용해 주셔서 감사합니다.",
    countryCode: "82",
    from: "02-1234-5678",
    to: Array.from({ length: 1 }, () => "01088880001"),
    status: "COMPLETED",
    statusCode: "0",
    statusName: "success",
    statusMessage: "성공",
    completeTime: "2026-03-26 09:30:02",
    telcoCode: "SKT",
  },
  {
    requestId: "10",
    messageId: "10",
    type: "SMS",
    sendType: "auto",
    requestTime: "2026-03-25 18:00:00",
    contentType: "COMM",
    content: "배송이 시작되었습니다. 운송장 번호로 조회해 주세요.",
    countryCode: "82",
    from: "02-9876-5432",
    to: Array.from(
      { length: 12 },
      (_, i) => `0109999${String(i + 1).padStart(4, "0")}`,
    ),
    status: "PROCESSING",
    statusCode: "5001",
    statusName: "fail",
    statusMessage: "발송 실패",
    completeTime: "2026-03-25 18:00:05",
    telcoCode: "LGU",
  },
  {
    requestId: "11",
    messageId: "11",
    type: "LMS",
    sendType: "manual",
    requestTime: "2026-03-24 13:15:00",
    contentType: "COMM",
    content: "정기 점검 안내입니다. 점검 시간 동안 서비스 이용이 제한됩니다.",
    countryCode: "82",
    from: "02-1234-5678",
    to: Array.from(
      { length: 35 },
      (_, i) => `0101111${String(i + 1).padStart(4, "0")}`,
    ),
    status: "COMPLETED",
    statusCode: "0",
    statusName: "success",
    statusMessage: "성공",
    completeTime: "2026-03-24 13:15:10",
    telcoCode: "KT",
  },
  {
    requestId: "12",
    messageId: "12",
    type: "SMS",
    sendType: "auto",
    requestTime: "2026-03-23 08:00:00",
    contentType: "AD",
    content: "[광고] 주말 한정 특가 세일 안내입니다.",
    countryCode: "82",
    from: "02-1234-5678",
    to: Array.from(
      { length: 60 },
      (_, i) => `0100000${String(i + 1).padStart(4, "0")}`,
    ),
    status: "COMPLETED",
    statusCode: "0",
    statusName: "success",
    statusMessage: "성공",
    completeTime: "2026-03-23 08:00:30",
    telcoCode: "SKT",
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
  const navigate = useNavigate();
  const [selectedSendType, setSelectedSendType] = useState<SendType>("manual");
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const tabCounts = useMemo(
    () => ({
      manual: MOCK_SEND_RESULTS.filter((item) => item.sendType === "manual")
        .length,
      auto: MOCK_SEND_RESULTS.filter((item) => item.sendType === "auto").length,
    }),
    [],
  );

  const filteredData = useMemo(
    () =>
      MOCK_SEND_RESULTS.filter((item) => item.sendType === selectedSendType),
    [selectedSendType],
  );

  const pageCount = Math.max(1, Math.ceil(filteredData.length / PER_PAGE));

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredData.slice(start, start + PER_PAGE);
  }, [filteredData, page]);

  const handleChangeSendType = (value: string) => {
    setSelectedSendType(value as SendType);
    void setPage(1);
  };

  const handleRefresh = () => {
    void setPage(1);
    toast.success("발송 결과를 새로고침했습니다.");
  };

  const handleCancelReservation = useCallback((requestId: string) => {
    toast.success(`예약 발송(${requestId})이 취소되었습니다.`);
  }, []);

  const columns = useMemo<ColumnDef<SendResultTableItem>[]>(
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
            <span className="max-w-full overflow-hidden text-[13px] text-ellipsis whitespace-nowrap">
              {row.getValue<string>("content")}
            </span>
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
        id: "to",
        accessorKey: "to",
        header: "수신 번호 갯수",
        cell: ({ row }) => {
          const to = row.getValue<string[]>("to");
          return <div className="px-2.5 text-[13px]">{to.length}개</div>;
        },
        size: 140,
      },
      {
        id: "type",
        header: "발송 유형",
        cell: ({ row }) => {
          const original = row.original;
          const typeLabel = SMS_TYPE_LABEL[original.type] ?? "SMS";
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
        header: "발송 상태",
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
        id: "detail",
        header: "상세보기",
        cell: ({ row }) => {
          const isWaiting = row.original.status === "READY";
          return (
            <div className="px-2.5">
              {isWaiting ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-3 text-[13px] underline"
                  onClick={() =>
                    handleCancelReservation(row.original.requestId)
                  }
                >
                  취소하기
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-8 px-3 text-[13px]"
                  onClick={() =>
                    navigate(
                      `/messaging/send-result/detail?requestId=${row.original.requestId}`,
                    )
                  }
                >
                  상세보기
                </Button>
              )}
            </div>
          );
        },
        size: 120,
      },
    ],
    [navigate, handleCancelReservation],
  );

  const { table } = useDataTable({
    data: paginatedData,
    columns,
    pageCount,
    meta: { totalCount: filteredData.length },
    getRowId: (row) => row.requestId,
  });

  return (
    <section className="mx-auto max-w-7xl pb-[30px]">
      <h1 className="font-apple-ultra py-10 text-center text-[32px] leading-[45px] text-[#1B1D21]">
        발송 결과
      </h1>

      <Tabs
        value={selectedSendType}
        onValueChange={handleChangeSendType}
        className="mb-6 items-center"
      >
        <TabsList className="h-11 rounded-xl bg-gray-100 p-1">
          <TabsTrigger
            value="manual"
            className="min-w-[140px] rounded-lg px-4 text-sm data-[state=active]:bg-white"
          >
            {SEND_TYPE_LABEL.manual} ({tabCounts.manual})
          </TabsTrigger>
          <TabsTrigger
            value="auto"
            className="min-w-[140px] rounded-lg px-4 text-sm data-[state=active]:bg-white"
          >
            {SEND_TYPE_LABEL.auto} ({tabCounts.auto})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable table={table} className="rounded-lg bg-white p-10">
        <section className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-apple-medium text-lg text-gray-700">
              총 {filteredData.length}건
            </h2>
          </div>
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
  );
}
