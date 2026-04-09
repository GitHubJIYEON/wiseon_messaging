import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CheckCircle2Icon, FileTextIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import type {
  ChargeMessageType,
  PriceChargeRequest,
  PriceChargeStatus,
} from "./priceChargeData";
import { MOCK_PRICE_CHARGE_REQUESTS } from "./priceChargeData";

const ALL_STATUS = "전체" as const;
type StatusFilter = PriceChargeStatus | typeof ALL_STATUS;

const STATUS_STYLE: Record<
  PriceChargeStatus,
  { label: string; className: string }
> = {
  대기: {
    label: "대기",
    className: "border-blue-200 bg-blue-50 text-blue-600",
  },
  완료: {
    label: "완료",
    className: "border-green-200 bg-green-50 text-green-600",
  },
  취소: {
    label: "취소",
    className: "border-red-200 bg-red-50 text-red-600",
  },
};

const formatDateTime = (value: string) =>
  format(new Date(value), "yyyy.MM.dd HH:mm");

const STATUS_DETAIL_LABEL: Record<PriceChargeStatus, string> = {
  대기: "대기",
  완료: "완료",
  취소: "취소",
};

const STATUS_BADGE_DETAIL: Record<PriceChargeStatus, string> = {
  대기: "border-blue-200 bg-blue-50 text-blue-600",
  완료: "border-green-200 bg-green-50 text-green-600",
  취소: "border-red-200 bg-red-50 text-red-600",
};

const STATUS_UNKNOWN_CLASSNAME = "border-gray-200 bg-gray-100 text-gray-600";

function resolveStatusStyle(status: string): {
  label: string;
  className: string;
} {
  if (status === "대기" || status === "완료" || status === "취소") {
    return STATUS_STYLE[status];
  }
  return { label: status, className: STATUS_UNKNOWN_CLASSNAME };
}

interface AdminPriceChargeHistoryTableProps {
  data?: PriceChargeRequest[];
  onDetail?: (item: PriceChargeRequest) => void;
  /** 사용자 충전 페이지: 기관 컬럼·상세 기관명 숨김, 관리자 승인 버튼 비표시 */
  variant?: "admin" | "user";
}

