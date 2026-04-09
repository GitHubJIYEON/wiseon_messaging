import { useMemo, useRef, useState } from "react";
import { BuildingIcon, SearchIcon, WalletIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import AdminPriceChargeHistoryTable from "@/features/messaging/components/adminPayment/AdminPriceChargeHistoryTable";
import {
  CHARGE_MESSAGE_TYPES,
  MOCK_PRICE_CHARGE_REQUESTS,
  PRICE_CHARGE_UNITS,
  type ChargeMessageType,
  type PriceChargeRequest,
  type PriceChargeUnit,
} from "@/features/messaging/components/adminPayment/priceChargeData";
import { MOCK_ORGANIZATIONS } from "@/features/messaging/components/project/projectData";
import type { Organization } from "@/features/messaging/components/project/projectData";
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

const NOTE_MAX = 500;
const MAX_CHARGE_UNITS = 1_000;

type ChargeUnitMode = PriceChargeUnit | "custom" | null;

interface CreateProjectForm {
  projectName: string;
  projectDesc: string;
  organizationId: string;
  useSms: boolean;
  useKkoBizMsg: boolean;
}

const INITIAL_FORM: CreateProjectForm = {
  projectName: "",
  projectDesc: "",
  organizationId: "",
  useSms: false,
  useKkoBizMsg: false,
};
function getResolvedUnits(
  mode: ChargeUnitMode,
  customRaw: string,
): number | null {
  if (mode === null) return null;
  if (mode !== "custom") return mode;
  const trimmed = customRaw.trim();
  if (trimmed === "") return null;
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < 1 || n > MAX_CHARGE_UNITS) return null;
  return n;
}

