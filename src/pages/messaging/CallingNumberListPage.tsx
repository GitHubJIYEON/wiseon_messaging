import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { format } from "date-fns";
import {
  CheckCircle2Icon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  PhoneIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MOCK_CALLING_NUMBERS } from "@/features/messaging/components/callingNumber/callingNumberData";
import CallingNumberTable, {
  type CallingNumber,
} from "@/features/messaging/components/callingNumber/CallingNumberTable";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@/shared/components/dataTable/DataTableActionBar";
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
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { Textarea } from "@/shared/components/ui/textarea";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import { downloadBlobAsFile } from "@/shared/utils/downloadFiles";

interface RenewAttachment {
  id: string;
  label: string;
  description: string;
  required: boolean;
  file: File | null;
  accept: string;
  guideUrl?: string;
}

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".docx", ".doc"];

const createRenewAttachments = (): RenewAttachment[] => [
  {
    id: "business-registration",
    label: "사업자 등록증",
    description: "사업자 등록증 사본 (PDF, JPG, PNG)",
    required: true,
    file: null,
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    id: "telecom-certificate",
    label: "통신 서비스 이용증명원",
    description: "발신번호의 통신 서비스 이용증명원 (최근 1개월 이내 발급)",
    required: true,
    file: null,
    accept: ".pdf,.jpg,.jpeg,.png",
    guideUrl: "https://www.efax.co.kr/fax/guide/telecom_certificate",
  },
  {
    id: "delegation",
    label: "위임장",
    description: "대리 신청 시 필요 (위임장 양식을 다운로드하여 작성)",
    required: true,
    file: null,
    accept: ".pdf,.jpg,.jpeg,.png,.docx,.doc",
  },
  {
    id: "identity-proof",
    label: "대표자 신분증 또는 재직증명서",
    description: "대표자 신분증 사본 또는 재직증명서 중 택 1",
    required: true,
    file: null,
    accept: ".pdf,.jpg,.jpeg,.png",
  },
];

const MAX_CALLING_NUMBERS = 15;

function buildBasicChangeCandidates(
  validNumbers: CallingNumber[],
  currentDefault: CallingNumber | null,
  max: number,
): CallingNumber[] {
  const seen = new Set<number>();
  const out: CallingNumber[] = [];
  const add = (n: CallingNumber) => {
    if (out.length >= max || seen.has(n.id)) return;
    seen.add(n.id);
    out.push(n);
  };
  if (currentDefault?.status === "정상") add(currentDefault);
  for (const n of validNumbers) add(n);
  return out;
}

