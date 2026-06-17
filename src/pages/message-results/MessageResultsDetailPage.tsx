import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  FAILURE_REASON_CONFIG,
  RECIPIENT_STATUS_CONFIG,
} from "@/features/message-results/constants";
import type {
  FailureReason,
  RecipientStatus,
} from "@/features/message-results/types";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import { formatDateTime } from "@/shared/utils/formatDate";
import { formatPhoneNumber } from "@/shared/utils/formatPhoneNumber";

interface MessageResultRecipientRow {
  id: number;
  status: RecipientStatus;
  completedAt?: string;
  phoneNumber: string;
  failureReason?: FailureReason;
  memo?: string;
}

const mockData: { result: MessageResultRecipientRow[] } = {
  result: [
    {
      id: 1,
      status: "SUCCESS",
      completedAt: "2026-04-06T02:06:35Z",
      phoneNumber: "01012345678",
      memo: "정상 수신",
    },
    {
      id: 2,
      status: "FAILED",
      completedAt: "2026-04-06T02:06:40Z",
      phoneNumber: "01098765432",
      failureReason: "INVALID_NUMBER",
      memo: "번호 형식 확인 필요",
    },
    {
      id: 3,
      status: "PENDING",
      phoneNumber: "01055556666",
      memo: "통신사 응답 대기",
    },
  ],
};

export default function MessageResultsDetailPage() {
  const columns = useMemo<ColumnDef<MessageResultRecipientRow>[]>(() => {
    return [
      {
        header: "수신 상태",
        accessorKey: "status",
        size: 80,
        cell: ({ row }) => {
          const { label, variant } =
            RECIPIENT_STATUS_CONFIG[row.original.status];

          return (
            <Badge variant={variant as "green" | "red" | "yellow"}>
              {label}
            </Badge>
          );
        },
      },
      {
        header: "수신 일시",
        accessorKey: "completedAt",
        size: 120,
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.completedAt
              ? formatDateTime(row.original.completedAt)
              : "-"}
          </div>
        ),
      },
      {
        header: "수신 번호",
        accessorKey: "phoneNumber",
        size: 120,
        cell: ({ row }) => (
          <div className="text-sm">
            {formatPhoneNumber(row.original.phoneNumber)}
          </div>
        ),
      },
      {
        header: "비고",
        accessorKey: "memo",
        size: 280,
        cell: ({ row }) => {
          const reason = row.original.failureReason;
          const description = reason
            ? FAILURE_REASON_CONFIG[reason].label
            : row.original.memo;

          return (
            <div className="truncate text-left text-sm text-gray-600">
              {description || "-"}
            </div>
          );
        },
      },
    ];
  }, []);

  const { table } = useDataTable({
    data: mockData.result,
    columns,
    pageCount: 1,
  });

  return (
    <section className="mx-auto mb-10 flex max-w-6xl flex-col gap-6">
      <h1 className="mt-8 text-center text-2xl">발송 결과 상세보기</h1>
      <Tabs defaultValue="summary">
        <TabsList variant="line">
          <TabsTrigger value="summary">발신 정보</TabsTrigger>
          <TabsTrigger value="details">수신 정보</TabsTrigger>
        </TabsList>

        {/* 발신 정보 */}
        <TabsContent value="summary">
          <div className="rounded-md bg-white p-7"></div>
        </TabsContent>

        {/* 수신 정보 */}
        <TabsContent value="details">
          <div className="rounded-md bg-white p-7">
            <Tabs defaultValue="success">
              <TabsList>
                <TabsTrigger value="success">성공</TabsTrigger>
                <TabsTrigger value="failed">실패</TabsTrigger>
                <TabsTrigger value="no-response">미응답</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 테이블 */}
            <div className="mt-6">
              <DataTable table={table} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