export default function AdminPriceChargePage() {
  const [requests, setRequests] = useState<PriceChargeRequest[]>(
    MOCK_PRICE_CHARGE_REQUESTS,
  );

  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [chargeMessageType, setChargeMessageType] =
    useState<ChargeMessageType | null>(null);
  const [chargeUnitMode, setChargeUnitMode] = useState<ChargeUnitMode>(null);
  const [customUnits, setCustomUnits] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [chargeNote, setChargeNote] = useState("");

  // 기관 검색
  const [createForm, setCreateForm] = useState<CreateProjectForm>(INITIAL_FORM);
  const [orgSearchInput, setOrgSearchInput] = useState("");
  const orgInputRef = useRef<HTMLInputElement>(null);

  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const selectedOrg: Organization | undefined = useMemo(
    () =>
      MOCK_ORGANIZATIONS.find(
        (o) => o.organizationId === createForm.organizationId,
      ),
    [createForm.organizationId],
  );

  const resolvedUnits = getResolvedUnits(chargeUnitMode, customUnits);

  const filteredOrgs = useMemo(() => {
    const keyword = orgSearchInput.trim().toLowerCase();
    if (!keyword) return MOCK_ORGANIZATIONS;
    return MOCK_ORGANIZATIONS.filter(
      (o) =>
        o.organizationName.toLowerCase().includes(keyword) ||
        o.organizationType.toLowerCase().includes(keyword),
    );
  }, [orgSearchInput]);

  const handleSelectOrg = (org: Organization) => {
    setCreateForm((prev) => ({ ...prev, organizationId: org.organizationId }));
    setOrgSearchInput("");
    setIsOrgDropdownOpen(false);
  };

  const handleClearOrg = () => {
    setCreateForm((prev) => ({ ...prev, organizationId: "" }));
    setOrgSearchInput("");
    setTimeout(() => orgInputRef.current?.focus(), 0);
  };

  const openChargeModal = () => {
    setChargeMessageType(null);
    setChargeUnitMode(null);
    setCustomUnits("");
    setApplicantName("");
    setChargeNote("");
    setCreateForm(INITIAL_FORM);
    setOrgSearchInput("");
    setIsOrgDropdownOpen(false);
    setIsChargeModalOpen(true);
  };

  const closeChargeModal = () => {
    setIsChargeModalOpen(false);
  };

  const isChargeFormValid =
    chargeMessageType !== null &&
    resolvedUnits !== null &&
    createForm.organizationId !== "" &&
    applicantName.trim().length > 0;

  const handleSubmitCharge = () => {
    if (
      !isChargeFormValid ||
      resolvedUnits === null ||
      !selectedOrg ||
      chargeMessageType === null
    )
      return;
    const now = new Date().toISOString();
    const newItem: PriceChargeRequest = {
      id: `chg-${Date.now()}`,
      requestedAt: now,
      messageType: chargeMessageType,
      units: resolvedUnits,
      status: "대기",
      organizationName: selectedOrg.organizationName,
      applicantName: applicantName.trim(),
      ...(chargeNote.trim() ? { requestNote: chargeNote.trim() } : {}),
    };
    setRequests((prev) => [newItem, ...prev]);
    toast.success(
      `${selectedOrg.organizationName} · ${newItem.applicantName}님의 충전 신청(${resolvedUnits}건)이 접수되었습니다.`,
    );
    closeChargeModal();
  };

  const handlePresetMode = (u: PriceChargeUnit) => {
    setChargeUnitMode(u);
    setCustomUnits("");
  };

  const handleCustomMode = () => {
    setChargeUnitMode("custom");
  };

  const handleCustomUnitsChange = (value: string) => {
    if (value !== "" && !/^\d+$/.test(value)) return;
    setCustomUnits(value);
  };
  const totalCount = requests.length;
  const completedCount = requests.filter((r) => r.status === "완료").length;
  const pendingCount = requests.filter((r) => r.status === "대기").length;

  const completedPercent =
    totalCount === 0 ? 0 : Math.min(100, (completedCount / totalCount) * 100);
  const pipelinePercent =
    totalCount === 0
      ? 0
      : Math.min(100, ((completedCount + pendingCount) / totalCount) * 100);

  return (
    <section className="mx-auto w-[1200px] rounded-xl px-8 pb-[30px]">
      <h1 className="font-apple-ultra py-10 text-center text-[32px] leading-[45px] text-[#1B1D21]">
        충전 관리
      </h1>

      {/* 충전 신청 현황 카드 */}
      <div className="mb-12 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-row justify-between gap-4 px-8 pt-6 pb-5">
          <div className="flex items-center gap-6">
            <div className="bg-primary-50 text-primary-500 flex h-12 w-12 items-center justify-center rounded-full">
              <WalletIcon className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-apple-medium text-[16px] text-gray-600">
                충전 신청 현황
              </h2>
              <p className="font-apple-light text-[14px] text-gray-500">
                대기: 사용자 충전 신청함 / 취소: 사용자 충전 취소함 / 완료:
                관리자 충전 완료함 관리자 최종 충전함
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={openChargeModal}
              className="h-[40px]"
            >
              충전하기
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-100 px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-baseline gap-1.5">
                <span className="font-apple-medium text-[13px] text-gray-500">
                  충전 총 건수
                </span>
                <span className="font-apple-bold text-primary-500 text-[18px] leading-none">
                  {totalCount}
                </span>
                <span className="font-apple-light text-[13px] text-gray-500">
                  건
                </span>
              </div>

              <Separator orientation="vertical" className="h-4! bg-gray-200" />

              <div className="flex items-baseline gap-1.5">
                <span className="font-apple-medium text-[13px] text-gray-500">
                  충전 완료
                </span>
                <span className="font-apple-bold text-[18px] leading-none text-green-600">
                  {completedCount}
                </span>
                <span className="font-apple-light text-[13px] text-gray-500">
                  건
                </span>
              </div>

              <Separator orientation="vertical" className="h-4! bg-gray-200" />

              <div className="flex items-baseline gap-1.5">
                <span className="font-apple-medium text-[13px] text-gray-500">
                  신청 대기
                </span>
                <span className="font-apple-medium text-[14px] leading-none text-blue-500">
                  {pendingCount}건
                </span>
              </div>
            </div>

            {pendingCount > 0 && (
              <p className="font-apple-light text-[11px] text-gray-500">
                입금 확인 후 충전 완료로 전환됩니다.
              </p>
            )}
          </div>

          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="relative h-full">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-orange-200 transition-all"
                style={{ width: `${pipelinePercent}%` }}
              />
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-orange-400 transition-all"
                style={{ width: `${completedPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 신청 현황 테이블 - 신청자, 신청일, 승인일,  */}
      <div>
        <h2 className="font-apple-medium mb-4 text-[20px] text-gray-800">
          충전 내역
        </h2>

        <AdminPriceChargeHistoryTable data={requests} />
      </div>

      <Dialog
        open={isChargeModalOpen}
        onOpenChange={(open) => !open && closeChargeModal()}
      >
        <DialogContent
          className="max-h-[90vh] w-[520px] overflow-y-auto p-0"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>요금 충전 신청</DialogTitle>
          </DialogHeader>

          <div className="px-8 pt-2 pb-4">
            <Label className="font-apple-medium mb-2 block text-[14px] text-gray-800">
              발송 유형 <span className="text-red-500">*</span>
            </Label>
            <p className="font-apple-light mb-3 text-[12px] text-gray-500">
              충전 요청할 메시지 유형을 선택하세요.
            </p>
            <ul
              className="mb-6 grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="발송 유형"
            >
              {CHARGE_MESSAGE_TYPES.map((t) => {
                const selected = chargeMessageType === t;
                return (
                  <li key={t} className="min-w-0">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setChargeMessageType(t)}
                      className={`flex w-full min-w-0 items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        selected
                          ? "bg-primary-50 border-primary-200"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected ? "border-primary-500" : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <span className="bg-primary-500 size-2 rounded-full" />
                        )}
                      </span>
                      <span className="font-apple-medium truncate text-[14px] text-gray-900">
                        {t}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <Label className="font-apple-medium mb-2 block text-[14px] text-gray-800">
              충전 건수 <span className="text-red-500">*</span>
            </Label>
            <p className="font-apple-light mb-3 text-[12px] text-gray-500">
              아래에서 건수를 선택하세요. 직접 입력을 선택한 뒤 숫자를
              입력합니다.
            </p>
            <ul
              className="mb-5 flex flex-col gap-2"
              role="radiogroup"
              aria-label="충전 건수"
            >
              {PRICE_CHARGE_UNITS.map((u) => {
                const selected = chargeUnitMode === u;
                return (
                  <li key={u}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => handlePresetMode(u)}
                      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                        selected
                          ? "bg-primary-50 border-primary-200"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected ? "border-primary-500" : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <span className="bg-primary-500 h-2.5 w-2.5 rounded-full" />
                        )}
                      </span>
                      <span className="font-apple-medium text-[15px] text-gray-900">
                        {u}건
                      </span>
                    </button>
                  </li>
                );
              })}
              <li>
                <div
                  className={`overflow-hidden rounded-lg border transition-colors ${
                    chargeUnitMode === "custom"
                      ? "border-primary-200 bg-primary-50/40"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={chargeUnitMode === "custom"}
                    onClick={handleCustomMode}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/80"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        chargeUnitMode === "custom"
                          ? "border-primary-500"
                          : "border-gray-300"
                      }`}
                    >
                      {chargeUnitMode === "custom" && (
                        <span className="bg-primary-500 h-2.5 w-2.5 rounded-full" />
                      )}
                    </span>
                    <span className="font-apple-medium text-[15px] text-gray-900">
                      직접 입력
                    </span>
                  </button>
                  {chargeUnitMode === "custom" && (
                    <div className="space-y-2 border-t border-gray-200 px-4 py-3">
                      <Label
                        htmlFor="charge-units-custom"
                        className="font-apple-medium text-[13px] text-gray-700"
                      >
                        건수 입력
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="charge-units-custom"
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="예: 250"
                          value={customUnits}
                          onChange={(e) =>
                            handleCustomUnitsChange(e.target.value)
                          }
                          onFocus={handleCustomMode}
                          className="h-[42px] text-[13px]"
                        />
                        <span className="font-apple-light shrink-0 text-[13px] text-gray-500">
                          건
                        </span>
                      </div>
                      <p className="font-apple-light text-[11px] text-gray-400">
                        1건 이상 {MAX_CHARGE_UNITS.toLocaleString()}건 이하,
                        숫자만 입력
                      </p>
                    </div>
                  )}
                </div>
              </li>
            </ul>

            {/* 기관 검색 */}
            <div className="mb-5">
              <Label
                htmlFor="org-search"
                className="font-apple-medium mb-1.5 block text-[14px] text-gray-700"
              >
                기관
                <span className="ml-1 text-red-500">*</span>
              </Label>

              {selectedOrg ? (
                /* 선택된 기관 표시 */
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <BuildingIcon className="size-4 shrink-0 text-gray-400" />
                    <div>
                      <p className="font-apple-medium text-[13px] text-gray-900">
                        {selectedOrg.organizationName}
                      </p>
                      <p className="font-apple-light text-[12px] text-gray-400">
                        {selectedOrg.organizationType}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearOrg}
                    className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    aria-label="기관 선택 해제"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
              ) : (
                /* 기관 검색 입력 + 드롭다운 */
                <div className="relative">
                  <div className="relative">
                    <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="org-search"
                      ref={orgInputRef}
                      value={orgSearchInput}
                      onChange={(e) => {
                        setOrgSearchInput(e.target.value);
                        setIsOrgDropdownOpen(true);
                      }}
                      onFocus={() => setIsOrgDropdownOpen(true)}
                      onBlur={() =>
                        setTimeout(() => setIsOrgDropdownOpen(false), 150)
                      }
                      placeholder="기관명을 검색하세요"
                      className="h-[42px] pl-9 text-[13px]"
                      autoComplete="off"
                    />
                  </div>

                  {isOrgDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                      {filteredOrgs.length === 0 ? (
                        <p className="font-apple-light px-4 py-3 text-[13px] text-gray-400">
                          검색 결과가 없습니다.
                        </p>
                      ) : (
                        <ul className="max-h-[220px] overflow-y-auto py-1">
                          {filteredOrgs.map((org) => (
                            <li key={org.organizationId}>
                              <button
                                type="button"
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
                                onMouseDown={() => handleSelectOrg(org)}
                              >
                                <BuildingIcon className="size-4 shrink-0 text-gray-400" />
                                <div>
                                  <p className="font-apple-medium text-[13px] text-gray-800">
                                    {org.organizationName}
                                  </p>
                                  <p className="font-apple-light text-[12px] text-gray-400">
                                    {org.organizationType}
                                  </p>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-5 space-y-2">
              <Label
                htmlFor="charge-applicant"
                className="font-apple-medium text-[14px] text-gray-800"
              >
                신청자명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="charge-applicant"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="신청 담당자 이름"
                className="h-[42px] text-[13px]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="charge-note"
                className="font-apple-medium text-[14px] text-gray-800"
              >
                요청 내용{" "}
                <span className="font-apple-light text-[12px] text-gray-500">
                  (선택)
                </span>
              </Label>
              <Textarea
                id="charge-note"
                placeholder="충전과 관련한 메모가 있으면 입력해주세요."
                value={chargeNote}
                onChange={(e) => {
                  if (e.target.value.length <= NOTE_MAX) {
                    setChargeNote(e.target.value);
                  }
                }}
                className="min-h-[100px] resize-none text-[13px]"
              />
              <p className="font-apple-light text-right text-[12px] text-gray-500">
                {chargeNote.length}/{NOTE_MAX}
              </p>
            </div>
          </div>

          <DialogFooter className="px-8 pb-6">
            <Button type="button" variant="outline" onClick={closeChargeModal}>
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSubmitCharge}
              disabled={!isChargeFormValid}
            >
              신청하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