export default function AdminPriceChargeHistoryTable({
  data: externalData,
  onDetail,
  variant = "admin",
}: AdminPriceChargeHistoryTableProps) {
  const [internalData] = useState<PriceChargeRequest[]>(
    MOCK_PRICE_CHARGE_REQUESTS,
  );
  const data = externalData ?? internalData;

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_STATUS);
  const [detailItem, setDetailItem] = useState<PriceChargeRequest | null>(null);

  const filteredData = useMemo(() => {
    const keyword = searchInput.trim().toLowerCase();
    return data.filter((item) => {
      const matchesStatus =
        statusFilter === ALL_STATUS || item.status === statusFilter;
      const matchesKeyword =
        !keyword ||
        item.applicantName.toLowerCase().includes(keyword) ||
        item.messageType.toLowerCase().includes(keyword) ||
        (variant === "admin" &&
          item.organizationName.toLowerCase().includes(keyword));
      return matchesStatus && matchesKeyword;
    });
  }, [data, searchInput, statusFilter, variant]);

  const handleReset = () => {
    setSearchInput("");
    setStatusFilter(ALL_STATUS);
  };

  const handleOpenDetail = useCallback(
    (item: PriceChargeRequest) => {
      setDetailItem(item);
      onDetail?.(item);
    },
    [onDetail],
  );

  const handleCloseDetail = useCallback(() => {
    setDetailItem(null);
  }, []);

  const handleIssueQuote = () => {
    if (!detailItem) return;
    if (variant === "user") {
      toast.success(`충전 신청(${detailItem.id}) 견적서 발행을 요청했습니다.`);
    } else {
      toast.success(
        `${detailItem.organizationName} 충전 신청(${detailItem.id}) 견적서 발행을 요청했습니다.`,
      );
    }
  };

  const handleApprove = () => {
    if (!detailItem) return;
    toast.success(
      `${detailItem.organizationName} 충전 신청(${detailItem.id})을 승인했습니다.`,
    );
    handleCloseDetail();
  };

  const columns = useMemo<ColumnDef<PriceChargeRequest>[]>(
    () => [
      {
        id: "requestedAt",
        accessorKey: "requestedAt",
        header: "신청일시",
        size: 160,
        cell: ({ row }) => (
          <div className="font-apple-light px-2.5 text-center text-[13px]">
            {formatDateTime(row.getValue<string>("requestedAt"))}
          </div>
        ),
      },
      {
        id: "messageType",
        accessorKey: "messageType",
        header: "발송 유형",
        size: 96,
        cell: ({ row }) => (
          <div className="px-2.5 text-center text-[13px]">
            {row.getValue<ChargeMessageType>("messageType")}
          </div>
        ),
      },
      ...(variant === "user"
        ? []
        : [
            {
              id: "organizationName",
              accessorKey: "organizationName",
              header: "기관명",
              size: 180,
              cell: ({ row }) => (
                <div className="max-w-[180px] min-w-0 truncate px-2.5 text-start">
                  {row.getValue<string>("organizationName")}
                </div>
              ),
            } satisfies ColumnDef<PriceChargeRequest>,
          ]),
      {
        id: "applicantName",
        accessorKey: "applicantName",
        header: "신청자명",
        size: 200,
        cell: ({ row }) => (
          <div className="truncate text-center">
            {row.getValue<string>("applicantName")}
          </div>
        ),
      },
      {
        id: "units",
        accessorKey: "units",
        header: "충전 건수",
        size: 120,
        cell: ({ row }) => (
          <div className="px-2.5 text-center">
            {row.getValue<number>("units")}건
          </div>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: "상태",
        size: 120,
        cell: ({ row }) => {
          const status = String(row.getValue("status"));
          const style = resolveStatusStyle(status);
          return (
            <div className="flex items-center justify-center px-2.5">
              <Badge
                variant="outline"
                className={cn("min-w-[72px] text-[12px]", style.className)}
              >
                {style.label}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "detail",
        header: "상세보기",
        size: 120,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              className="flex items-center justify-center px-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-[13px]"
                onClick={() => handleOpenDetail(item)}
              >
                상세보기
              </Button>
            </div>
          );
        },
      },
    ],
    [handleOpenDetail, variant],
  );

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: 1,
    meta: { totalCount: filteredData.length },
    getRowId: (row) => row.id,
  });

  return (
    <DataTable table={table} className="bg-white">
      <section className="mb-2.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-apple-medium text-lg text-gray-700">
          총 {filteredData.length}건
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="h-[42px] w-[140px] text-[13px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUS}>전체</SelectItem>
              <SelectItem value="대기">대기</SelectItem>
              <SelectItem value="완료">완료</SelectItem>
              <SelectItem value="취소">취소</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder={
              variant === "user"
                ? "신청자명·발송유형"
                : "기관명·신청자명·발송유형"
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-[42px] w-[200px] rounded text-[13px]/5 text-gray-700 placeholder:text-gray-500"
          />
          <Button
            type="button"
            variant="outline"
            className="font-apple-medium h-[42px] w-[76px] rounded text-[14px]/[24px] text-gray-700"
            onClick={handleReset}
          >
            초기화
          </Button>
        </div>
      </section>

      <Dialog
        open={detailItem !== null}
        onOpenChange={(open) => !open && handleCloseDetail()}
      >
        <DialogContent className="w-[520px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>충전 신청 상세</DialogTitle>
          </DialogHeader>

          {detailItem && (
            <div className="px-8 py-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="font-apple-medium text-[13px] text-gray-500">
                  상태
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[12px]",
                    STATUS_BADGE_DETAIL[detailItem.status] ??
                      STATUS_UNKNOWN_CLASSNAME,
                  )}
                >
                  {STATUS_DETAIL_LABEL[detailItem.status] ?? detailItem.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <DetailRow label="신청 ID" value={detailItem.id} />
                <DetailRow
                  label="신청일시"
                  value={formatDateTime(detailItem.requestedAt)}
                />
                <DetailRow label="발송 유형" value={detailItem.messageType} />
                {variant === "admin" && (
                  <DetailRow
                    label="기관명"
                    value={detailItem.organizationName}
                  />
                )}
                <DetailRow label="신청자명" value={detailItem.applicantName} />
                <DetailRow label="충전 건수" value={`${detailItem.units}건`} />
                {detailItem.processedAt && (
                  <DetailRow
                    label={
                      detailItem.status === "취소"
                        ? "처리일시"
                        : "승인·처리일시"
                    }
                    value={formatDateTime(detailItem.processedAt)}
                  />
                )}
              </div>

              {detailItem.requestNote && (
                <div className="mt-6">
                  <p className="font-apple-medium mb-2 text-[14px] text-gray-700">
                    요청 내용
                  </p>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="font-apple-light text-[13px] leading-5 whitespace-pre-wrap text-gray-600">
                      {detailItem.requestNote}
                    </p>
                  </div>
                </div>
              )}

              {detailItem.status === "취소" && detailItem.rejectReason && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50/60 px-5 py-4">
                  <p className="font-apple-medium mb-1.5 text-[13px] text-red-600">
                    반려 사유
                  </p>
                  <p className="font-apple-light text-[13px] leading-5 whitespace-pre-wrap text-red-500">
                    {detailItem.rejectReason}
                  </p>
                </div>
              )}

              <DialogFooter className="mt-8 flex-row flex-wrap justify-end gap-2 sm:gap-3">
                {detailItem.status === "취소" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDetail}
                  >
                    닫기
                  </Button>
                ) : (
                  <>
                    {variant === "admin" && detailItem.status === "대기" && (
                      <Button
                        type="button"
                        className="gap-2"
                        onClick={handleApprove}
                      >
                        <CheckCircle2Icon className="size-4" />
                        승인하기
                      </Button>
                    )}
                    {detailItem.status === "완료" && (
                      <Button
                        type="button"
                        className="gap-2"
                        onClick={handleIssueQuote}
                      >
                        <FileTextIcon className="size-4" />
                        견적서 발행
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDetail}
                    >
                      닫기
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DataTable>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 text-[14px]">
      <span className="font-apple-medium w-[100px] shrink-0 text-gray-500">
        {label}
      </span>
      <span className="font-apple-light text-gray-800">{value}</span>
    </div>
  );
}
