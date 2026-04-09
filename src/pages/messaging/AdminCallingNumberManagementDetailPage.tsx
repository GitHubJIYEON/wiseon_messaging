import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { format } from "date-fns";
import {
  ArrowLeftIcon,
  Building2Icon,
  CheckCircle2Icon,
  CheckIcon,
  DownloadIcon,
  FileTextIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { AdminCallingNumber } from "@/features/messaging/components/callingNumber/adminCallingNumberData";
import { MOCK_ADMIN_CALLING_NUMBERS } from "@/features/messaging/components/callingNumber/adminCallingNumberData";
import type {
  CallingNumberAttachment,
  CallingNumberStatus,
} from "@/features/messaging/components/callingNumber/CallingNumberTable";
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
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";

const LIST_PATH = "/messaging/admin/calling-number-management";

const NAME_MAX = 50;
const REQUEST_NOTE_MAX = 500;
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".docx", ".doc"];

const STATUS_STYLE: Record<
  CallingNumberStatus,
  { label: string; className: string }
> = {
  검수중: {
    label: "검수중",
    className: "border-blue-200 bg-blue-50 text-blue-600",
  },
  정상: {
    label: "정상",
    className: "border-green-200 bg-green-50 text-green-600",
  },
  반려: { label: "반려", className: "border-red-200 bg-red-50 text-red-600" },
  만료: {
    label: "만료",
    className: "border-gray-200 bg-gray-100 text-gray-500",
  },
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return format(new Date(value), "yyyy.MM.dd");
};
const formatDateTime = (value?: string) => {
  if (!value) return "-";
  return format(new Date(value), "yyyy.MM.dd HH:mm:ss");
};

