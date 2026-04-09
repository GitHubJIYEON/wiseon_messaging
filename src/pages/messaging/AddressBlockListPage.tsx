import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DownloadIcon, PhoneOffIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { messagesApi } from "@/features/messaging/api/messagesApi";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import { downloadBlobAsFile } from "@/shared/utils/downloadFiles";

type SendType = "SMS" | "ALIMTALK";
type UnsubscribeStatus = "ACTIVE" | "PENDING" | "EXPIRED";

interface UnsubscribeRow {
  id: number;
  sendType: SendType;
  orgName: string;
  callingNumber: string;
  unsubscribeNumber080: string;
  status: UnsubscribeStatus;
  customUnsubscribeNumber: string | null;
  customBlockedNumbers: string[];
}

const SEND_TYPE_LABEL: Record<SendType, string> = {
  SMS: "문자",
  ALIMTALK: "알림톡",
};

const STATUS_CONFIG: Record<
  UnsubscribeStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "정상",
    className: "bg-green-50 text-green-600",
  },
  PENDING: {
    label: "대기",
    className: "bg-yellow-50 text-yellow-600",
  },
  EXPIRED: {
    label: "만료",
    className: "bg-gray-100 text-gray-500",
  },
};

const extractDigits = (value: string) => value.replace(/\D/g, "");

const isValidPhoneNumber = (digits: string) =>
  /^01[016789]\d{7,8}$/.test(digits);

const MOCK_ROWS: UnsubscribeRow[] = [
  {
    id: 1,
    sendType: "SMS",
    orgName: "위즈온 주식회사",
    callingNumber: "02-1234-5678",
    unsubscribeNumber080: "080-1234-5678",
    status: "ACTIVE",
    customUnsubscribeNumber: "010-9999-0000",
    customBlockedNumbers: [
      "01012345678",
      "01098765432",
      "01055556666",
      "01011112222",
      "01033334444",
      "01099990000",
      "01044445555",
      "01077778888",
      "01033334444",
      "01011112222",
      "01099990000",
      "01044445555",
      "01077778888",
      "01033334444",
      "01011112222",
      "01099990000",
      "01044445555",
      "01077778888",
      "01033334444",
      "01011112222",
      "01099990000",
      "01044445555",
      "01077778888",
      "01033334444",
      "01011112222",
      "01099990000",
      "01044445555",
      "01077778888",
      "01033334444",
      "01011112222",
      "01099990000",
      "01044445555",
      "01077778888",
      "01033334444",
      "01011112222",
      "01099990000",
      "01044445555",
      "01077778888",
      "01033334444",
      "01011112222",
      "01099990000",
      "01044445555",
      "01077778888",
      "01033334444",
      "01011112222",
      "01099990000",
      "01044445555",
      "01077778888",
      "01033334444",
      "01011112222",
      "01099990000",
      "01044445555",
      "01077778888",
      "01033334444",
      "01011112222",
    ],
  },
  {
    id: 2,
    sendType: "ALIMTALK",
    orgName: "스마트 설문 서비스",
    callingNumber: "031-987-6543",
    unsubscribeNumber080: "080-9876-5432",
    status: "ACTIVE",
    customUnsubscribeNumber: null,
    customBlockedNumbers: [],
  },
  {
    id: 3,
    sendType: "SMS",
    orgName: "고객센터 운영팀",
    callingNumber: "051-111-2222",
    unsubscribeNumber080: "080-1111-2222",
    status: "ACTIVE",
    customUnsubscribeNumber: "010-1234-5678",
    customBlockedNumbers: ["01077778888", "01033334444"],
  },
  {
    id: 4,
    sendType: "ALIMTALK",
    orgName: "이벤트 마케팅팀",
    callingNumber: "02-3333-4444",
    unsubscribeNumber080: "080-3333-4444",
    status: "EXPIRED",
    customUnsubscribeNumber: null,
    customBlockedNumbers: [],
  },
];

const MAX_UNSUBSCRIBE_NUMBERS = 5;

