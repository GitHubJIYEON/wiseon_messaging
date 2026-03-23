import { useCallback, useMemo, useState } from "react";
import {
  BookUserIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  ClockIcon,
  CoinsIcon,
  FolderIcon,
  ImageIcon,
  InfoIcon,
  MegaphoneIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  SmartphoneIcon,
  SparklesIcon,
  UsersIcon,
  VariableIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";

const SMS_MAX_BYTES = 90;
const LMS_MAX_BYTES = 2000;

function getByteLength(str: string) {
  let bytes = 0;
  for (const char of str) {
    bytes += char.charCodeAt(0) > 127 ? 2 : 1;
  }
  return bytes;
}

type MessageType = "SMS" | "LMS" | "MMS";
type ScheduleMode = "immediate" | "scheduled";

interface Contact {
  id: string;
  name: string;
  phone: string;
  company?: string;
}

interface AddressGroup {
  id: string;
  name: string;
  description: string;
  contacts: Contact[];
  createdAt: string;
}

const MOCK_ADDRESS_GROUPS: AddressGroup[] = [
  {
    id: "g1",
    name: "VIP 고객",
    description: "프리미엄 등급 이상 고객",
    createdAt: "2026-03-10",
    contacts: [
      {
        id: "c1",
        name: "김영희",
        phone: "010-1234-5678",
        company: "ABC주식회사",
      },
      { id: "c2", name: "이철수", phone: "010-9876-5432", company: "DEF기업" },
      { id: "c3", name: "박지민", phone: "010-5555-3333", company: "GHI코퍼" },
    ],
  },
  {
    id: "g2",
    name: "신규 가입자",
    description: "최근 30일 내 가입한 고객",
    createdAt: "2026-03-15",
    contacts: [
      { id: "c4", name: "최수현", phone: "010-2222-1111", company: "JKL기업" },
      { id: "c5", name: "정다운", phone: "010-3333-4444" },
    ],
  },
  {
    id: "g3",
    name: "마케팅 수신 동의",
    description: "마케팅 수신에 동의한 고객",
    createdAt: "2026-03-01",
    contacts: [
      {
        id: "c6",
        name: "한소희",
        phone: "010-6666-7777",
        company: "MNO주식회사",
      },
      { id: "c7", name: "윤서준", phone: "010-8888-9999" },
      { id: "c8", name: "강미래", phone: "010-1111-0000", company: "PQR기업" },
      { id: "c9", name: "오현우", phone: "010-4444-5555" },
    ],
  },
  {
    id: "g4",
    name: "제휴사 담당자",
    description: "제휴 계약 담당자 연락처",
    createdAt: "2026-02-20",
    contacts: [
      {
        id: "c10",
        name: "임태양",
        phone: "010-7777-8888",
        company: "STU파트너스",
      },
      {
        id: "c11",
        name: "배하늘",
        phone: "010-0000-1234",
        company: "VWX컨설팅",
      },
    ],
  },
];

const VARIABLE_TAGS = [
  { label: "이름", value: "#{이름}" },
  { label: "회사", value: "#{회사}" },
  { label: "직책", value: "#{직책}" },
];

export default function SendSmsPage() {
  const [callingNumber, setCallingNumber] = useState("");
  const [isAd, setIsAd] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set(),
  );
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("immediate");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const selectedGroups = useMemo(
    () => MOCK_ADDRESS_GROUPS.filter((g) => selectedGroupIds.has(g.id)),
    [selectedGroupIds],
  );

  const totalRecipients = useMemo(
    () => selectedGroups.reduce((sum, g) => sum + g.contacts.length, 0),
    [selectedGroups],
  );

  const byteLength = useMemo(
    () => getByteLength(messageContent),
    [messageContent],
  );

  const messageType: MessageType = useMemo(() => {
    if (attachedImage) return "MMS";
    if (byteLength > SMS_MAX_BYTES) return "LMS";
    return "SMS";
  }, [byteLength, attachedImage]);

  const maxBytes = messageType === "SMS" ? SMS_MAX_BYTES : LMS_MAX_BYTES;

  const costPerMessage =
    messageType === "MMS" ? 50 : messageType === "LMS" ? 30 : 16.5;
  const totalCost = costPerMessage * totalRecipients;

  const handleInsertVariable = (variable: string) => {
    setMessageContent((prev) => prev + variable);
  };

  const handleToggleGroup = useCallback((groupId: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const handleToggleAllGroups = useCallback(() => {
    setSelectedGroupIds((prev) => {
      if (prev.size === MOCK_ADDRESS_GROUPS.length) return new Set();
      return new Set(MOCK_ADDRESS_GROUPS.map((g) => g.id));
    });
  }, []);

  const previewMessage = useMemo(() => {
    if (!messageContent) return "";
    let msg = messageContent;
    if (isAd) {
      msg = `(광고) ${msg}\n무료수신거부 080-XXX-XXXX`;
    }
    return msg;
  }, [messageContent, isAd]);

  return (
    <section className="mx-auto w-full max-w-[1280px] px-10 pt-10 pb-[60px]">
      <div className="mb-10">
        <h1 className="font-apple-semibold text-center text-[28px] leading-[38px] text-gray-700">
          문자 보내기
        </h1>
        <p className="font-apple-regular mt-2 text-center text-[15px] leading-6 text-gray-500">
          발신 정보, 발송 대상, 메시지 내용, 예약 시간을 설정하고 미리보기로
          검토하세요.
        </p>
      </div>

      <div className="flex gap-8">
        {/* ───────── Left: Form ───────── */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* 1. 발신번호 선택 */}
          <FormCard
            icon={<BookUserIcon size={18} />}
            number={1}
            title="발신번호 선택"
          >
            <div className="flex items-center gap-3">
              <Select value={callingNumber} onValueChange={setCallingNumber}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="등록된 발신번호를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="02-1234-5678">02-1234-5678</SelectItem>
                  <SelectItem value="070-9876-5432">070-9876-5432</SelectItem>
                  <SelectItem value="010-1111-2222">010-1111-2222</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="shrink-0">
                <PlusIcon size={14} />
                번호 등록
              </Button>
            </div>
            {!callingNumber && (
              <p className="text-danger-500 mt-2 flex items-center gap-1.5 text-[13px]">
                <CircleAlertIcon size={13} />
                발신번호를 선택해주세요.
              </p>
            )}
          </FormCard>

          {/* 2. 광고문자 여부 */}
          <FormCard
            icon={<MegaphoneIcon size={18} />}
            number={2}
            title="광고문자 여부"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-600">
                  광고성 문자일 경우 반드시 활성화해주세요.
                </p>
                <p className="text-[12px] text-gray-500">
                  활성화 시 (광고) 표기와 무료수신거부 번호가 자동 삽입됩니다.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Label
                  htmlFor="ad-switch"
                  className={cn(
                    "text-sm font-medium",
                    isAd ? "text-primary" : "text-gray-500",
                  )}
                >
                  {isAd ? "광고" : "일반"}
                </Label>
                <Switch
                  id="ad-switch"
                  checked={isAd}
                  onCheckedChange={setIsAd}
                />
              </div>
            </div>
            {isAd && (
              <div className="border-primary-50 bg-primary-50 mt-3 flex items-start gap-2 rounded-lg border px-3.5 py-2.5">
                <InfoIcon size={14} className="text-primary mt-0.5 shrink-0" />
                <p className="text-primary-600 text-[13px] leading-5">
                  광고문자에는 &quot;(광고)&quot; 표기와 무료수신거부 번호가
                  본문 앞뒤에 자동으로 삽입됩니다. 정보통신망법 제50조에 따른
                  필수 사항입니다.
                </p>
              </div>
            )}
          </FormCard>

          {/* 3. 변수 사용 */}
          <FormCard
            icon={<VariableIcon size={18} />}
            number={3}
            title="변수 삽입"
            description="수신자별 개인화된 내용을 작성할 수 있습니다."
          >
            <div className="flex flex-wrap gap-2">
              {VARIABLE_TAGS.map((v) => (
                <Button
                  key={v.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsertVariable(v.value)}
                  className="gap-1.5 text-[13px]"
                >
                  <SparklesIcon size={13} className="text-primary" />
                  {v.label}
                  <span className="text-gray-400">{v.value}</span>
                </Button>
              ))}
            </div>
          </FormCard>

          {/* 4. 수신자 선택 */}
          <FormCard
            icon={<BookUserIcon size={18} />}
            number={4}
            title="수신자 선택"
            trailing={
              totalRecipients > 0 ? (
                <div className="flex items-center gap-2">
                  <Badge className="font-apple-medium bg-primary/10 text-primary hover:bg-primary/10 text-[12px]">
                    {selectedGroupIds.size}개 그룹
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="font-apple-medium text-[12px]"
                  >
                    총 {totalRecipients}명
                  </Badge>
                </div>
              ) : null
            }
          >
            <AddressGroupSelector
              groups={MOCK_ADDRESS_GROUPS}
              selectedIds={selectedGroupIds}
              onToggle={handleToggleGroup}
              onToggleAll={handleToggleAllGroups}
            />
          </FormCard>

          {/* 5. 메시지 내용 */}
          <FormCard
            icon={<SmartphoneIcon size={18} />}
            number={5}
            title="메시지 내용"
            trailing={<MessageTypeBadge type={messageType} />}
          >
            {messageType !== "SMS" && (
              <div className="mb-3">
                <Input
                  placeholder="제목을 입력하세요 (LMS/MMS)"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  className="h-10"
                />
              </div>
            )}

            <div className="relative">
              <Textarea
                placeholder="메시지 내용을 입력하세요..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={6}
                className="resize-none pr-4 pb-10 text-[14px] leading-6"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-3">
                <button
                  type="button"
                  className="hover:text-primary flex cursor-pointer items-center gap-1 text-[12px] text-gray-500 transition-colors"
                  onClick={() =>
                    setAttachedImage(attachedImage ? null : "preview")
                  }
                >
                  <ImageIcon size={14} />
                  이미지
                </button>
                <span
                  className={cn(
                    "font-apple-medium text-[12px]",
                    byteLength > maxBytes ? "text-danger-500" : "text-gray-400",
                  )}
                >
                  {byteLength}/{maxBytes} byte
                </span>
              </div>
            </div>

            {attachedImage && (
              <div className="bg-point-gray-100 mt-3 flex items-center gap-2 rounded-lg border border-dashed border-gray-400 p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-200">
                  <ImageIcon size={20} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-gray-700">
                    sample_image.jpg
                  </p>
                  <p className="text-[12px] text-gray-500">23.4 KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                >
                  <XIcon size={14} />
                </button>
              </div>
            )}
          </FormCard>

          {/* 6. 발송 시간 */}
          <FormCard
            icon={<CalendarIcon size={18} />}
            number={6}
            title="발송 시간"
          >
            <div className="flex gap-3">
              <ScheduleOption
                active={scheduleMode === "immediate"}
                onClick={() => setScheduleMode("immediate")}
                icon={<SendIcon size={16} />}
                label="즉시 발송"
                description="확인 즉시 발송합니다"
              />
              <ScheduleOption
                active={scheduleMode === "scheduled"}
                onClick={() => setScheduleMode("scheduled")}
                icon={<ClockIcon size={16} />}
                label="예약 발송"
                description="지정 시간에 발송합니다"
              />
            </div>

            {scheduleMode === "scheduled" && (
              <div className="mt-4 flex gap-3">
                <div className="flex-1">
                  <Label className="mb-1.5 text-[13px] text-gray-600">
                    날짜
                  </Label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="flex-1">
                  <Label className="mb-1.5 text-[13px] text-gray-600">
                    시간
                  </Label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            )}
          </FormCard>

          {/* 7. 포인트 잔액 + 8. 발송 버튼 */}
          <div className="rounded-xl border border-gray-300 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CoinsIcon size={18} className="text-primary" />
                  <span className="font-apple-medium text-sm text-gray-600">
                    보유 포인트
                  </span>
                  <span className="font-apple-bold text-lg text-gray-700">
                    12,500P
                  </span>
                </div>
                <Separator orientation="vertical" className="h-5" />
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    발송 단가{" "}
                    <span className="font-apple-medium text-gray-700">
                      {costPerMessage}원
                    </span>
                  </span>
                  <span>×</span>
                  <span>
                    수신자{" "}
                    <span className="font-apple-medium text-gray-700">
                      {totalRecipients}명
                    </span>
                  </span>
                  <span>=</span>
                  <span className="font-apple-bold text-primary">
                    {totalCost.toLocaleString()}P
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="font-apple-medium min-w-[140px] gap-2 text-[15px]"
                disabled={
                  !callingNumber || !messageContent || totalRecipients === 0
                }
              >
                <SendIcon size={16} />
                {scheduleMode === "scheduled" ? "예약 발송" : "즉시 발송"}
              </Button>
            </div>
          </div>
        </div>

        {/* ───────── Right: Phone Preview ───────── */}
        <div className="w-[320px] shrink-0">
          <div className="sticky top-10">
            <div className="mb-3 flex items-center gap-2">
              <SmartphoneIcon size={16} className="text-gray-500" />
              <span className="font-apple-medium text-sm text-gray-600">
                미리보기
              </span>
            </div>

            <PhonePreview
              callingNumber={callingNumber}
              messageTitle={messageType !== "SMS" ? messageTitle : ""}
              messageContent={previewMessage}
              messageType={messageType}
              hasImage={!!attachedImage}
              recipientCount={totalRecipients}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────── Sub-components ──────────────── */

function AddressGroupSelector({
  groups,
  selectedIds,
  onToggle,
  onToggleAll,
}: {
  groups: AddressGroup[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const filteredGroups = useMemo(
    () =>
      groups.filter(
        (g) =>
          g.name.includes(searchQuery) || g.description.includes(searchQuery),
      ),
    [groups, searchQuery],
  );

  const allSelected =
    filteredGroups.length > 0 &&
    filteredGroups.every((g) => selectedIds.has(g.id));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon
            size={15}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="주소록 그룹 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-[13px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
            >
              <XIcon size={13} />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAll}
          className="shrink-0 gap-1.5 text-[13px]"
        >
          {allSelected ? (
            <>
              <XIcon size={13} />
              전체 해제
            </>
          ) : (
            <>
              <CheckCircle2Icon size={13} />
              전체 선택
            </>
          )}
        </Button>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <FolderIcon size={28} className="text-gray-300" />
          <p className="text-[13px] text-gray-400">
            {searchQuery
              ? "검색 결과가 없습니다."
              : "등록된 주소록이 없습니다."}
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              size="sm"
              className="mt-1 gap-1.5"
              asChild
            >
              <a href="/messaging/address/register">
                <PlusIcon size={13} />
                주소록 등록하기
              </a>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-300">
          <ul className="max-h-[320px] divide-y divide-gray-100 overflow-y-auto">
            {filteredGroups.map((group) => {
              const isSelected = selectedIds.has(group.id);
              const isExpanded = expandedGroupId === group.id;
              return (
                <li key={group.id}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors",
                      isSelected && "bg-primary-50/50",
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggle(group.id)}
                    />
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                      onClick={() => onToggle(group.id)}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-point-gray-300 text-gray-500",
                        )}
                      >
                        <FolderIcon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-apple-medium truncate text-[14px]",
                              isSelected ? "text-primary" : "text-gray-700",
                            )}
                          >
                            {group.name}
                          </span>
                          <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">
                            {group.contacts.length}명
                          </span>
                        </div>
                        <p className="truncate text-[12px] text-gray-500">
                          {group.description}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedGroupId(isExpanded ? null : group.id)
                      }
                      className={cn(
                        "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors",
                        isExpanded
                          ? "bg-gray-200 text-gray-600"
                          : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
                      )}
                    >
                      {isExpanded ? (
                        <ChevronUpIcon size={15} />
                      ) : (
                        <ChevronDownIcon size={15} />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="bg-point-gray-100 border-t border-gray-100 px-4 py-2">
                      <div className="mb-1.5 flex items-center gap-1 px-1 text-[11px] font-medium text-gray-500">
                        <UsersIcon size={11} />
                        연락처 목록
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {group.contacts.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5"
                          >
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-500">
                              {c.name.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12px] font-medium text-gray-700">
                                {c.name}
                              </p>
                              <p className="truncate text-[11px] text-gray-400">
                                {c.phone}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {groups
            .filter((g) => selectedIds.has(g.id))
            .map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => onToggle(g.id)}
                className="group border-primary-200 bg-primary-50 text-primary hover:border-danger-500 hover:bg-danger-500/5 flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] transition-colors"
              >
                <FolderIcon size={11} />
                {g.name}
                <span className="text-primary-100 group-hover:text-danger-500">
                  ×
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function FormCard({
  icon,
  number,
  title,
  description,
  trailing,
  children,
}: {
  icon: React.ReactNode;
  number: number;
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-300 bg-white p-6 transition-shadow hover:shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="bg-primary-50 text-primary flex h-7 w-7 items-center justify-center rounded-lg">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-apple-medium text-primary text-[11px]">
            STEP {number}
          </span>
          <h3 className="font-apple-medium text-[15px] text-gray-700">
            {title}
          </h3>
        </div>
        {trailing && <div className="ml-auto">{trailing}</div>}
      </div>
      {description && (
        <p className="mb-3 text-[13px] text-gray-500">{description}</p>
      )}
      {children}
    </div>
  );
}

function ScheduleOption({
  active,
  onClick,
  icon,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3.5 text-left transition-all",
        active
          ? "border-primary bg-primary-50"
          : "border-gray-200 bg-white hover:border-gray-300",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          active ? "bg-primary text-white" : "bg-gray-100 text-gray-500",
        )}
      >
        {icon}
      </div>
      <div>
        <p
          className={cn(
            "font-apple-medium text-[14px]",
            active ? "text-primary" : "text-gray-700",
          )}
        >
          {label}
        </p>
        <p className="text-[12px] text-gray-500">{description}</p>
      </div>
    </button>
  );
}

function MessageTypeBadge({ type }: { type: MessageType }) {
  const config = {
    SMS: { color: "bg-positive-500/10 text-positive-500", label: "SMS" },
    LMS: { color: "bg-primary-50 text-primary", label: "LMS" },
    MMS: { color: "bg-danger-100 text-danger-500", label: "MMS" },
  }[type];

  return (
    <span
      className={cn(
        "font-apple-medium inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px]",
        config.color,
      )}
    >
      {config.label}
    </span>
  );
}

function PhonePreview({
  callingNumber,
  messageTitle,
  messageContent,
  messageType,
  hasImage,
  recipientCount,
}: {
  callingNumber: string;
  messageTitle: string;
  messageContent: string;
  messageType: MessageType;
  hasImage: boolean;
  recipientCount: number;
}) {
  return (
    <div className="overflow-hidden rounded-[36px] border-[3px] border-gray-700 bg-gray-700 shadow-xl">
      {/* Status bar */}
      <div className="flex items-center justify-between bg-gray-700 px-6 py-2 text-[11px] text-white">
        <span>9:41</span>
        <div className="mx-auto h-[4px] w-[80px] rounded-full bg-gray-500" />
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-1 rounded-sm bg-white" />
          <div className="h-3 w-1 rounded-sm bg-white" />
          <div className="h-3.5 w-1 rounded-sm bg-white" />
          <div className="h-4 w-1 rounded-sm bg-white" />
        </div>
      </div>

      {/* Message area */}
      <div className="flex min-h-[480px] flex-col bg-[#F2F2F7] px-4 pt-3 pb-6">
        {/* Header */}
        <div className="mb-3 flex items-center justify-center gap-2 pb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
            <SmartphoneIcon size={14} className="text-gray-500" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-800">
              {callingNumber || "발신번호 미선택"}
            </p>
            <p className="text-[10px] text-gray-500">
              수신자 {recipientCount}명
            </p>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Message bubble */}
        {messageContent ? (
          <div className="flex justify-start">
            <div className="max-w-[240px] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 shadow-sm">
              {hasImage && (
                <div className="mb-2 flex h-[120px] items-center justify-center rounded-lg bg-gray-100">
                  <ImageIcon size={28} className="text-gray-300" />
                </div>
              )}
              {messageTitle && (
                <p className="mb-1 text-[13px] font-semibold text-gray-800">
                  {messageTitle}
                </p>
              )}
              <p className="text-[13px] leading-5 whitespace-pre-wrap text-gray-800">
                {messageContent}
              </p>
              <p className="mt-1.5 text-right text-[10px] text-gray-400">
                {messageType} · 지금
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
              <SendIcon size={20} className="text-gray-400" />
            </div>
            <p className="text-[13px] text-gray-400">
              메시지를 입력하면
              <br />
              미리보기가 표시됩니다.
            </p>
          </div>
        )}
      </div>

      {/* Bottom indicator */}
      <div className="flex justify-center bg-[#F2F2F7] pb-2">
        <div className="h-[5px] w-[134px] rounded-full bg-gray-800" />
      </div>
    </div>
  );
}