export default function CallingNumberListPage() {
  const navigate = useNavigate();
  const [callingNumbers, setCallingNumbers] =
    useState<CallingNumber[]>(MOCK_CALLING_NUMBERS);
  const [defaultNumber, setDefaultNumber] = useState<CallingNumber | null>(
    callingNumbers.find((n) => n.status === "정상") ?? null,
  );

  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const validNumbers = callingNumbers.filter((n) => n.status === "정상");
  const pendingCount = callingNumbers.filter(
    (n) => n.status === "검수중",
  ).length;
  const activeCount = validNumbers.length;
  const potentialCount = activeCount + pendingCount;
  const availableCount = Math.max(0, MAX_CALLING_NUMBERS - potentialCount);
  const canRegister = potentialCount < MAX_CALLING_NUMBERS;
  const usagePercent = Math.min(100, (activeCount / MAX_CALLING_NUMBERS) * 100);
  const potentialPercent = Math.min(
    100,
    (potentialCount / MAX_CALLING_NUMBERS) * 100,
  );

  const getUsageColor = () => {
    if (potentialCount >= MAX_CALLING_NUMBERS) return "red";
    return "blue";
  };
  const usageColor = getUsageColor();

  const basicChangeCandidates = buildBasicChangeCandidates(
    validNumbers,
    defaultNumber,
    MAX_CALLING_NUMBERS,
  );

  const handleOpenChangeModal = () => {
    setSelectedId(defaultNumber?.id ?? null);
    setIsChangeModalOpen(true);
  };

  const handleConfirmChange = () => {
    if (selectedId === null) return;
    const next = basicChangeCandidates.find((n) => n.id === selectedId) ?? null;
    setDefaultNumber(next);
    setIsChangeModalOpen(false);
    toast.success("기본 발신번호가 변경되었습니다.");
  };

  const [detailItem, setDetailItem] = useState<CallingNumber | null>(null);

  const handleDetail = (item: CallingNumber) => {
    setDetailItem(item);
  };

  const handleDownloadAttachment = (fileName: string) => {
    toast.info(`${fileName} 다운로드`);
  };

  // 선택 삭제 관련
  const [selectedItems, setSelectedItems] = useState<CallingNumber[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const DELETE_CONFIRM_TEXT = "삭제된 발신번호는 복구할 수 없습니다.";
  const isDeleteConfirmed = deleteConfirmInput === DELETE_CONFIRM_TEXT;

  const handleSelectionChange = useCallback((items: CallingNumber[]) => {
    setSelectedItems(items);
  }, []);

  const handleUsageEnabledChange = useCallback(
    (item: CallingNumber, enabled: boolean) => {
      setCallingNumbers((prev) =>
        prev.map((n) =>
          n.id === item.id ? { ...n, usageEnabled: enabled } : n,
        ),
      );
      setDefaultNumber((prev) =>
        prev?.id === item.id ? { ...prev, usageEnabled: enabled } : prev,
      );
      setDetailItem((prev) =>
        prev?.id === item.id ? { ...prev, usageEnabled: enabled } : prev,
      );
      toast.success(
        enabled
          ? "해당 번호를 발송에 사용하도록 설정했습니다."
          : "해당 번호의 발송 사용을 해제했습니다.",
      );
    },
    [],
  );

  const handleOpenDeleteModal = useCallback(() => {
    if (selectedItems.length === 0) return;
    setDeleteConfirmInput("");
    setIsDeleteModalOpen(true);
  }, [selectedItems]);

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmInput("");
  };

  const handleConfirmDelete = () => {
    if (!isDeleteConfirmed) return;
    toast.success(`${selectedItems.length}건의 발신번호가 삭제되었습니다.`);
    handleCloseDeleteModal();
    setSelectedItems([]);
  };

  // 인증 갱신 / 재인증 통합 모달
  const [renewTarget, setRenewTarget] = useState<CallingNumber | null>(null);
  const isReAuth = renewTarget?.status === "반려";
  const [renewAttachments, setRenewAttachments] = useState<RenewAttachment[]>(
    createRenewAttachments,
  );
  const [renewNote, setRenewNote] = useState("");
  const RENEW_NOTE_MAX = 500;
  const renewFileInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  const handleReAuth = (item: CallingNumber) => {
    setRenewTarget(item);
    setRenewAttachments(createRenewAttachments());
    setRenewNote("");
  };

  const handleRenew = (item: CallingNumber) => {
    setRenewTarget(item);
    setRenewAttachments(
      createRenewAttachments().filter((a) => a.id === "telecom-certificate"),
    );
    setRenewNote("");
  };

  const handleCloseRenewModal = () => {
    setRenewTarget(null);
    setRenewAttachments(createRenewAttachments());
    setRenewNote("");
  };

  const handleRenewFileAttach = (
    attachmentId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(
        "허용되지 않은 파일 형식입니다. (PDF, JPG, PNG, DOCX, DOC만 가능)",
      );
      event.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`파일 크기는 ${MAX_FILE_SIZE_MB}MB 이하만 가능합니다.`);
      event.target.value = "";
      return;
    }

    setRenewAttachments((prev) =>
      prev.map((a) => (a.id === attachmentId ? { ...a, file } : a)),
    );
  };

  const handleRenewRemoveFile = (attachmentId: string) => {
    setRenewAttachments((prev) =>
      prev.map((a) => (a.id === attachmentId ? { ...a, file: null } : a)),
    );
    const input = renewFileInputRefs.current[attachmentId];
    if (input) input.value = "";
  };

  const handleDownloadDelegationSample = () => {
    const content = `위 임 장

위임인 (신청 법인)
- 법인명:
- 사업자등록번호:
- 대표자명:

수임인 (대리 신청자)
- 성명:
- 연락처:
- 소속/직위:

위임 내용: 발신번호 등록 및 인증 신청에 관한 일체의 권한을 위임합니다.

위임일:       년     월     일

위임인 (인)
수임인 (인)`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    downloadBlobAsFile(blob, "위임장_양식.txt");
    toast.success("위임장 샘플을 다운로드했습니다.");
  };

  const isRenewFormValid = renewAttachments
    .filter((a) => a.required)
    .every((a) => a.file !== null);

  const handleSubmitRenew = () => {
    if (!renewTarget || !isRenewFormValid) return;
    const action = isReAuth ? "재인증" : "인증 갱신";
    toast.success(
      `${renewTarget.phoneNumber} ${action}이 접수되었습니다. 검수 후 결과를 안내드립니다.`,
    );
    handleCloseRenewModal();
  };

  // ActionBar용 임시 table (DataTableActionBar에 table 전달 필요)
  const { table: actionBarTable } = useDataTable({
    data: selectedItems,
    columns: [],
    pageCount: 1,
    getRowId: (row) => String(row.id),
  });

  return (
    <section className="mx-auto w-[1200px] rounded-xl px-8 pb-[30px]">
      <h1 className="font-apple-ultra py-10 text-center text-[32px] leading-[45px] text-[#1B1D21]">
        발신번호 관리
      </h1>

      {/* 기본 발신번호 + 사용량 통합 카드 */}
      {/* <div className="mb-4 flex items-center justify-between">
        <h2 className="font-apple-medium text-[20px] text-gray-800">
          기본 발신번호
        </h2>
      </div> */}
      <div className="mb-12 rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* 기본번호 정보 */}

        <div className="flex flex-row justify-between gap-4 px-8 pt-6 pb-5">
          {defaultNumber ? (
            <div className="flex items-center gap-6">
              <div className="bg-primary-50 text-primary-500 flex h-12 w-12 items-center justify-center rounded-full">
                <PhoneIcon className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-apple-medium text-[16px] text-gray-600">
                  기본 발신번호
                </h2>
                <div className="flex flex-row items-baseline gap-2">
                  <span className="font-apple-bold text-[22px] leading-tight tracking-wide text-gray-900">
                    {defaultNumber.phoneNumber}
                  </span>
                  <span className="font-apple-light text-[14px] text-gray-500">
                    {defaultNumber.name}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-gray-500">
              <PhoneIcon className="size-6" />
              <span className="text-[14px] text-gray-500">
                발신번호가 없습니다. 발신번호를 신청해주세요.
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {defaultNumber && (
              <Button
                type="button"
                variant="outline"
                className="font-apple-medium h-[40px] rounded px-4 text-[14px] text-gray-700"
                onClick={handleOpenChangeModal}
                disabled={validNumbers.length === 0}
              >
                기본번호 변경
              </Button>
            )}
            <Button
              type="button"
              onClick={() => navigate("/messaging/calling-number/register")}
              disabled={!canRegister}
              title={
                !canRegister
                  ? "검수중인 건을 포함하여 최대 15개까지 등록 가능합니다."
                  : undefined
              }
              className="h-[40px]"
            >
              발신번호 신청
            </Button>
          </div>
        </div>

        {/* 사용량 */}
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
                  / {MAX_CALLING_NUMBERS}
                </span>
              </div>

              <Separator orientation="vertical" className="h-4! bg-gray-200" />

              <div className="flex items-baseline gap-1.5">
                <span className="font-apple-medium text-[13px] text-gray-500">
                  검수중
                </span>
                <span className="font-apple-medium text-[14px] leading-none text-blue-500">
                  {pendingCount}건
                </span>
              </div>

              <Separator orientation="vertical" className="h-4! bg-gray-200" />

              <div className="flex items-baseline gap-1.5">
                <span className="font-apple-medium text-[13px] text-gray-500">
                  신청 가능
                </span>
                <span
                  className={`font-apple-medium text-[14px] leading-none ${
                    availableCount === 0 ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {availableCount}건
                </span>
              </div>
            </div>

            {pendingCount > 0 && (
              <p className="font-apple-light text-[11px] text-gray-500">
                검수 통과 시 정상으로 전환 (정상 + 검수중 합산 최대{" "}
                {MAX_CALLING_NUMBERS}개)
              </p>
            )}
          </div>

          {/* 프로그레스 바 */}
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="relative h-full">
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                  usageColor === "red"
                    ? "bg-red-200"
                    : usageColor === "blue"
                      ? "bg-orange-200"
                      : "bg-blue-200"
                }`}
                style={{ width: `${potentialPercent}%` }}
              />
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                  usageColor === "red"
                    ? "bg-red-500"
                    : usageColor === "blue"
                      ? "bg-orange-400"
                      : "bg-primary-500"
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 발신번호 목록 */}
      <div>
        {/* 사용량 */}
        <h2 className="font-apple-medium mb-4 text-[20px] text-gray-800">
          발신번호 목록
        </h2>

        <CallingNumberTable
          data={callingNumbers}
          onDetail={handleDetail}
          onReAuth={handleReAuth}
          onRenew={handleRenew}
          onSelectionChange={handleSelectionChange}
          onUsageEnabledChange={handleUsageEnabledChange}
          actionBar={
            <DataTableActionBar
              table={actionBarTable}
              visible={selectedItems.length > 0}
            >
              <DataTableActionBarSelection table={actionBarTable} />
              <Separator
                orientation="vertical"
                className="hidden data-[orientation=vertical]:h-5 sm:block"
              />
              <DataTableActionBarAction
                size="icon"
                tooltip="선택 삭제"
                onClick={handleOpenDeleteModal}
              >
                <Trash2Icon />
              </DataTableActionBarAction>
            </DataTableActionBar>
          }
        />
      </div>

      {/* 기본번호 변경 모달 */}
      <Dialog
        open={isChangeModalOpen}
        onOpenChange={(open) => !open && setIsChangeModalOpen(false)}
      >
        <DialogContent
          className="max-h-[90vh] w-[520px] overflow-y-auto p-0"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>기본 발신번호 변경</DialogTitle>
          </DialogHeader>

          <div className="px-8 pt-2 pb-4">
            <p className="font-apple-light mb-3 text-[13px] text-gray-500">
              인증 상태가 <span className="text-green-600">정상</span>인
              발신번호만 기본번호로 설정할 수 있습니다.
              {/* 아래 목록에서 최대{" "}{MAX_CALLING_NUMBERS}건까지 선택할 수 있습니다. */}
            </p>

            {basicChangeCandidates.length > 0 && (
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-apple-medium text-[12px] text-gray-500">
                  선택 가능 {basicChangeCandidates.length}건
                </span>
                {validNumbers.length > MAX_CALLING_NUMBERS && (
                  <span className="font-apple-light text-[11px] text-amber-600">
                    정상 번호가 {MAX_CALLING_NUMBERS}건을 초과합니다. 현재 기본
                    번호와 우선 {MAX_CALLING_NUMBERS}건만 표시됩니다.
                  </span>
                )}
              </div>
            )}

            {basicChangeCandidates.length === 0 ? (
              <div className="flex h-[120px] items-center justify-center rounded-lg border border-dashed border-gray-200 text-[14px] text-gray-500">
                선택 가능한 발신번호가 없습니다.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50/60">
                <ul
                  className="flex max-h-[min(960px,58vh)] flex-col gap-2 overflow-y-auto p-2 [scrollbar-gutter:stable]"
                  role="listbox"
                  aria-label="기본 발신번호 선택"
                >
                  {basicChangeCandidates.map((item) => {
                    const isSelected = selectedId === item.id;
                    const isCurrent = defaultNumber?.id === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => setSelectedId(item.id)}
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
                              {item.name}
                            </span>
                          </div>

                          {isCurrent && (
                            <Badge
                              variant="outline"
                              className="border-primary-200 bg-primary-50 text-primary-500 shrink-0 text-[11px]"
                            >
                              현재 기본번호
                            </Badge>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter className="px-8 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsChangeModalOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleConfirmChange}
              disabled={selectedId === null || selectedId === defaultNumber?.id}
            >
              변경하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 상세보기 모달 */}
      <Dialog
        open={detailItem !== null}
        onOpenChange={(open) => !open && setDetailItem(null)}
      >
        <DialogContent className="max-w-[600px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>발신번호 상세</DialogTitle>
          </DialogHeader>

          {detailItem && (
            <div className="px-8 py-6">
              <div className="space-y-3">
                <DetailRow label="발신번호" value={detailItem.phoneNumber} />
                <DetailRow label="발신번호명" value={detailItem.name} />
                <DetailRow
                  label="등록일"
                  value={format(
                    new Date(detailItem.registeredAt),
                    "yyyy.MM.dd",
                  )}
                />
                <DetailRow
                  label="인증만료일"
                  value={format(
                    new Date(detailItem.certExpiredAt),
                    "yyyy.MM.dd",
                  )}
                />
                <DetailRow
                  label="발송 사용"
                  value={
                    detailItem.status !== "정상"
                      ? "— (인증 정상 시 설정 가능)"
                      : detailItem.usageEnabled
                        ? "사용"
                        : "미사용"
                  }
                />
              </div>

              {detailItem.attachments && detailItem.attachments.length > 0 && (
                <div className="mt-6">
                  <p className="font-apple-medium mb-3 text-[14px] text-gray-700">
                    첨부 서류
                  </p>
                  <div className="space-y-2">
                    {detailItem.attachments.map((attachment) => (
                      <div
                        key={attachment.fileName}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <FileTextIcon className="size-4 shrink-0 text-gray-500" />
                          <div className="min-w-0">
                            <p className="font-apple-medium truncate text-[13px] text-gray-700">
                              {attachment.label}
                            </p>
                            <p className="font-apple-light truncate text-[12px] text-gray-500">
                              {attachment.fileName}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7 shrink-0 px-2.5 text-[12px] text-gray-500 hover:text-gray-700"
                          onClick={() =>
                            handleDownloadAttachment(attachment.fileName)
                          }
                        >
                          <DownloadIcon className="size-3.5" />
                          다운로드
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              <DialogFooter className="mt-8 flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDetailItem(null)}
                >
                  닫기
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 선택 삭제 확인 모달 */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => !open && handleCloseDeleteModal()}
      >
        <DialogContent className="w-[520px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>발신번호 삭제</DialogTitle>
          </DialogHeader>

          <div className="px-8 py-6">
            <p className="font-apple-light text-[14px] leading-6 text-gray-700">
              선택한{" "}
              <span className="font-apple-medium">
                {selectedItems.length}건
              </span>
              의 발신번호를 삭제하시겠습니까?
            </p>

            {selectedItems.length <= 5 && (
              <ul className="mt-3 space-y-1">
                {selectedItems.map((item) => (
                  <li
                    key={item.id}
                    className="font-apple-light text-[13px] text-gray-500"
                  >
                    • {item.phoneNumber} ({item.name})
                  </li>
                ))}
              </ul>
            )}

            <p className="font-apple-light mt-3 text-[13px] leading-5 text-gray-500">
              삭제된 발신번호는 복구할 수 없으며, 해당 번호로는 더 이상 메시지를
              발송할 수 없습니다.
            </p>

            <div className="mt-5 space-y-2">
              <Label
                htmlFor="delete-confirm-input"
                className="font-apple-medium text-[13px] text-gray-600"
              >
                아래 문구를 정확히 입력해주세요.
              </Label>
              <p className="font-apple-light rounded border border-red-100 bg-red-50/50 px-3 py-2 text-[13px] leading-5 text-red-500 select-none">
                {DELETE_CONFIRM_TEXT}
              </p>
              <Input
                id="delete-confirm-input"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder="위 문구를 입력해주세요"
                className="h-[42px] text-[13px]"
              />
            </div>

            <DialogFooter className="mt-6 flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDeleteModal}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                onClick={handleConfirmDelete}
                disabled={!isDeleteConfirmed}
              >
                {selectedItems.length}건 삭제
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 인증 갱신 / 재인증 통합 모달 */}
      <Dialog
        open={renewTarget !== null}
        onOpenChange={(open) => !open && handleCloseRenewModal()}
      >
        <DialogContent
          className="max-h-[85vh] max-w-[640px] overflow-y-auto p-0"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>
              {isReAuth ? "재인증 신청" : "인증 갱신 신청"}
            </DialogTitle>
          </DialogHeader>

          {renewTarget && (
            <div className="px-8 py-6">
              {/* 반려 사유 (재인증 시에만 표시) */}
              {isReAuth && renewTarget.rejectReason && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50/60 px-5 py-4">
                  <p className="font-apple-medium mb-1.5 text-[13px] text-red-600">
                    반려 사유
                  </p>
                  <p className="font-apple-light text-[13px] leading-5 whitespace-pre-wrap text-red-500">
                    {renewTarget.rejectReason}
                  </p>
                </div>
              )}

              {/* 발신번호 정보 (읽기전용) */}
              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-[14px]">
                    <span className="font-apple-medium w-[100px] shrink-0 text-gray-500">
                      발신번호
                    </span>
                    <span className="font-apple-medium text-gray-900">
                      {renewTarget.phoneNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[14px]">
                    <span className="font-apple-medium w-[100px] shrink-0 text-gray-500">
                      발신번호명
                    </span>
                    <span className="font-apple-light text-gray-800">
                      {renewTarget.name}
                    </span>
                  </div>
                  {!isReAuth && (
                    <div className="flex items-center gap-4 text-[14px]">
                      <span className="font-apple-medium w-[100px] shrink-0 text-gray-500">
                        인증만료일
                      </span>
                      <span className="font-apple-light text-red-500">
                        {format(
                          new Date(renewTarget.certExpiredAt),
                          "yyyy.MM.dd",
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 첨부 서류 */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-apple-medium text-[15px] text-gray-800">
                    첨부 서류
                  </h3>
                  {isReAuth && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-7 px-2.5 text-[12px] text-gray-500"
                      onClick={handleDownloadDelegationSample}
                    >
                      <DownloadIcon className="mr-1 size-3.5" />
                      위임장 샘플 다운로드
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {renewAttachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-apple-medium text-[13px] text-gray-700">
                              {attachment.label}
                            </span>
                            {attachment.required && (
                              <span className="text-[11px] text-red-500">
                                *
                              </span>
                            )}
                            {attachment.guideUrl && (
                              <a
                                href={attachment.guideUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 inline-flex items-center gap-0.5 text-[11px] text-blue-500 hover:text-blue-600 hover:underline"
                              >
                                발급방법
                                <ExternalLinkIcon className="size-3" />
                              </a>
                            )}
                          </div>
                          <p className="font-apple-light mt-0.5 text-[12px] text-gray-500">
                            {attachment.description}
                          </p>
                        </div>
                      </div>

                      {attachment.file ? (
                        <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50/50 px-3 py-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <CheckCircle2Icon className="size-4 shrink-0 text-green-500" />
                            <span className="font-apple-light min-w-0 truncate text-[13px] text-gray-700">
                              {attachment.file.name}
                            </span>
                            <span className="font-apple-light shrink-0 text-[11px] text-gray-500">
                              ({(attachment.file.size / 1024 / 1024).toFixed(1)}
                              MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-6 px-2 text-[12px] text-red-400 hover:text-red-500"
                            onClick={() => handleRenewRemoveFile(attachment.id)}
                          >
                            삭제
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50/50 px-3 py-3 text-[13px] text-gray-500 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-gray-500"
                          onClick={() =>
                            renewFileInputRefs.current[attachment.id]?.click()
                          }
                        >
                          <UploadIcon className="size-4" />
                          파일 선택
                        </button>
                      )}
                      <input
                        ref={(el) => {
                          renewFileInputRefs.current[attachment.id] = el;
                        }}
                        type="file"
                        className="hidden"
                        accept={attachment.accept}
                        onChange={(e) =>
                          handleRenewFileAttach(attachment.id, e)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 요청 내용 */}
              <div className="mb-6">
                <Label className="font-apple-medium mb-2 block text-[15px] text-gray-800">
                  요청 내용{" "}
                  <span className="font-apple-light text-[12px] text-gray-500">
                    (선택)
                  </span>
                </Label>
                <Textarea
                  placeholder={
                    isReAuth
                      ? "반려 사유에 대한 보완 설명이나 추가 요청 사항을 입력해주세요."
                      : "인증 갱신과 관련하여 추가 요청 사항이 있으면 입력해주세요."
                  }
                  value={renewNote}
                  onChange={(e) => {
                    if (e.target.value.length <= RENEW_NOTE_MAX) {
                      setRenewNote(e.target.value);
                    }
                  }}
                  className="min-h-[100px] resize-none text-[13px]"
                />
                <p className="font-apple-light mt-1 text-right text-[12px] text-gray-500">
                  {renewNote.length}/{RENEW_NOTE_MAX}
                </p>
              </div>

              <DialogFooter className="flex-row justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseRenewModal}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitRenew}
                  disabled={!isRenewFormValid}
                >
                  {isReAuth ? "재인증 신청" : "인증 갱신 신청"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
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