const MOCK_UNSUBSCRIBE_NUMBERS = [
  { id: 1, phoneNumber: "080-1234-5678", orgName: "수신거부 서비스 사용중" },
  { id: 2, phoneNumber: "080-9876-5432", orgName: "스마트 설문 서비스" },
  { id: 3, phoneNumber: "080-1111-2222", orgName: "고객센터 운영팀" },
];

export default function AddressBlockListPage() {
  const [rows, setRows] = useState<UnsubscribeRow[]>(MOCK_ROWS);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [registerOrgName, setRegisterOrgName] = useState("");
  const [registerOrgNumber, setRegisterOrgNumber] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [isChangeNumberModalOpen, setIsChangeNumberModalOpen] = useState(false);
  const [selectedNumberId, setSelectedNumberId] = useState<number | null>(
    MOCK_UNSUBSCRIBE_NUMBERS[0].id,
  );
  const [currentNumberId, setCurrentNumberId] = useState<number>(
    MOCK_UNSUBSCRIBE_NUMBERS[0].id,
  );

  const [customNumberTargetId, setCustomNumberTargetId] = useState<
    number | null
  >(null);
  const [customNumberInput, setCustomNumberInput] = useState("");
  const [isCustomNumberSaving, setIsCustomNumberSaving] = useState(false);

  const [detailTargetId, setDetailTargetId] = useState<number | null>(null);
  const [detailSearch, setDetailSearch] = useState("");

  const [cancelTargetRow, setCancelTargetRow] = useState<UnsubscribeRow | null>(
    null,
  );
  const [cancelOrgNameInput, setCancelOrgNameInput] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const toggleSelectId = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === rows.length && rows.length > 0) {
        return new Set();
      }
      return new Set(rows.map((r) => r.id));
    });
  }, [rows]);

  const columns = useMemo<ColumnDef<UnsubscribeRow>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                rows.length > 0 && selectedIds.size === rows.length
                  ? true
                  : selectedIds.size > 0
                    ? "indeterminate"
                    : false
              }
              onCheckedChange={toggleSelectAll}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={selectedIds.has(row.original.id)}
              onCheckedChange={() => toggleSelectId(row.original.id)}
            />
          </div>
        ),
        size: 52,
      },
      {
        id: "sendType",
        accessorKey: "sendType",
        header: "발송 구분",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                row.original.sendType === "SMS"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-yellow-50 text-yellow-600"
              }`}
            >
              {SEND_TYPE_LABEL[row.original.sendType]}
            </span>
          </div>
        ),
        size: 110,
      },
      {
        id: "orgName",
        accessorKey: "orgName",
        header: "발신번호 기관명",
        cell: ({ row }) => (
          <div className="px-2.5 text-center">
            {row.getValue<string>("orgName")}
          </div>
        ),
        size: 180,
      },
      {
        id: "callingNumber",
        accessorKey: "callingNumber",
        header: "발신 번호",
        cell: ({ row }) => (
          <div className="px-2.5 font-mono text-[13px]">
            {row.getValue<string>("callingNumber")}
          </div>
        ),
        size: 180,
      },
      {
        id: "unsubscribeNumber080",
        accessorKey: "unsubscribeNumber080",
        header: "080 수신거부 번호",
        cell: ({ row }) => (
          <div className="px-2.5 font-mono text-[13px]">
            {row.getValue<string>("unsubscribeNumber080")}
          </div>
        ),
        size: 180,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "상태",
        cell: ({ row }) => {
          const config = STATUS_CONFIG[row.original.status];
          return (
            <div className="flex items-center justify-center">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ${config.className}`}
              >
                {config.label}
              </span>
            </div>
          );
        },
        size: 100,
      },
      {
        id: "add",
        header: "사용자 지정 수신거부 번호",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              onClick={() => setCustomNumberTargetId(row.original.id)}
            >
              <PlusIcon className="size-3" />
              추가
            </Button>
          </div>
        ),
        size: 100,
      },
      {
        id: "customUnsubscribeNumber",
        header: "수신거부 번호 목록",
        cell: ({ row }) => {
          const count = row.original.customBlockedNumbers.length;
          return (
            <div
              className="flex items-center justify-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* <Button
                type="button"
                variant="outline"
                className="h-7 px-2.5 text-[12px] text-gray-500"
                onClick={() => {
                  setCustomNumberTargetId(row.original.id);
                  setCustomNumberInput("");
                }}
              >
                <PlusIcon className="size-3" />
                추가
              </Button> */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setDetailTargetId(row.original.id)}
              >
                상세보기
                {count > 0 && (
                  <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
                    {count}
                  </span>
                )}
              </Button>
            </div>
          );
        },
        size: 240,
      },
    ],
    [rows.length, selectedIds, toggleSelectAll, toggleSelectId],
  );

  const { table } = useDataTable({
    data: rows,
    columns,
    pageCount: 1,
    meta: { totalCount: rows.length },
    getRowId: (row) => String(row.id),
  });

  const handleRegister = async () => {
    if (!registerOrgName.trim()) {
      toast.error("기관명을 입력해주세요.");
      return;
    }

    setIsRegistering(true);

    try {
      await messagesApi.createUnsubscribes([
        { clientTelNo: registerOrgNumber },
      ]);
      toast.success("수신거부 번호를 등록했습니다.");
      setIsRegisterDialogOpen(false);
      setRegisterOrgName("");
      setRegisterOrgNumber("");
    } catch {
      toast.error("수신거부 번호 등록에 실패했습니다.");
    } finally {
      setIsRegistering(false);
    }
  };

  const parseRegisterInput = (raw: string): string[] => {
    const lines = raw
      .split(/[\n,;]+/)
      .map((line) => extractDigits(line.trim()))
      .filter(Boolean);
    return [...new Set(lines)];
  };

  const handleSaveCustomNumber = () => {
    if (customNumberTargetId === null) return;
    const phones = parseRegisterInput(customNumberInput);
    if (phones.length === 0) {
      toast.error("등록할 전화번호를 입력해주세요.");
      return;
    }
    const invalidPhones = phones.filter((p) => !isValidPhoneNumber(p));
    if (invalidPhones.length > 0) {
      toast.error(
        `유효하지 않은 번호가 ${invalidPhones.length}건 있습니다: ${invalidPhones.slice(0, 3).join(", ")}${invalidPhones.length > 3 ? " ..." : ""}`,
      );
      return;
    }
    setIsCustomNumberSaving(true);
    setTimeout(() => {
      setRows((prev) =>
        prev.map((r) =>
          r.id === customNumberTargetId
            ? {
                ...r,
                customBlockedNumbers: [
                  ...new Set([...r.customBlockedNumbers, ...phones]),
                ],
              }
            : r,
        ),
      );
      toast.success(`${phones.length}건의 수신거부 번호를 등록했습니다.`);
      setCustomNumberTargetId(null);
      setCustomNumberInput("");
      setIsCustomNumberSaving(false);
    }, 300);
  };

  const detailTargetRow = rows.find((r) => r.id === detailTargetId);

  const activeCount = rows.filter((r) => r.status === "ACTIVE").length;
  const pendingCount = rows.filter((r) => r.status === "PENDING").length;
  const potentialCount = activeCount + pendingCount;
  const availableCount = Math.max(0, MAX_UNSUBSCRIBE_NUMBERS - potentialCount);
  const usagePercent = Math.min(
    100,
    (activeCount / MAX_UNSUBSCRIBE_NUMBERS) * 100,
  );
  const potentialPercent = Math.min(
    100,
    (potentialCount / MAX_UNSUBSCRIBE_NUMBERS) * 100,
  );
  const usageColor: "red" | "blue" =
    potentialCount >= MAX_UNSUBSCRIBE_NUMBERS ? "red" : "blue";

  const currentNumber = MOCK_UNSUBSCRIBE_NUMBERS.find(
    (n) => n.id === currentNumberId,
  );

  const handleConfirmChangeNumber = () => {
    if (selectedNumberId === null) return;
    setCurrentNumberId(selectedNumberId);
    setIsChangeNumberModalOpen(false);
    toast.success("기본 수신거부번호가 변경되었습니다.");
  };

  const handleCancelRegistration = (row: UnsubscribeRow) => {
    setCancelTargetRow(row);
    setCancelOrgNameInput("");
  };

  const handleConfirmCancel = () => {
    if (!cancelTargetRow) return;
    if (cancelOrgNameInput.trim() !== cancelTargetRow.orgName) {
      toast.error("기관명이 일치하지 않습니다. 다시 확인해주세요.");
      return;
    }
    setIsCancelling(true);
    setTimeout(() => {
      setRows((prev) => prev.filter((r) => r.id !== cancelTargetRow.id));
      toast.success("등록 취소가 완료되었습니다.");
      setCancelTargetRow(null);
      setCancelOrgNameInput("");
      setIsCancelling(false);
    }, 300);
  };

  const parsedPhoneCount = parseRegisterInput(customNumberInput).length;

  const handleDownloadDetailExcel = (row: UnsubscribeRow) => {
    const numbers = row.customBlockedNumbers;
    if (numbers.length === 0) {
      toast.error("다운로드할 수신거부 번호가 없습니다.");
      return;
    }

    const formatPhone = (phone: string) => {
      if (phone.length === 11)
        return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
      if (phone.length === 10)
        return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
      return phone;
    };

    const header = ["번호", "수신거부 번호"];
    const dataRows = numbers.map((phone, idx) => [
      String(idx + 1),
      formatPhone(phone),
    ]);

    const csvContent = [header, ...dataRows]
      .map((cols) => cols.map((c) => `"${c}"`).join(","))
      .join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const safeOrgName = row.orgName.replace(/[^\w가-힣]/g, "_");
    downloadBlobAsFile(blob, `수신거부번호_${safeOrgName}.csv`);
  };

  return (
    <>
      <section className="mx-auto flex w-[1200px] flex-col gap-8 pb-[30px]">
        <div className="pt-10">
          <h1 className="font-apple-ultra text-center text-[32px] leading-[45px] text-[#1B1D21]">
            수신거부 관리
          </h1>
          <p className="font-apple-light mt-3 text-center text-[16px] leading-6 text-gray-500">
            광고 메시지 수신을 거부한 번호를 조회하고, 직접 등록하거나 삭제할 수
            있습니다.
          </p>
        </div>

        <article className="overflow-hidden rounded-[16px] border border-gray-300 bg-white">
          <div className="flex items-center justify-between p-8">
            <div className="flex items-center gap-6">
              <div className="bg-primary-50 text-primary-500 flex h-12 w-12 items-center justify-center rounded-full">
                <PhoneOffIcon className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-apple-medium text-[16px] text-gray-600">
                  수신거부 번호
                </h2>
                <div className="flex flex-row items-baseline gap-2">
                  <span className="font-apple-bold text-[22px] leading-tight tracking-wide text-gray-900">
                    {currentNumber?.phoneNumber}
                  </span>
                  <span className="font-apple-light text-[14px] text-gray-500">
                    {currentNumber?.orgName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="font-apple-medium h-[40px] rounded px-4 text-[14px] text-gray-700"
                onClick={() => {
                  setSelectedNumberId(currentNumberId);
                  setIsChangeNumberModalOpen(true);
                }}
              >
                수신거부번호 철회
              </Button>
              <Button
                type="button"
                onClick={() => setIsRegisterDialogOpen(true)}
                className="h-[40px]"
                disabled={potentialCount >= MAX_UNSUBSCRIBE_NUMBERS}
              >
                수신거부 번호 추가
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-100 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-apple-medium text-[13px] text-gray-500">
                    정상
                  </span>
                  <span
                    className={`font-apple-bold text-[18px] leading-none ${
                      usageColor === "red" ? "text-red-500" : "text-primary-500"
                    }`}
                  >
                    {activeCount}
                  </span>
                  <span className="font-apple-light text-[13px] text-gray-500">
                    / {MAX_UNSUBSCRIBE_NUMBERS}
                  </span>
                </div>
              </div>

              {pendingCount > 0 && (
                <p className="font-apple-light text-[11px] text-gray-500">
                  수신거부 서비스 번호 (1)+ 사용자 지정 (
                  {MAX_UNSUBSCRIBE_NUMBERS}) = 6개
                </p>
              )}
            </div>

            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="relative h-full">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                    usageColor === "red" ? "bg-red-500" : "bg-primary-500"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          </div>
        </article>

        <section className="bg-white">
          <h2 className="font-apple-medium mb-4 text-[20px] text-gray-800">
            수신거부 번호
          </h2>
          <DataTable table={table} className="bg-white">
            <section className="mb-2.5 flex items-center justify-between">
              <h2 className="font-apple-medium text-lg text-gray-700">
                총 {rows.length}건
              </h2>
            </section>
          </DataTable>
        </section>
      </section>

      <Dialog
        open={isChangeNumberModalOpen}
        onOpenChange={(open) => !open && setIsChangeNumberModalOpen(false)}
      >
        <DialogContent
          className="flex max-h-[80vh] w-[560px] flex-col p-0"
          showCloseButton
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>기본 수신거부번호 변경</DialogTitle>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col px-8 pt-2 pb-4">
            <p className="font-apple-light mb-3 shrink-0 text-[13px] text-gray-500">
              아래 목록에서 기본 수신거부번호로 사용할 번호를 선택해주세요.
            </p>

            <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-gray-50/60">
              <ul
                className="flex h-full flex-col gap-2 overflow-y-auto p-2 [scrollbar-gutter:stable]"
                role="listbox"
                aria-label="기본 수신거부번호 선택"
              >
                {MOCK_UNSUBSCRIBE_NUMBERS.map((item) => {
                  const isSelected = selectedNumberId === item.id;
                  const isCurrent = currentNumberId === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => setSelectedNumberId(item.id)}
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? "bg-primary-50 border-primary-200"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? "border-primary-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <span className="bg-primary-500 h-2.5 w-2.5 rounded-full" />
                          )}
                        </span>

                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="font-apple-medium text-[15px] text-gray-900">
                            {item.phoneNumber}
                          </span>
                          <span className="font-apple-light text-[13px] text-gray-500">
                            {item.orgName}
                          </span>
                        </div>

                        {isCurrent && (
                          <span className="font-apple-medium text-primary-500 border-primary-200 bg-primary-50 shrink-0 rounded-full border px-2 py-0.5 text-[11px]">
                            현재 수신거부번호
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <DialogFooter className="px-8 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsChangeNumberModalOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleConfirmChangeNumber}
              disabled={
                selectedNumberId === null ||
                selectedNumberId === currentNumberId
              }
            >
              변경하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRegisterDialogOpen}
        onOpenChange={(open) => {
          setIsRegisterDialogOpen(open);
          if (!open) {
            setRegisterOrgName("");
          }
        }}
      >
        <DialogContent className="w-[560px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>수신거부 번호 등록</DialogTitle>
          </DialogHeader>

          <div className="p-8">
            {/* 수신 거부 번호 표기 의무 안내*/}
            <p className="font-apple-medium text-[16px] text-gray-800">
              수신거부 번호 표기 의무 안내
            </p>
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
              <span className="font-apple-light text-[14px] text-gray-600">
                불법 스팸 방지를 위한 정보통신망법(제50조) 강화에 따라 광고성
                문자 전송 시, 수신자가 무료로 수신 거부나 수신 동의를 철회할 수
                있도록 조치해야 합니다. 또한, 광고성 메시지 내용에 수신 거부 및
                수신 동의 철회 시 수신자가 비용을 부담하지 않는다는 내용을
                다음과 같이 기재해야 합니다.
                <br />
                <br />
              </span>
              <span className="font-apple-light text-[14px] text-gray-800">
                - 등록 신청 후 3일 이내 정상 수신거부 번호로 전환됩니다.
                <br />- 수신거부 번호는 자동으로 지정됩니다.
                <br />
              </span>
            </div>

            <div className="space-y-2">
              <div className="space-y-2">
                <label
                  htmlFor="register-org-name"
                  className="font-apple-medium text-[14px] leading-5 text-gray-700"
                >
                  수신거부 번호 이름
                </label>
                <Input
                  id="register-org-name"
                  value={registerOrgName}
                  onChange={(e) => setRegisterOrgName(e.target.value)}
                  placeholder="예: 와이즈온 회사"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="register-org-number"
                  className="font-apple-medium text-[14px] leading-5 text-gray-700"
                >
                  수신거부 번호
                </label>
                <Input
                  id="register-org-number"
                  value={registerOrgNumber}
                  onChange={(e) => setRegisterOrgNumber(e.target.value)}
                  placeholder="예: 080-1111-2222"
                />
                <p className="font-apple-light text-[13px] leading-5 text-gray-500">
                  080 수신거부 번호는 자동으로 지정되며 영업일 기준 3일
                  소요됩니다.
                </p>
              </div>
            </div>

            <DialogFooter className="mt-8 flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsRegisterDialogOpen(false);
                  setRegisterOrgNumber("");
                }}
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={handleRegister}
                disabled={
                  isRegistering ||
                  registerOrgName.trim() === "" ||
                  registerOrgNumber.trim() === ""
                }
              >
                {isRegistering ? "등록 중..." : `수신거부 번호 등록`}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={customNumberTargetId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCustomNumberTargetId(null);
            setCustomNumberInput("");
          }
        }}
      >
        <DialogContent className="w-[560px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>사용자 지정 수신거부 번호 추가</DialogTitle>
          </DialogHeader>

          <div className="p-8">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-apple-medium text-[14px] leading-5 text-gray-700">
                  전화번호 입력
                </p>
                <p className="font-apple-light text-[13px] leading-5 text-gray-500">
                  최대 1,000건
                </p>
              </div>
              <Textarea
                value={customNumberInput}
                onChange={(e) => setCustomNumberInput(e.target.value)}
                placeholder={
                  "수신거부할 전화번호를 입력해주세요.\n줄바꿈, 쉼표(,), 세미콜론(;)으로 구분합니다.\n\n예:\n01012345678\n010-9876-5432\n01011112222, 01033334444"
                }
                className="min-h-[200px] resize-none bg-white"
              />
              <div className="mt-2 flex items-center justify-between text-[13px] leading-5 text-gray-500">
                <span>숫자 외 문자(하이픈 등)는 자동으로 제거됩니다.</span>
                <span>
                  {parsedPhoneCount > 0
                    ? `${parsedPhoneCount}건 인식됨`
                    : "번호를 입력해주세요"}
                </span>
              </div>
            </div>

            <DialogFooter className="mt-8 flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCustomNumberTargetId(null);
                  setCustomNumberInput("");
                }}
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={handleSaveCustomNumber}
                disabled={isCustomNumberSaving || parsedPhoneCount === 0}
              >
                {isCustomNumberSaving
                  ? "등록 중..."
                  : `등록하기 (${parsedPhoneCount}건)`}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 수신거부 번호 상세 모달 */}
      <Dialog
        open={detailTargetId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetailTargetId(null);
            setDetailSearch("");
          }
        }}
      >
        <DialogContent
          className="flex max-h-[80vh] w-[520px] max-w-[95vw] flex-col p-0"
          showCloseButton
        >
          {/* 헤더 */}
          <DialogHeader className="shrink-0 border-b border-gray-100">
            <DialogTitle className="text-[18px]">
              수신거부 번호 상세
            </DialogTitle>
          </DialogHeader>
          {/* */}

          {/* 검색 + 카운트 */}
          <div className="shrink-0 px-8 pt-5 pb-3">
            <div className="mb-4">
              {detailTargetRow && (
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="font-apple-light text-[14px] text-gray-600">
                    발신 번호
                  </span>
                  <span className="font-mono text-[14px] font-medium text-gray-700">
                    {detailTargetRow.callingNumber}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[12px] text-gray-500">
                    {detailTargetRow.orgName}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  placeholder="번호 검색 (숫자만 입력)"
                  value={detailSearch}
                  onChange={(e) => setDetailSearch(e.target.value)}
                  className="h-10 pl-4 text-[13px]"
                />
                {detailSearch && (
                  <button
                    type="button"
                    onClick={() => setDetailSearch("")}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="검색어 지우기"
                  >
                    ✕
                  </button>
                )}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-10 shrink-0 gap-1.5 px-3 text-[13px]"
                onClick={() =>
                  detailTargetRow && handleDownloadDetailExcel(detailTargetRow)
                }
                disabled={
                  !detailTargetRow ||
                  detailTargetRow.customBlockedNumbers.length === 0
                }
              >
                <DownloadIcon className="size-3.5" />
                다운로드
              </Button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="font-apple-light text-[12px] text-gray-400">
                {detailSearch
                  ? (() => {
                      const cnt = (
                        detailTargetRow?.customBlockedNumbers ?? []
                      ).filter((p) =>
                        extractDigits(p).includes(extractDigits(detailSearch)),
                      ).length;
                      return `검색 결과 ${cnt}건`;
                    })()
                  : null}
              </p>
              <p className="font-apple-light text-[12px] text-gray-400">
                총{" "}
                <span className="font-apple-medium text-gray-700">
                  {detailTargetRow?.customBlockedNumbers.length ?? 0}
                </span>
                건
              </p>
            </div>
          </div>

          {/* 리스트 */}
          <div className="min-h-0 flex-1 px-8 pb-2">
            {(() => {
              const filtered = (
                detailTargetRow?.customBlockedNumbers ?? []
              ).filter((phone) =>
                extractDigits(phone).includes(extractDigits(detailSearch)),
              );
              return filtered.length === 0 ? (
                <div className="flex h-[160px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
                  <p className="text-[13px] text-gray-400">
                    {detailSearch
                      ? "검색된 번호가 없습니다."
                      : "등록된 수신거부 번호가 없습니다."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <ul className="h-[400px] divide-y divide-gray-100 overflow-y-auto">
                      {filtered.map((phone, idx) => (
                        <li
                          key={phone}
                          className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-gray-50"
                        >
                          <span className="font-apple-light w-5 shrink-0 text-center text-[12px] text-gray-300">
                            {idx + 1}
                          </span>
                          <span className="font-mono text-[14px] tracking-wide text-gray-800">
                            {phone.length === 11
                              ? `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`
                              : phone.length === 10
                                ? `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
                                : phone}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              );
            })()}
          </div>

          {/* 푸터 */}
          <DialogFooter className="shrink-0 border-t border-gray-100 px-8 py-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDetailTargetId(null)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 등록 취소 확인 모달 */}
      <Dialog
        open={cancelTargetRow !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTargetRow(null);
            setCancelOrgNameInput("");
          }
        }}
      >
        <DialogContent className="w-[480px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>수신거부 번호 등록 취소</DialogTitle>
          </DialogHeader>

          <div className="px-8 pt-2 pb-8">
            <p className="font-apple-light mb-6 text-[14px] leading-6 text-gray-500">
              등록 취소를 진행하려면 "
              <span className="font-apple-medium text-black">
                {cancelTargetRow?.orgName}
              </span>
              "을 정확히 입력해주세요.
            </p>

            <div className="space-y-2">
              <label
                htmlFor="cancel-org-name"
                className="font-apple-medium text-[14px] leading-5 text-gray-700"
              >
                발신번호 기관명
              </label>
              <Input
                id="cancel-org-name"
                value={cancelOrgNameInput}
                onChange={(e) => setCancelOrgNameInput(e.target.value)}
                placeholder={cancelTargetRow?.orgName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmCancel();
                }}
              />
              {cancelOrgNameInput.length > 0 &&
                cancelOrgNameInput !== cancelTargetRow?.orgName && (
                  <p className="font-apple-light text-[12px] text-red-500">
                    기관명이 일치하지 않습니다.
                  </p>
                )}
            </div>

            <DialogFooter className="mt-8 flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCancelTargetRow(null);
                  setCancelOrgNameInput("");
                }}
              >
                취소
              </Button>
              <Button
                type="button"
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={handleConfirmCancel}
                disabled={
                  isCancelling ||
                  cancelOrgNameInput.trim() !== cancelTargetRow?.orgName
                }
              >
                {isCancelling ? "취소 중..." : "등록 취소"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
