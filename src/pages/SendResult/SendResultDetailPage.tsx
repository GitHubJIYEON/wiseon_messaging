//임시페이지
import { Fragment, useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/shared/components/ui/status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

type RequestStatus = "완료" | "대기중";
type DeliveryStatus = "성공" | "실패";

interface SendResultDetailRow {
  id: string;
  requestTime: string;
  completeTime: string;
  requestStatus: RequestStatus;
  deliveryStatus: DeliveryStatus;
  type: "SMS";
  senderNumber: string;
  receiverNumber: string;
  statusMessage: string;
}

type ResultTab = "fail" | "success" | "remind";

const MOCK_ROWS: SendResultDetailRow[] = [
  {
    id: "20260331100000-01012345678",
    requestTime: "2026-03-31 10:00:00",
    completeTime: "2026-03-31 10:00:05",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-1234-5678",
    statusMessage: "",
  },
  {
    id: "20260331100100-01098765432",
    requestTime: "2026-03-31 10:01:00",
    completeTime: "2026-03-31 10:01:03",
    requestStatus: "완료",
    deliveryStatus: "실패",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9876-5432",
    statusMessage: "",
  },
  {
    id: "20260330090000-01022223333",
    requestTime: "2026-03-30 09:00:00",
    completeTime: "",
    requestStatus: "대기중",
    deliveryStatus: "실패",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-2222-3333",
    statusMessage:
      "휴대폰 가입 이동통신사를 통해 발신번호 변작 방지 부가 서비스에 가입된 번호를 발신번호로 사용하는 경우",
  },
  {
    id: "20260331101000-01090000001",
    requestTime: "2026-03-31 10:10:00",
    completeTime: "2026-03-31 10:10:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0001",
    statusMessage: "성공",
  },
  {
    id: "20260331101100-01090000002",
    requestTime: "2026-03-31 10:11:00",
    completeTime: "2026-03-31 10:11:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0002",
    statusMessage: "성공",
  },
  {
    id: "20260331101200-01090000003",
    requestTime: "2026-03-31 10:12:00",
    completeTime: "2026-03-31 10:12:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0003",
    statusMessage: "성공",
  },
  {
    id: "20260331101300-01090000004",
    requestTime: "2026-03-31 10:13:00",
    completeTime: "2026-03-31 10:13:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0004",
    statusMessage: "성공",
  },
  {
    id: "20260331101400-01090000005",
    requestTime: "2026-03-31 10:14:00",
    completeTime: "2026-03-31 10:14:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0005",
    statusMessage: "성공",
  },
  {
    id: "20260331101500-01090000006",
    requestTime: "2026-03-31 10:15:00",
    completeTime: "2026-03-31 10:15:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0006",
    statusMessage: "성공",
  },
  {
    id: "20260331101600-01090000007",
    requestTime: "2026-03-31 10:16:00",
    completeTime: "2026-03-31 10:16:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0007",
    statusMessage: "성공",
  },
  {
    id: "20260331101700-01090000008",
    requestTime: "2026-03-31 10:17:00",
    completeTime: "2026-03-31 10:17:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0008",
    statusMessage: "성공",
  },
  {
    id: "20260331101800-01090000009",
    requestTime: "2026-03-31 10:18:00",
    completeTime: "2026-03-31 10:18:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0009",
    statusMessage: "성공",
  },
  {
    id: "20260331101900-01090000010",
    requestTime: "2026-03-31 10:19:00",
    completeTime: "2026-03-31 10:19:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0010",
    statusMessage: "성공",
  },
  {
    id: "20260331102000-01090000011",
    requestTime: "2026-03-31 10:20:00",
    completeTime: "2026-03-31 10:20:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0011",
    statusMessage: "성공",
  },
  {
    id: "20260331102100-01090000012",
    requestTime: "2026-03-31 10:21:00",
    completeTime: "2026-03-31 10:21:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0012",
    statusMessage: "성공",
  },
  {
    id: "20260331102200-01090000013",
    requestTime: "2026-03-31 10:22:00",
    completeTime: "2026-03-31 10:22:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0013",
    statusMessage: "성공",
  },
  {
    id: "20260331102300-01090000014",
    requestTime: "2026-03-31 10:23:00",
    completeTime: "2026-03-31 10:23:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0014",
    statusMessage: "성공",
  },
  {
    id: "20260331102400-01090000015",
    requestTime: "2026-03-31 10:24:00",
    completeTime: "2026-03-31 10:24:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0015",
    statusMessage: "성공",
  },
  {
    id: "20260331102500-01090000016",
    requestTime: "2026-03-31 10:25:00",
    completeTime: "2026-03-31 10:25:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0016",
    statusMessage: "성공",
  },
  {
    id: "20260331102600-01090000017",
    requestTime: "2026-03-31 10:26:00",
    completeTime: "2026-03-31 10:26:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0017",
    statusMessage: "성공",
  },
  {
    id: "20260331102700-01090000018",
    requestTime: "2026-03-31 10:27:00",
    completeTime: "2026-03-31 10:27:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0018",
    statusMessage: "성공",
  },
  {
    id: "20260331102800-01090000019",
    requestTime: "2026-03-31 10:28:00",
    completeTime: "2026-03-31 10:28:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0019",
    statusMessage: "성공",
  },
  {
    id: "20260331102900-01090000020",
    requestTime: "2026-03-31 10:29:00",
    completeTime: "2026-03-31 10:29:02",
    requestStatus: "완료",
    deliveryStatus: "성공",
    type: "SMS",
    senderNumber: "02-1234-5678",
    receiverNumber: "010-9000-0020",
    statusMessage: "성공",
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

const getDeliveryStatusBadgeClass = (status: DeliveryStatus) => {
  if (status === "성공") {
    return "bg-green-50 text-green-600 border-green-200";
  }
  return "bg-red-50 text-red-600 border-red-200";
};

const RESULT_TABS: Array<{ value: ResultTab; label: string }> = [
  { value: "fail", label: "실패" },
  { value: "success", label: "성공" },
  { value: "remind", label: "리마인드" },
];

const getRowTabStatus = (row: SendResultDetailRow): ResultTab => {
  if (row.requestStatus === "대기중") {
    return "remind";
  }
  return row.deliveryStatus === "성공" ? "success" : "fail";
};

export default function SendResultDetailPage() {
  const [rows, setRows] = useState<SendResultDetailRow[]>(MOCK_ROWS);
  const [activeTab, setActiveTab] = useState<ResultTab>("fail");
  const [openedRowId, setOpenedRowId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const senderNumber = rows[0]?.senderNumber ?? "-";
  const messageType = rows[0]?.type ?? "SMS";
  const messageTitle = "4월 프로모션 안내";
  const messageContent =
    "WiseOn Survey를 이용해 주셔서 감사합니다. 지금 접속하시면 신규 기능을 확인할 수 있습니다.";
  // const totalReceiverCount = rows.length;
  // const successCount = rows.filter(
  //   (row) => row.deliveryStatus === "성공",
  // ).length;
  // const failCount = rows.filter((row) => row.deliveryStatus === "실패").length;
  // const waitingCount = Math.max(
  //   totalReceiverCount - successCount - failCount,
  //   0,
  // );
  // const successRate =
  //   totalReceiverCount === 0 ? 0 : (successCount / totalReceiverCount) * 100;
  // const failRate =
  //   totalReceiverCount === 0 ? 0 : (failCount / totalReceiverCount) * 100;
  // const waitingRate =
  //   totalReceiverCount === 0 ? 0 : (waitingCount / totalReceiverCount) * 100;

  const tabCounts = useMemo(
    () =>
      rows.reduce<Record<ResultTab, number>>(
        (acc, row) => {
          const tabStatus = getRowTabStatus(row);
          acc[tabStatus] += 1;
          return acc;
        },
        {
          fail: 0,
          success: 0,
          remind: 0,
        },
      ),
    [rows],
  );

  const tabFilteredRows = useMemo(
    () => rows.filter((row) => getRowTabStatus(row) === activeTab),
    [activeTab, rows],
  );

  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const startDateValue = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const endDateValue = endDate ? new Date(`${endDate}T23:59:59`) : null;

    return tabFilteredRows.filter((row) => {
      const receiverDate = new Date(
        (row.completeTime || row.requestTime).replace(" ", "T"),
      );
      const isAfterStart = startDateValue
        ? receiverDate >= startDateValue
        : true;
      const isBeforeEnd = endDateValue ? receiverDate <= endDateValue : true;

      const isMatchedKeyword = normalizedKeyword
        ? `${row.receiverNumber} ${row.statusMessage}`
            .toLowerCase()
            .includes(normalizedKeyword)
        : true;

      return isAfterStart && isBeforeEnd && isMatchedKeyword;
    });
  }, [endDate, keyword, startDate, tabFilteredRows]);

  const handleToggleRow = (rowId: string) => {
    setOpenedRowId((prev) => (prev === rowId ? null : rowId));
  };

  const handleResendByTab = () => {
    const targetIds = filteredRows.map((row) => row.id);
    if (targetIds.length === 0) return;

    const targetIdSet = new Set(targetIds);
    setRows((prev) =>
      prev.map((row) => {
        if (!targetIdSet.has(row.id)) {
          return row;
        }

        return {
          ...row,
          requestStatus: "완료",
          deliveryStatus: "성공",
          completeTime: row.completeTime || row.requestTime,
          statusMessage: "리마인드 발송 완료",
        };
      }),
    );
    setOpenedRowId(null);
  };

  const handleTabChange = (value: string) => {
    const nextTab = value as ResultTab;
    setActiveTab(nextTab);
    setOpenedRowId(null);
    setSelectedIds(new Set());
  };

  const isAllSelected =
    filteredRows.length > 0 &&
    filteredRows.every((row) => selectedIds.has(row.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredRows.map((row) => row.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(rowId);
      } else {
        next.delete(rowId);
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setKeyword("");
    setStartDate("");
    setEndDate("");
    setOpenedRowId(null);
  };

  return (
    <section className="mx-auto w-[1200px] pb-[30px]">
      <h1 className="font-apple-ultra py-10 text-center text-[32px] leading-[45px] text-[#1B1D21]">
        메시지 수신 결과 목록
      </h1>

      {/* 상단 카드 */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          {/* 공통 정보 */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-4 border-gray-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm">
                <Send className="size-6" />
              </div>
              <div className="flex flex-1 flex-col">
                <h2 className="font-apple-medium text-[15px] text-gray-600">
                  발신 번호
                </h2>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="font-apple-bold text-[24px] leading-tight text-gray-900">
                    {senderNumber}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Status variant="success">
                      <StatusIndicator />
                      <StatusLabel>{messageType}</StatusLabel>
                    </Status>
                    <Status variant="default">
                      <StatusIndicator />
                      <StatusLabel>일반</StatusLabel>
                    </Status>
                  </div>
                </div>
              </div>
            </div>
            {/* 메시지 내용 */}
            <div className="rounded-lg bg-[#fafafa] px-16 py-6">
              <div className="mb-4">
                <p className="mb-1 text-[13px] text-gray-500">메시지 타이틀</p>
                <h3 className="text-[18px] text-gray-900">{messageTitle}</h3>
              </div>
              <div>
                <p className="mb-1 text-[13px] text-gray-500">메시지 내용</p>
                <p className="rounded-md border-gray-100 bg-gray-50 text-[14px] leading-6 text-gray-700">
                  {messageContent}
                </p>
              </div>
            </div>
          </div>

          {/* 메시지 내용 */}
          {/* <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <p className="mb-1 text-[13px] text-gray-500">메시지 타이틀</p>
            <h3 className="font-apple-bold text-[18px] text-gray-900">
              {messageTitle}
            </h3>
          </div>
          <div>
            <p className="mb-1 text-[13px] text-gray-500">메시지 내용</p>
            <p className="rounded-md border border-gray-100 bg-gray-50 p-3 text-[14px] leading-6 text-gray-700">
              {messageContent}
            </p>
          </div>
        </div> */}
        </div>

        {/* 하단 테이블 */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h1 className="font-apple-medium m-4 text-center text-[20px] text-gray-700">
            수신 결과 목록
          </h1>
          {/* 상태에 따른 탭 */}
          <div className="mb-3">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid h-10 grid-cols-3 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                {RESULT_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                    <span className="ml-1 text-[12px] text-gray-500">
                      ({tabCounts[tab.value]})
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-gray-100 pb-3">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {/* <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="h-10"
            >
              <TabsList className="grid h-10 grid-cols-3 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                {RESULT_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`flex h-full items-center justify-center rounded-md px-3 text-[14px] leading-none transition-colors ${
                      tab.value === activeTab
                        ? "bg-point-gray-700 hover:bg-point-gray-700 text-white"
                        : "text-point-gray-700 hover:bg-point-gray-100"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`ml-1 text-[12px] ${
                        tab.value === activeTab ? "text-white" : "text-gray-500"
                      }`}
                    >
                      ({tabCounts[tab.value]})
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value={activeTab} className="mt-4" />
            </Tabs> */}
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="수신번호 또는 상태 메시지 검색"
                className="h-9 max-w-[300px] flex-1 rounded-md border border-gray-200 px-3 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
              />
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-9 rounded-md border border-gray-200 px-3 text-[13px] text-gray-700 focus:border-gray-400 focus:outline-none"
              />
              <span className="text-[13px] text-gray-500">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-9 rounded-md border border-gray-200 px-3 text-[13px] text-gray-700 focus:border-gray-400 focus:outline-none"
              />
              <Button
                type="button"
                variant="outline"
                className="h-9 px-4"
                onClick={handleResetFilters}
              >
                검색
              </Button>
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>총 {tabCounts[activeTab]}건</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-9 px-4">
                다운로드
              </Button>
              <Button
                type="button"
                variant="dark"
                className="h-9 px-4"
                onClick={handleResendByTab}
                disabled={filteredRows.length === 0}
              >
                재발송
              </Button>
            </div>
          </div>

          {/* <Tabs value={activeTab} onValueChange={handleTabChange} className="">
          <TabsList className="grid h-auto grid-cols-3 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            {RESULT_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`rounded-lg py-2.5 text-[14px] transition-colors ${
                  tab.value === activeTab
                    ? "bg-point-gray-700 hover:bg-point-gray-700 text-white"
                    : "text-point-gray-700 hover:bg-point-gray-100"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1 text-[12px] ${
                    tab.value === activeTab ? "text-white" : "text-gray-500"
                  }`}
                >
                  ({tabCounts[tab.value]})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab} className="mt-4" />
        </Tabs> */}

          {/* <div className="mb-3 border-b border-gray-100 pb-3">
          <h2 className="font-apple-medium text-[16px] text-gray-700">
            {RESULT_TABS.find((tab) => tab.value === activeTab)?.label}{" "}
            {filteredRows.length}건
          </h2>
        </div> */}

          <Table className="overflow-hidden rounded-lg border border-gray-100">
            <TableHeader>
              <TableRow className="border-b border-gray-100 bg-gray-50">
                <TableHead className="h-[44px] w-[48px] p-0 text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) =>
                        handleSelectAll(checked as boolean)
                      }
                    />
                  </div>
                </TableHead>
                <TableHead className="h-[44px] p-0 text-center text-[13px] font-medium text-gray-600">
                  요청 일시
                </TableHead>
                <TableHead className="h-[44px] p-0 text-center text-[13px] font-medium text-gray-600">
                  수신 번호
                </TableHead>
                <TableHead className="h-[44px] p-0 text-center text-[13px] font-medium text-gray-600">
                  수신 상태
                </TableHead>
                <TableHead className="h-[44px] w-[48px] p-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => {
                const isOpened = openedRowId === row.id;
                const isChecked = selectedIds.has(row.id);
                return (
                  <Fragment key={row.id}>
                    <TableRow
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() => handleToggleRow(row.id)}
                    >
                      <TableCell
                        className="h-[48px] p-0 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleSelectRow(row.id, checked as boolean)
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-apple-medium h-[48px] p-0 text-center text-[13px] leading-6 text-gray-900">
                        {formatDateTime(row.requestTime)}
                      </TableCell>
                      <TableCell className="font-apple-medium h-[48px] p-0 text-center text-[13px] leading-6 text-gray-900">
                        {row.receiverNumber}
                      </TableCell>
                      <TableCell className="font-apple-medium h-[48px] p-0 text-center text-[13px] leading-6 text-gray-900">
                        <Badge
                          variant="outline"
                          className={`px-2 py-0.5 text-[12px] ${getDeliveryStatusBadgeClass(
                            row.deliveryStatus,
                          )}`}
                        >
                          {row.deliveryStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-apple-medium h-[48px] p-0 text-center text-[13px] leading-6 text-gray-900">
                        <div className="flex items-center justify-center text-gray-500">
                          {isOpened ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="p-0">
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpened
                              ? "max-h-[320px] opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="mx-4 my-4 rounded-md border border-gray-200 bg-[#F7F8FA] p-4">
                            <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-[13px]">
                              <div className="space-y-1">
                                <p className="text-gray-500">수신 일시</p>
                                <p className="text-gray-900">
                                  {formatDateTime(row.completeTime)}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-gray-500">수신 상태</p>
                                <Badge
                                  variant="outline"
                                  className={`px-2 py-0.5 text-[12px] ${getDeliveryStatusBadgeClass(
                                    row.deliveryStatus,
                                  )}`}
                                >
                                  {row.deliveryStatus}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <p className="text-gray-500">
                                  수신 상태 메시지
                                </p>
                                <p className="text-gray-900">
                                  {row.statusMessage || "-"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