function toDatetimeLocalValue(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(s: string): string {
  if (!s.trim()) return new Date().toISOString();
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

type EditableAttachment = CallingNumberAttachment & { clientKey: string };

function attachmentsToEditable(
  list: CallingNumberAttachment[] | undefined,
): EditableAttachment[] {
  if (!list?.length) return [];
  return list.map((a, i) => ({
    ...a,
    clientKey: `${a.fileName}-${i}`,
  }));
}

function editableToAttachments(
  rows: EditableAttachment[],
): CallingNumberAttachment[] | undefined {
  const cleaned = rows
    .map((a) => ({ label: a.label, fileName: a.fileName }))
    .filter((a) => a.label.trim() && a.fileName.trim());
  return cleaned.length ? cleaned : undefined;
}

/** 반려 건 수정 화면: 고정 4종 서류 슬롯 */
const REQUIRED_REJECT_ATTACHMENT_LABELS = [
  "사업자 등록증",
  "통신 서비스 이용증명원",
  "위임장",
  "대표자 신분증 또는 재직증명서",
] as const;

function matchAttachmentToRejectSlotIndex(label: string): number | null {
  const t = label.trim();
  if (t.includes("사업자")) return 0;
  if (t.includes("통신") || t.includes("이용증명")) return 1;
  if (t.includes("위임")) return 2;
  if (t.includes("신분증") || t.includes("재직")) return 3;
  return null;
}

function buildRejectedEditableAttachments(
  list: CallingNumberAttachment[] | undefined,
): EditableAttachment[] {
  const slots: EditableAttachment[] = REQUIRED_REJECT_ATTACHMENT_LABELS.map(
    (label, i) => ({
      clientKey: `reject-slot-${i}`,
      label,
      fileName: "",
    }),
  );

  for (const att of list ?? []) {
    const idx = matchAttachmentToRejectSlotIndex(att.label);
    if (idx !== null && !slots[idx].fileName) {
      slots[idx] = { ...slots[idx], fileName: att.fileName };
      continue;
    }
    const emptyIdx = slots.findIndex((s) => !s.fileName);
    if (emptyIdx >= 0) {
      slots[emptyIdx] = { ...slots[emptyIdx], fileName: att.fileName };
    }
  }
  return slots;
}

function newAttachmentRow(): EditableAttachment {
  return {
    clientKey: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    label: "첨부 서류",
    fileName: "",
  };
}

interface EditForm {
  phoneNumber: string;
  name: string;
  registeredAt: string;
  certExpiredAt: string;
  inUse: boolean;
  requestNote: string;
  attachments: EditableAttachment[];
}

function buildEditForm(row: AdminCallingNumber): EditForm {
  return {
    phoneNumber: row.phoneNumber,
    name: row.name,
    registeredAt: row.registeredAt,
    certExpiredAt: row.certExpiredAt,
    inUse: row.inUse,
    requestNote: row.requestNote ?? "",
    attachments:
      row.status === "반려"
        ? buildRejectedEditableAttachments(row.attachments)
        : attachmentsToEditable(row.attachments),
  };
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-3 text-[14px]">
      <span className="font-apple-medium w-[160px] shrink-0 text-gray-500">
        {label}
      </span>
      <span className="font-apple-light break-all text-gray-800">{value}</span>
    </div>
  );
}

function EditRow({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-4 py-3 text-[14px]">
      <span className="font-apple-medium w-[160px] shrink-0 pt-0.5 text-gray-500">
        {label}
      </span>
      <div className="min-w-0 flex-1">
        {children}
        {hint && (
          <p className="font-apple-light mt-1 text-[12px] text-gray-400">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

function ReadOnlyRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-3 text-[14px]">
      <span className="font-apple-medium w-[160px] shrink-0 text-gray-400">
        {label}
      </span>
      <span className="font-apple-light break-all text-gray-400">{value}</span>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
        {icon && <span className="text-gray-500">{icon}</span>}
        <h3 className="font-apple-medium text-[15px] text-gray-800">{title}</h3>
      </div>
      <div className="divide-y divide-gray-100 px-6">{children}</div>
    </div>
  );
}

function CallingNumberNotFound() {
  const navigate = useNavigate();
  return (
    <section className="mx-auto flex w-[1200px] flex-col items-center gap-4 px-8 py-20">
      <p className="font-apple-medium text-[18px] text-gray-500">
        발신번호를 찾을 수 없습니다.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(LIST_PATH)}
      >
        <ArrowLeftIcon className="size-4" />
        목록으로 돌아가기
      </Button>
    </section>
  );
}

export default function AdminCallingNumberManagementDetailPage() {
  const navigate = useNavigate();
  const { callingNumberId } = useParams<{ callingNumberId: string }>();

  const baseItem = useMemo(
    () =>
      MOCK_ADMIN_CALLING_NUMBERS.find((n) => String(n.id) === callingNumberId),
    [callingNumberId],
  );

  const [savedOverride, setSavedOverride] = useState<AdminCallingNumber | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const REJECT_REASON_MAX = 500;

  const attachmentFileRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  useEffect(() => {
    setSavedOverride(null);
    setIsEditing(false);
    setEditForm(null);
  }, [callingNumberId]);

  const displayItem: AdminCallingNumber | null =
    baseItem && savedOverride && savedOverride.id === baseItem.id
      ? savedOverride
      : (baseItem ?? null);

  const handleDownloadAttachment = (fileName: string) => {
    toast.info(`${fileName} 다운로드`);
  };

  const handleApprove = (row: AdminCallingNumber) => {
    toast.success(
      `${row.phoneNumber} (${row.organizationName}) 발신번호가 승인되었습니다.`,
    );
    navigate(LIST_PATH);
  };

  const handleOpenRejectModal = () => {
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectReason("");
  };

  const handleSubmitReject = () => {
    if (!displayItem || !rejectReason.trim()) return;
    toast.success(
      `${displayItem.phoneNumber} (${displayItem.organizationName}) 발신번호가 반려되었습니다.`,
    );
    handleCloseRejectModal();
    navigate(LIST_PATH);
  };

  const handleStartEdit = () => {
    if (!displayItem) return;
    setEditForm(buildEditForm(displayItem));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const handleAttachmentFile = useCallback(
    (clientKey: string, e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(
          "허용되지 않은 파일 형식입니다. (PDF, JPG, PNG, DOCX, DOC만 가능)",
        );
        e.target.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`파일 크기는 ${MAX_FILE_SIZE_MB}MB 이하만 가능합니다.`);
        e.target.value = "";
        return;
      }
      setEditForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          attachments: prev.attachments.map((a) =>
            a.clientKey === clientKey ? { ...a, fileName: file.name } : a,
          ),
        };
      });
    },
    [],
  );

  const handleRemoveAttachmentRow = (clientKey: string) => {
    setEditForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        attachments: prev.attachments.filter((a) => a.clientKey !== clientKey),
      };
    });
  };

  const handleSubmitEdit = () => {
    if (!displayItem || !editForm) return;
    const phone = editForm.phoneNumber.trim();
    const name = editForm.name.trim();
    if (!phone) {
      toast.error("발신번호를 입력해주세요.");
      return;
    }
    if (!name) {
      toast.error("발신번호명을 입력해주세요.");
      return;
    }
    const atts = editableToAttachments(editForm.attachments);
    if (displayItem.status === "반려") {
      if (editForm.attachments.some((a) => !a.fileName.trim())) {
        toast.error(
          "반려 건은 필수 서류 4종을 모두 첨부한 뒤 저장할 수 있습니다.",
        );
        return;
      }
    } else if (
      editForm.attachments.length > 0 &&
      atts?.some((a) => !a.fileName.trim())
    ) {
      toast.error("첨부파일을 모두 선택하거나, 빈 행을 삭제해주세요.");
      return;
    }

    setSavedOverride({
      ...displayItem,
      phoneNumber: phone,
      name: name.slice(0, NAME_MAX),
      registeredAt: editForm.registeredAt,
      certExpiredAt: editForm.certExpiredAt,
      inUse: editForm.inUse,
      requestNote: editForm.requestNote.trim() || undefined,
      attachments: atts,
    });
    toast.success("발신번호 정보가 저장되었습니다.");
    setIsEditing(false);
    setEditForm(null);
  };

  const rejectAttachmentsComplete =
    !editForm ||
    !displayItem ||
    displayItem.status !== "반려" ||
    (editForm.attachments.length === REQUIRED_REJECT_ATTACHMENT_LABELS.length &&
      editForm.attachments.every((a) => a.fileName.trim()));

  const isEditFormValid = Boolean(
    editForm &&
      editForm.phoneNumber.trim() !== "" &&
      editForm.name.trim() !== "" &&
      editForm.name.length <= NAME_MAX &&
      editForm.requestNote.length <= REQUEST_NOTE_MAX &&
      rejectAttachmentsComplete,
  );

  if (!callingNumberId || !baseItem || !displayItem) {
    return <CallingNumberNotFound />;
  }

  const item = displayItem;
  const ef = editForm;

  return (
    <section className="mx-auto w-[1200px] px-8 pb-[80px]">
      <div className="flex items-center gap-3 pt-10 pb-8">
        <Separator orientation="vertical" className="h-5 bg-gray-200" />
        <div>
          <h1 className="font-apple-bold text-[24px] leading-tight text-gray-900">
            {isEditing ? "발신번호 수정" : "발신번호 상세"}
          </h1>
          <p className="font-apple-light mt-0.5 text-[14px] text-gray-500">
            {isEditing && ef
              ? `${ef.phoneNumber || item.phoneNumber} · ${ef.name || item.name}`
              : `${item.phoneNumber} · ${item.name}`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {item.status === "반려" && item.rejectReason && (
          <div className="rounded-xl border border-red-200 bg-red-50/60 px-6 py-4 shadow-sm">
            <p className="font-apple-medium mb-1 text-[13px] text-red-600">
              반려 사유
            </p>
            <p className="font-apple-light text-[13px] leading-5 whitespace-pre-wrap text-red-500">
              {item.rejectReason}
            </p>
          </div>
        )}

        <SectionCard
          icon={<Building2Icon className="size-4" />}
          title="기관 · 프로젝트"
        >
          <DetailRow label="기관명" value={item.organizationName} />
          <DetailRow label="프로젝트명" value={item.projectName} />
        </SectionCard>

        <SectionCard
          icon={<PhoneIcon className="size-4" />}
          title="발신번호 정보"
        >
          {!isEditing || !ef ? (
            <>
              <DetailRow label="발신번호" value={item.phoneNumber} />
              <DetailRow label="발신번호명" value={item.name} />
              <DetailRow label="등록일" value={formatDate(item.registeredAt)} />
              <DetailRow
                label="인증만료일"
                value={
                  <span
                    className={
                      new Date(item.certExpiredAt) < new Date()
                        ? "text-red-500"
                        : ""
                    }
                  >
                    {formatDate(item.certExpiredAt)}
                  </span>
                }
              />
              <DetailRow
                label="신청 상태"
                value={
                  <Badge
                    variant="outline"
                    className={STATUS_STYLE[item.status].className}
                  >
                    {STATUS_STYLE[item.status].label}
                  </Badge>
                }
              />
              <DetailRow
                label="활성 여부"
                value={
                  <Badge
                    variant="outline"
                    className={
                      item.inUse
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 bg-gray-50 text-gray-500"
                    }
                  >
                    {item.inUse ? "활성" : "비활성"}
                  </Badge>
                }
              />
            </>
          ) : (
            <>
              <EditRow label="발신번호">
                <Input
                  value={ef.phoneNumber}
                  onChange={(e) =>
                    setEditForm((p) =>
                      p ? { ...p, phoneNumber: e.target.value } : p,
                    )
                  }
                  placeholder="02-1234-5678"
                  className="h-[40px] max-w-md text-[13px]"
                />
              </EditRow>
              <EditRow
                label="발신번호명"
                hint={`${ef.name.length}/${NAME_MAX}자`}
              >
                <Input
                  value={ef.name}
                  onChange={(e) => {
                    if (e.target.value.length <= NAME_MAX) {
                      setEditForm((p) =>
                        p ? { ...p, name: e.target.value } : p,
                      );
                    }
                  }}
                  className="h-[40px] max-w-md text-[13px]"
                  maxLength={NAME_MAX}
                />
              </EditRow>
              <EditRow label="등록일">
                <Input
                  type="datetime-local"
                  value={toDatetimeLocalValue(ef.registeredAt)}
                  onChange={(e) =>
                    setEditForm((p) =>
                      p
                        ? {
                            ...p,
                            registeredAt: fromDatetimeLocalValue(
                              e.target.value,
                            ),
                          }
                        : p,
                    )
                  }
                  className="h-[40px] max-w-xs text-[13px]"
                />
              </EditRow>
              <EditRow label="인증만료일">
                <Input
                  type="datetime-local"
                  value={toDatetimeLocalValue(ef.certExpiredAt)}
                  onChange={(e) =>
                    setEditForm((p) =>
                      p
                        ? {
                            ...p,
                            certExpiredAt: fromDatetimeLocalValue(
                              e.target.value,
                            ),
                          }
                        : p,
                    )
                  }
                  className="h-[40px] max-w-xs text-[13px]"
                />
              </EditRow>
              <ReadOnlyRow
                label="신청상태"
                value={
                  <span className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={STATUS_STYLE[item.status].className}
                    >
                      {STATUS_STYLE[item.status].label}
                    </Badge>
                    <span className="font-apple-light rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-400">
                      수정 불가
                    </span>
                  </span>
                }
              />
              <EditRow label="활성 여부">
                <div className="flex items-center gap-3 pt-0.5">
                  <Switch
                    id="edit-in-use"
                    checked={ef.inUse}
                    onCheckedChange={(checked) =>
                      setEditForm((p) => (p ? { ...p, inUse: checked } : p))
                    }
                  />
                  <Label
                    htmlFor="edit-in-use"
                    className="font-apple-light cursor-pointer text-[13px] text-gray-600"
                  >
                    {ef.inUse ? "활성" : "비활성"}
                  </Label>
                </div>
              </EditRow>
            </>
          )}
        </SectionCard>

        {(item.reviewedAt || item.reviewerName) && (
          <SectionCard title="검수 정보">
            {item.reviewedAt && (
              <DetailRow
                label="검수 완료일"
                value={formatDateTime(item.reviewedAt)}
              />
            )}
            {item.reviewerName && (
              <DetailRow label="검수자" value={item.reviewerName} />
            )}
          </SectionCard>
        )}

        {((item.attachments?.length ?? 0) > 0 || isEditing) && (
          <SectionCard
            icon={<FileTextIcon className="size-4" />}
            title={
              isEditing && ef && item.status === "반려"
                ? `첨부파일 (필수 서류 4종 · ${ef.attachments.filter((a) => a.fileName.trim()).length}/4 첨부)`
                : isEditing && ef
                  ? `첨부파일 (${ef.attachments.length}건)`
                  : `첨부파일 (${item.attachments?.length ?? 0}건)`
            }
          >
            {!isEditing || !ef ? (
              <div className="py-4">
                <div className="space-y-2">
                  {item.attachments?.map((attachment) => (
                    <div
                      key={attachment.fileName}
                      className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 last:border-b-0"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <FileTextIcon className="size-4 shrink-0 text-gray-400" />
                        <div className="min-w-0">
                          <p className="font-apple-medium truncate text-[13px] text-gray-700">
                            {attachment.label}
                          </p>
                          <p className="font-apple-light truncate text-[12px] text-gray-400">
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
            ) : item.status === "반려" ? (
              <div className="py-4">
                <p className="font-apple-light mb-4 text-[13px] text-gray-500">
                  아래 4종 서류를 각각 첨부해 주세요. 일부만 제출된 경우 나머지
                  슬롯에서 파일을 추가할 수 있습니다.
                </p>
                <div className="space-y-3">
                  {ef.attachments.map((row) => (
                    <div
                      key={row.clientKey}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                    >
                      <p className="font-apple-medium mb-3 text-[13px] text-gray-800">
                        {row.label}
                        <span className="ml-1 text-red-500">*</span>
                      </p>
                      {row.fileName ? (
                        <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50/50 px-3 py-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <CheckCircle2Icon className="size-4 shrink-0 text-green-500" />
                            <span className="font-apple-light truncate text-[13px] text-gray-700">
                              {row.fileName}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-6 px-2 text-[12px] text-gray-500"
                            onClick={() => {
                              setEditForm((p) =>
                                p
                                  ? {
                                      ...p,
                                      attachments: p.attachments.map((a) =>
                                        a.clientKey === row.clientKey
                                          ? { ...a, fileName: "" }
                                          : a,
                                      ),
                                    }
                                  : p,
                              );
                              const input =
                                attachmentFileRefs.current[row.clientKey];
                              if (input) input.value = "";
                            }}
                          >
                            제거
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50/50 px-3 py-3 text-[13px] text-gray-500 hover:border-gray-400 hover:bg-gray-50"
                          onClick={() =>
                            attachmentFileRefs.current[row.clientKey]?.click()
                          }
                        >
                          <UploadIcon className="size-4" />
                          파일 선택
                        </button>
                      )}
                      <input
                        ref={(el) => {
                          attachmentFileRefs.current[row.clientKey] = el;
                        }}
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                        onChange={(e) => handleAttachmentFile(row.clientKey, e)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4">
                <div className="mb-3 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-[12px]"
                    onClick={() =>
                      setEditForm((p) =>
                        p
                          ? {
                              ...p,
                              attachments: [
                                ...p.attachments,
                                newAttachmentRow(),
                              ],
                            }
                          : p,
                      )
                    }
                  >
                    <PlusIcon className="size-3.5" />행 추가
                  </Button>
                </div>
                <div className="space-y-3">
                  {ef.attachments.length === 0 ? (
                    <p className="font-apple-light text-[13px] text-gray-400">
                      첨부가 없습니다. 「행 추가」로 서류를 등록할 수 있습니다.
                    </p>
                  ) : (
                    ef.attachments.map((row) => (
                      <div
                        key={row.clientKey}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <Label className="font-apple-medium text-[12px] text-gray-600">
                            서류 종류
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-red-500 hover:text-red-600"
                            onClick={() =>
                              handleRemoveAttachmentRow(row.clientKey)
                            }
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </div>
                        <Input
                          value={row.label}
                          onChange={(e) =>
                            setEditForm((p) =>
                              p
                                ? {
                                    ...p,
                                    attachments: p.attachments.map((a) =>
                                      a.clientKey === row.clientKey
                                        ? { ...a, label: e.target.value }
                                        : a,
                                    ),
                                  }
                                : p,
                            )
                          }
                          className="mb-3 h-9 text-[13px]"
                          placeholder="예: 사업자 등록증"
                        />
                        {row.fileName ? (
                          <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50/50 px-3 py-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <CheckCircle2Icon className="size-4 shrink-0 text-green-500" />
                              <span className="font-apple-light truncate text-[13px] text-gray-700">
                                {row.fileName}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-6 px-2 text-[12px] text-gray-500"
                              onClick={() => {
                                setEditForm((p) =>
                                  p
                                    ? {
                                        ...p,
                                        attachments: p.attachments.map((a) =>
                                          a.clientKey === row.clientKey
                                            ? { ...a, fileName: "" }
                                            : a,
                                        ),
                                      }
                                    : p,
                                );
                                const input =
                                  attachmentFileRefs.current[row.clientKey];
                                if (input) input.value = "";
                              }}
                            >
                              제거
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50/50 px-3 py-3 text-[13px] text-gray-500 hover:border-gray-400 hover:bg-gray-50"
                            onClick={() =>
                              attachmentFileRefs.current[row.clientKey]?.click()
                            }
                          >
                            <UploadIcon className="size-4" />
                            파일 선택
                          </button>
                        )}
                        <input
                          ref={(el) => {
                            attachmentFileRefs.current[row.clientKey] = el;
                          }}
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                          onChange={(e) =>
                            handleAttachmentFile(row.clientKey, e)
                          }
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </SectionCard>
        )}

        {(item.requestNote || isEditing) && (
          <SectionCard title="요청 내용">
            {!isEditing || !ef ? (
              <div className="py-4">
                <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="font-apple-light text-[13px] leading-5 whitespace-pre-wrap text-gray-600">
                    {item.requestNote || "-"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <Textarea
                  value={ef.requestNote}
                  onChange={(e) => {
                    if (e.target.value.length <= REQUEST_NOTE_MAX) {
                      setEditForm((p) =>
                        p ? { ...p, requestNote: e.target.value } : p,
                      );
                    }
                  }}
                  placeholder="요청 내용을 입력해주세요."
                  className="min-h-[120px] resize-none text-[13px]"
                />
                <p className="font-apple-light mt-1 text-right text-[12px] text-gray-400">
                  {ef.requestNote.length}/{REQUEST_NOTE_MAX}
                </p>
              </div>
            )}
          </SectionCard>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
        <Button
          type="button"
          variant="ghost"
          className="h-[38px] gap-1.5 px-3 text-gray-500 hover:text-gray-800"
          onClick={() => navigate(LIST_PATH)}
        >
          <ArrowLeftIcon className="size-4" />
          목록으로
        </Button>

        {isEditing ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-[38px] gap-1.5 text-gray-600"
              onClick={handleCancelEdit}
            >
              <XIcon className="size-4" />
              취소
            </Button>
            <Button
              type="button"
              className="h-[38px]"
              onClick={handleSubmitEdit}
              disabled={!isEditFormValid}
            >
              저장하기
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-[38px] gap-1.5 text-gray-700"
              onClick={handleStartEdit}
            >
              <PencilIcon className="size-4" />
              수정하기
            </Button>
            {item.status === "검수중" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-[38px] gap-1.5 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={handleOpenRejectModal}
                >
                  <XCircleIcon className="size-4" />
                  반려
                </Button>
                <Button
                  type="button"
                  className="h-[38px] gap-1.5"
                  onClick={() => handleApprove(item)}
                >
                  <CheckIcon className="size-4" />
                  승인
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={isRejectModalOpen}
        onOpenChange={(open) => !open && handleCloseRejectModal()}
      >
        <DialogContent className="w-[520px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>발신번호 반려</DialogTitle>
          </DialogHeader>

          <div className="px-8 py-6">
            <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
              <div className="space-y-2 text-[14px]">
                <div className="flex gap-4">
                  <span className="font-apple-medium w-[90px] shrink-0 text-gray-500">
                    기관명
                  </span>
                  <span className="font-apple-light text-gray-800">
                    {item.organizationName}
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="font-apple-medium w-[90px] shrink-0 text-gray-500">
                    발신번호
                  </span>
                  <span className="font-apple-medium text-gray-900">
                    {item.phoneNumber}
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="font-apple-medium w-[90px] shrink-0 text-gray-500">
                    발신번호명
                  </span>
                  <span className="font-apple-light text-gray-800">
                    {item.name}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label className="font-apple-medium mb-1.5 block text-[14px] text-gray-700">
                반려 사유
                <span className="ml-1 text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="반려 사유를 입력해주세요. 사용자에게 전달됩니다."
                value={rejectReason}
                onChange={(e) => {
                  if (e.target.value.length <= REJECT_REASON_MAX) {
                    setRejectReason(e.target.value);
                  }
                }}
                className="min-h-[120px] resize-none text-[13px]"
              />
              <p className="font-apple-light mt-1 text-right text-[12px] text-gray-400">
                {rejectReason.length}/{REJECT_REASON_MAX}
              </p>
            </div>

            <DialogFooter className="mt-6 flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseRejectModal}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                onClick={handleSubmitReject}
                disabled={!rejectReason.trim()}
              >
                반려 처리
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
