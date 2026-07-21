import { useMemo, useState } from "react";
import {
  Bell,
  Check,
  CircleAlert,
  ImagePlus,
  MessageSquareTextIcon,
  Search,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { StepHeader } from "@/shared/components/ui/step-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  TimePicker,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerLabel,
  TimePickerMinute,
  TimePickerPeriod,
  TimePickerSeparator,
  TimePickerTrigger,
} from "@/shared/components/ui/time-picker";

const SendNumbder = [
  { value: "public", label: "공공기관", number: "02-6321-4141" },
  { value: "private", label: "민간기관", number: "02-6321-4141" },
  { value: "other", label: "기타", number: "02-6321-4141" },
];

const AddressBookGroups = [
  {
    groupId: 1,
    groupName: "VIP 고객",
    description: "우선 안내가 필요한 주요 고객",
    members: [
      {
        memberId: 101,
        memberName: "홍길동",
        phoneNumber: "010-1234-5678",
        organization: "와이즈온",
        position: "대표",
      },
      {
        memberId: 102,
        memberName: "김영희",
        phoneNumber: "010-2222-3333",
        organization: "서울지점",
        position: "팀장",
      },
      {
        memberId: 103,
        memberName: "이철수",
        phoneNumber: "010-4444-5555",
        organization: "부산지점",
        position: "매니저",
      },
    ],
  },
  {
    groupId: 2,
    groupName: "신규 가입자",
    description: "최근 30일 이내 등록된 연락처",
    members: [
      {
        memberId: 201,
        memberName: "박민수",
        phoneNumber: "010-5555-1111",
        organization: "신규 고객",
        position: "회원",
      },
      {
        memberId: 202,
        memberName: "최지은",
        phoneNumber: "010-7777-2222",
        organization: "신규 고객",
        position: "회원",
      },
      {
        memberId: 203,
        memberName: "정다은",
        phoneNumber: "010-8888-3333",
        organization: "신규 고객",
        position: "회원",
      },
      {
        memberId: 204,
        memberName: "윤성호",
        phoneNumber: "010-9999-4444",
        organization: "신규 고객",
        position: "회원",
      },
    ],
  },
  {
    groupId: 3,
    groupName: "휴면 고객",
    description: "재방문 안내 대상",
    members: [
      {
        memberId: 301,
        memberName: "강하늘",
        phoneNumber: "010-1111-2222",
        organization: "장기 미접속",
        position: "회원",
      },
      {
        memberId: 302,
        memberName: "오서연",
        phoneNumber: "010-3333-4444",
        organization: "장기 미접속",
        position: "회원",
      },
    ],
  },
];

const VariableList = [
  "번호",
  "이름",
  "소속",
  "변수1",
  "변수2",
  "변수3",
  "변수4",
  "변수5",
];
type AddressBookGroup = (typeof AddressBookGroups)[number];
type AddressBookMember = AddressBookGroup["members"][number];

const SavedTemplates = [
  {
    id: 1,
    title: "공지사항 기본",
    content:
      "안녕하세요. 고객님께 중요한 공지사항을 안내드립니다. 자세한 내용은 홈페이지를 확인해 주세요.  자세한 내용은 홈페이지를 확인해 주세요. 자세한 내용은 홈페이지를 확인해 주세요. 자세한 내용은 홈페이지를 확인해 주세요. 자세한 내용은 홈페이지를 확인해 주세요. 자세한 내용은 홈페이지를 확인해 주세요. 자세한 내용은 홈페이지를 확인해 주세요. 자세한 내용은 홈페이지를 확인해 주세요.",
    savedAt: "2026.06.20",
  },
  {
    id: 2,
    title: "이벤트 안내",
    content:
      "안녕하세요! 특별 이벤트를 진행합니다. 기간 내 참여 시 혜택을 드립니다. 많은 관심 부탁드립니다.",
    savedAt: "2026.06.18",
  },
  {
    id: 3,
    title: "예약 확인",
    content:
      "예약이 완료되었습니다. 예약 일시: [날짜] / 장소: [장소]. 문의사항은 고객센터로 연락 주세요.",
    savedAt: "2026.06.15",
  },
  {
    id: 4,
    title: "배송 안내",
    content:
      "주문하신 상품이 발송되었습니다. 배송 조회는 홈페이지에서 확인하실 수 있습니다.",
    savedAt: "2026.06.10",
  },
  {
    id: 5,
    title: "만족도 조사",
    content:
      "고객님의 소중한 의견을 부탁드립니다. 아래 링크를 통해 만족도 조사에 참여해 주세요.",
    savedAt: "2026.06.05",
  },
];

const RecentTemplates = [
  {
    id: 101,
    title: "6월 정기 점검 안내",
    content:
      "안녕하세요. 6월 정기 시스템 점검이 예정되어 있습니다. 점검 시간: 06/25 02:00~04:00. 이용에 불편을 드려 죄송합니다.",
    sentAt: "2026.06.22",
    recipientCount: 1240,
  },
  {
    id: 102,
    title: "여름 세일 이벤트",
    content:
      "안녕하세요! 여름 특별 세일을 진행합니다. 6/20~6/30까지 전 상품 최대 30% 할인! 지금 바로 확인하세요.",
    sentAt: "2026.06.19",
    recipientCount: 3850,
  },
  {
    id: 103,
    title: "신규 서비스 오픈 안내",
    content:
      "와이즈온 메시지 서비스가 새롭게 업데이트되었습니다. 더 빠르고 편리해진 서비스를 이용해 보세요.",
    sentAt: "2026.06.12",
    recipientCount: 520,
  },
  {
    id: 104,
    title: "회원 가입 감사 메시지",
    content:
      "회원가입을 축하드립니다! 첫 이용 고객님께 특별 쿠폰을 드립니다. 마이페이지에서 확인해 주세요.",
    sentAt: "2026.06.08",
    recipientCount: 87,
  },
];

type SavedTemplate = (typeof SavedTemplates)[number];
type RecentTemplate = (typeof RecentTemplates)[number];
type MessageTemplate = SavedTemplate | RecentTemplate;

export default function SmsPage() {
  const [open, setOpen] = useState(false);
  const [addressBookOpen, setAddressBookOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [sendTiming, setSendTiming] = useState<"NOW" | "RESERVATION">("NOW");
  const [rejectNumber] = useState<string>("02-1234-1234");
  const [isAdvertising, setIsAdvertising] = useState<"COMM" | "AD">("COMM");
  const [messageType, setMessageType] = useState<"SMS" | "LMS">("LMS");
  const [isMMS, setIsMMS] = useState(false);
  const [isVariable, setIsVariable] = useState(true);
  const [activeGroupId, setActiveGroupId] = useState(
    AddressBookGroups[0].groupId,
  );
  const [addressBookKeyword, setAddressBookKeyword] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [draftMemberIds, setDraftMemberIds] = useState<number[]>([]);
  const [savedTemplateList, setSavedTemplateList] = useState(SavedTemplates);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateTab, setTemplateTab] = useState<"saved" | "recent">("saved");
  const [templateKeyword, setTemplateKeyword] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<MessageTemplate | null>(null);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");

  const draftMemberIdSet = useMemo(
    () => new Set(draftMemberIds),
    [draftMemberIds],
  );

  const selectedMemberIdSet = useMemo(
    () => new Set(selectedMemberIds),
    [selectedMemberIds],
  );

  const filteredAddressBookGroups = useMemo(() => {
    const keyword = addressBookKeyword.trim().toLowerCase();

    if (!keyword) {
      return AddressBookGroups;
    }

    return AddressBookGroups.filter((group) => {
      const hasMatchedGroupName = group.groupName
        .toLowerCase()
        .includes(keyword);
      const hasMatchedMember = group.members.some(
        (member) =>
          member.memberName.toLowerCase().includes(keyword) ||
          member.phoneNumber.includes(keyword),
      );

      return hasMatchedGroupName || hasMatchedMember;
    });
  }, [addressBookKeyword]);

  const activeGroup =
    filteredAddressBookGroups.find(
      (group) => group.groupId === activeGroupId,
    ) ??
    filteredAddressBookGroups[0] ??
    AddressBookGroups[0];

  const selectedMembers = useMemo(
    () =>
      AddressBookGroups.flatMap((group) =>
        group.members
          .filter((member) => selectedMemberIdSet.has(member.memberId))
          .map((member) => ({ ...member, groupName: group.groupName })),
      ),
    [selectedMemberIdSet],
  );

  const draftMembers = useMemo(
    () =>
      AddressBookGroups.flatMap((group) =>
        group.members
          .filter((member) => draftMemberIdSet.has(member.memberId))
          .map((member) => ({ ...member, groupName: group.groupName })),
      ),
    [draftMemberIdSet],
  );

  const selectedGroups = AddressBookGroups.filter((group) =>
    group.members.some((member) => selectedMemberIdSet.has(member.memberId)),
  );

  function handleAddressBookOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraftMemberIds(selectedMemberIds);
    }

    setAddressBookOpen(nextOpen);
  }

  function handleToggleGroup(group: AddressBookGroup) {
    const groupMemberIds = group.members.map((member) => member.memberId);
    const isEveryMemberSelected = groupMemberIds.every((memberId) =>
      draftMemberIdSet.has(memberId),
    );

    setDraftMemberIds((prev) => {
      if (isEveryMemberSelected) {
        return prev.filter((memberId) => !groupMemberIds.includes(memberId));
      }

      return Array.from(new Set([...prev, ...groupMemberIds]));
    });
  }

  function handleToggleMember(member: AddressBookMember) {
    setDraftMemberIds((prev) =>
      prev.includes(member.memberId)
        ? prev.filter((memberId) => memberId !== member.memberId)
        : [...prev, member.memberId],
    );
  }

  function handleConfirmAddressBook() {
    setSelectedMemberIds(draftMemberIds);
    setAddressBookOpen(false);
  }

  const filteredSavedTemplates = useMemo(() => {
    const keyword = templateKeyword.trim().toLowerCase();
    if (!keyword) return savedTemplateList;
    return savedTemplateList.filter(
      (t) =>
        t.title.toLowerCase().includes(keyword) ||
        t.content.toLowerCase().includes(keyword),
    );
  }, [templateKeyword, savedTemplateList]);

  function handleDeleteSavedTemplate(id: number) {
    setSavedTemplateList((prev) => prev.filter((t) => t.id !== id));
    if (selectedTemplate?.id === id) setSelectedTemplate(null);
  }

  const filteredRecentTemplates = useMemo(() => {
    const keyword = templateKeyword.trim().toLowerCase();
    if (!keyword) return RecentTemplates;
    return RecentTemplates.filter(
      (t) =>
        t.title.toLowerCase().includes(keyword) ||
        t.content.toLowerCase().includes(keyword),
    );
  }, [templateKeyword]);

  function handleConfirmTemplate() {
    setTemplateOpen(false);
    setTemplateKeyword("");
  }

  function handleSaveTemplate() {
    // TODO: API 연동
    setSaveTemplateOpen(false);
    setSaveTemplateName("");
  }

  function handleRemoveSelectedGroup(group: AddressBookGroup) {
    const groupMemberIds = group.members.map((member) => member.memberId);

    setSelectedMemberIds((prev) =>
      prev.filter((memberId) => !groupMemberIds.includes(memberId)),
    );
  }

  return (
    <section className="mx-auto mb-10 flex max-w-6xl flex-col gap-6">
      <h1 className="mt-8 text-center text-2xl">문자 보내기</h1>

      <div className="flex w-full flex-row gap-6">
        {/* 폼 */}
        <div className="flex w-2/3 flex-col gap-6">
          <div className="flex flex-row items-center justify-between rounded-md bg-white p-7 shadow-sm">
            <StepHeader number={1} title="발신 번호 선택" />
            <Select>
              <SelectTrigger className="w-1/2">
                <SelectValue placeholder={SendNumbder[0].number} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SendNumbder.map((item) => (
                    <SelectItem key={item.value} value={item.value as string}>
                      <div className="flex items-center gap-2">
                        <span className="font-apple-medium text-md text-black">
                          {item.number}
                        </span>
                        <span className="font-apple-medium text-md text-gray-600">
                          ({item.label})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-4 rounded-md bg-white p-7 shadow-sm">
            <StepHeader number={2} title="광고문자 여부 선택" />
            <RadioGroup
              defaultValue="COMM"
              className="flex"
              onValueChange={(value) => {
                if (value === "COMM" || value === "AD") {
                  setIsAdvertising(value as "COMM" | "AD");
                }
              }}
            >
              <FieldLabel htmlFor="COMM">
                <Field orientation="horizontal">
                  <RadioGroupItem value="COMM" id="COMM" />
                  <FieldContent>
                    <FieldTitle>정보성 문자</FieldTitle>
                    <FieldDescription>
                      단순 안내 목적의 정보성 문자
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="AD">
                <Field orientation="horizontal">
                  <RadioGroupItem value="AD" id="AD" />
                  <FieldContent>
                    <FieldTitle>광고성 문자</FieldTitle>
                    <FieldDescription>
                      (광고) 표기 및 수신거부 번호 포함 광고 형식 준수
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </RadioGroup>

            {/* 광고성 문자 선택시 상호명 입력 */}
            {isAdvertising === "AD" ? (
              <>
                <div className="bg-point-gray-100 flex items-center gap-3 rounded-md p-6">
                  <Field className="flex w-1/2">
                    <FieldLabel htmlFor="companyName" className=" ">
                      상호명
                    </FieldLabel>
                    <Input
                      className="bg-white"
                      id="companyName"
                      placeholder="상호명을 입력해주세요"
                      required
                    />
                  </Field>
                  <Field className="flex w-1/2">
                    {/* 광고성 문자 선택시 수신거부번호 선택 */}
                    <FieldLabel htmlFor="rejectNumber">수신거부번호</FieldLabel>
                    <Input
                      id="rejectNumber"
                      value={rejectNumber}
                      className="bg-white"
                      disabled
                    />
                  </Field>
                </div>
                <ul className="rounded-md border-gray-300 bg-yellow-50 p-4">
                  <li className="flex items-center gap-2">
                    <CircleAlert className="mb-2 size-5 text-yellow-500" />
                    <p className="font-apple-medium text-md text-[#46474c]">
                      <strong>광고 문자</strong> 반드시 광고 형식{" "}
                      <strong> (상호명, 수신거부번호) </strong>을 준수해주세요
                    </p>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-[#46474c]" />
                    <p className="font-apple-medium text-sm text-[#46474c]">
                      광고성 문자를 선택하면 <strong> (광고) 표기 </strong> 및{" "}
                      <strong> 수신거부번호 </strong>
                      포함됩니다.
                    </p>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-[#46474c]" />
                    <p className="font-apple-medium text-sm text-[#46474c]">
                      마케팅 목적의 메시지는 꼭 '광고 문자'로 선택해주세요
                    </p>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-[#46474c]" />
                    <p className="font-apple-medium text-sm text-[#46474c]">
                      수신거부번호 서비스에 등록된 번호로 발송됩니다.
                    </p>
                  </li>
                </ul>
              </>
            ) : (
              <ul className="bg-point-gray-200 rounded-md border-gray-300 p-4">
                <li className="flex items-center gap-2">
                  <Bell className="mb-2 size-5 text-blue-500" />
                  <p className="font-apple-medium text-md text-[#46474c]">
                    정보성 문자 VS 광고성 문자
                  </p>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#46474c]" />
                  <p className="font-apple-medium text-sm text-[#46474c]">
                    단순 안내 목적의 정보성 문자 (ex 설문조사 응답 안내)
                  </p>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#46474c]" />
                  <p className="font-apple-medium text-sm text-[#46474c]">
                    마케팅 목적의 광고성 문자 (ex 이벤트 안내)
                  </p>
                </li>
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-md bg-white p-7 shadow-sm">
            <StepHeader number={3} title="발송 대상 선택" />
            <div className="flex min-h-28 w-full flex-col justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-4">
              {selectedMembers.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-apple-medium text-sm text-gray-700">
                        주소록에서 불러온 수신자
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedGroups[0]?.groupName}
                        {selectedGroups.length > 1 &&
                          ` 외 ${selectedGroups.length - 1}개 그룹`}{" "}
                        / 총 {selectedMembers.length}명
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMemberIds([])}
                    >
                      전체 취소
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedGroups.map((group) => (
                      <Badge
                        key={group.groupId}
                        variant="blue"
                        className="gap-2 px-3 py-1"
                      >
                        {group.groupName}{" "}
                        {
                          group.members.filter((member) =>
                            selectedMemberIdSet.has(member.memberId),
                          ).length
                        }
                        명
                        <button
                          type="button"
                          aria-label={`${group.groupName} 그룹 선택 취소`}
                          onClick={() => handleRemoveSelectedGroup(group)}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <Users className="text-primary-500 size-6" />
                  <p className="font-apple-medium text-sm text-gray-700">
                    주소록 그룹 또는 연락처를 불러와 발송 대상을 구성하세요.
                  </p>
                  <p className="text-xs text-gray-500">
                    그룹 전체 선택 후 필요한 연락처만 제외할 수 있습니다.
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-row justify-end gap-2">
              <Dialog
                open={addressBookOpen}
                onOpenChange={handleAddressBookOpenChange}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">주소록 불러오기</Button>
                </DialogTrigger>
                <DialogContent className="max-w-[1080px] p-0">
                  <DialogHeader>
                    <DialogTitle>주소록 불러오기</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 p-7">
                    <div className="grid w-full grid-cols-[1fr_auto] gap-3">
                      <InputGroup className="w-70">
                        <InputGroupAddon>
                          <Search className="size-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          value={addressBookKeyword}
                          onChange={(event) =>
                            setAddressBookKeyword(event.target.value)
                          }
                          placeholder="그룹명, 이름, 전화번호 검색"
                        />
                      </InputGroup>
                      {/* <div className="flex items-center gap-2 rounded-md border bg-gray-50 px-4 text-sm text-gray-600">
                        <span>전체 {AddressBookGroups.length}개 그룹</span>
                        <span className="text-gray-300">|</span>
                        <span>{totalAddressBookMemberCount}명</span>
                      </div> */}
                    </div>

                    <div className="grid min-h-[430px] grid-cols-[280px_1fr] overflow-hidden rounded-md border">
                      <aside className="border-r bg-gray-50">
                        <div className="flex items-center justify-between border-b px-4 py-4">
                          <p className="font-apple-medium text-sm text-gray-700">
                            주소록 그룹
                          </p>
                          <Badge variant="gray">
                            선택 {draftMembers.length}명
                          </Badge>
                        </div>
                        <ScrollArea className="h-[388px]">
                          <div className="flex flex-col gap-2 p-3">
                            {filteredAddressBookGroups.map((group) => {
                              const groupMemberIds = group.members.map(
                                (member) => member.memberId,
                              );
                              const selectedCount = groupMemberIds.filter(
                                (memberId) => draftMemberIdSet.has(memberId),
                              ).length;
                              const isChecked =
                                selectedCount === group.members.length;
                              const isActive =
                                activeGroup.groupId === group.groupId;

                              return (
                                <div
                                  key={group.groupId}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() =>
                                    setActiveGroupId(group.groupId)
                                  }
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === "Enter" ||
                                      event.key === " "
                                    ) {
                                      setActiveGroupId(group.groupId);
                                    }
                                  }}
                                  className={`flex w-full flex-col gap-2 rounded-md border p-3 text-left transition ${
                                    isActive
                                      ? "border-primary-500 bg-white shadow-sm"
                                      : "border-gray-400 bg-transparent hover:bg-white"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      checked={isChecked}
                                      onClick={(event) =>
                                        event.stopPropagation()
                                      }
                                      onCheckedChange={() =>
                                        handleToggleGroup(group)
                                      }
                                      aria-label={`${group.groupName} 그룹 전체 선택`}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="font-apple-medium truncate text-sm text-gray-800">
                                          {group.groupName}
                                        </p>
                                        <span className="text-xs text-gray-500">
                                          {group.members.length}명
                                        </span>
                                      </div>
                                      <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                                        {group.description}
                                      </p>
                                    </div>
                                  </div>
                                  {selectedCount > 0 && (
                                    <p className="text-primary-600 pl-7 text-xs">
                                      {selectedCount}명 선택됨
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </aside>

                      <div className="flex flex-col">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                          <div>
                            <p className="font-apple-medium text-sm text-gray-800">
                              {activeGroup.groupName}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleGroup(activeGroup)}
                          >
                            전체 선택/해제
                          </Button>
                        </div>
                        <ScrollArea className="h-[388px]">
                          <div className="divide-y">
                            {activeGroup.members.map((member) => (
                              <div
                                key={member.memberId}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleToggleMember(member)}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                  ) {
                                    handleToggleMember(member);
                                  }
                                }}
                                className="flex cursor-pointer items-center gap-3 px-5 py-3 hover:bg-gray-50"
                              >
                                <Checkbox
                                  checked={draftMemberIdSet.has(
                                    member.memberId,
                                  )}
                                  onClick={(event) => event.stopPropagation()}
                                  onCheckedChange={() =>
                                    handleToggleMember(member)
                                  }
                                  aria-label={`${member.memberName} 연락처 선택`}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-apple-medium text-sm text-gray-800">
                                      {member.memberName}
                                    </p>
                                    <Badge variant="outline">
                                      {member.position}
                                    </Badge>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {member.organization}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-700">
                                  {member.phoneNumber}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setDraftMemberIds([])}
                    >
                      초기화
                    </Button>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        취소
                      </Button>
                    </DialogClose>
                    <Button
                      type="button"
                      onClick={handleConfirmAddressBook}
                      disabled={draftMembers.length === 0}
                    >
                      명단 추가
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline">직접 입력하기</Button>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-md bg-white p-7 shadow-sm">
            <StepHeader number={4} title="문자 내용 작성" />
            {/* 메시지 타입 - SMS, LMS */}
            <RadioGroup
              value={messageType}
              onValueChange={(value) => {
                if (value === "SMS" || value === "LMS") {
                  setMessageType(value);
                  setIsMMS(true); // MMS 를 체크박스로 하면 삭제
                  if (value === "SMS") {
                    setIsMMS(false);
                  }
                }
              }}
              className="flex flex-row"
            >
              <FieldLabel htmlFor="SMS">
                <Field orientation="horizontal">
                  <RadioGroupItem value="SMS" id="SMS" />
                  <FieldContent>
                    <FieldTitle>SMS (단문)</FieldTitle>
                    <FieldDescription>90byte 이하 단문 발송</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="LMS">
                <Field orientation="horizontal">
                  <RadioGroupItem value="LMS" id="LMS" />
                  <FieldContent>
                    <FieldTitle>LMS (장문)</FieldTitle>
                    <FieldDescription>2000byte 이하 장문 발송</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </RadioGroup>
            {/* 이미지 첨부 파일 - MMS */}
            {messageType === "LMS" && (
              <div className="flex flex-col gap-2 rounded-md border border-gray-300 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-row items-center gap-4">
                    {/* <Checkbox
                      id="MMS"
                      checked={isMMS}
                      onCheckedChange={(checked) => setIsMMS(checked === true)}
                    /> */}
                    <label htmlFor="MMS" className="flex items-center gap-4">
                      <p className="font-apple-medium text-sm text-gray-700">
                        MMS (이미지)
                      </p>
                      <p className="text-xs text-gray-600">
                        JPG, PNG, GIF 이미지를 최대 3개까지 첨부할 수 있습니다.
                      </p>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {isMMS ? "0/3" : "미사용"}
                  </p>
                </div>

                {isMMS && (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className="hover:border-primary-500 hover:text-primary-500 flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-white text-gray-500"
                      >
                        <ImagePlus className="size-5" />
                        <span className="text-sm">이미지 첨부</span>
                        <span className="text-xs">({slot}/3)</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <FieldGroup className="gap-2">
              {/* 메시지 제목 - LMS,MMS 만  */}
              <Field>
                <FieldLabel htmlFor="subject" className="hidden">
                  제목
                </FieldLabel>
                <Input
                  id="subject"
                  placeholder="제목을 입력해주세요 (40Byte)"
                  required
                />
              </Field>
              {/* 메시지 내용  */}
              <Field>
                <FieldLabel htmlFor="messages" className="hidden">
                  내용
                </FieldLabel>
                <Textarea
                  id="messages"
                  placeholder="내용을 입력해주세요"
                  className="h-24 resize-none"
                />
                {/* <FieldDescription>
                  변수는 실제 발송 시 수신자 데이터로 치환됩니다.
                </FieldDescription> */}
              </Field>
            </FieldGroup>
            {/* 문구 불러오기 , 문구 저장 */}
            <div className="flex justify-end gap-2">
              {/* 문구 불러오기 */}
              <Dialog
                open={templateOpen}
                onOpenChange={(next) => {
                  setTemplateOpen(next);
                  if (!next) {
                    setTemplateKeyword("");
                    setSelectedTemplate(null);
                    setTemplateTab("saved");
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    문구 불러오기
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl p-0">
                  <DialogHeader>
                    <DialogTitle>문구 불러오기</DialogTitle>
                  </DialogHeader>

                  <Tabs
                    value={templateTab}
                    onValueChange={(v) => {
                      setTemplateTab(v as "saved" | "recent");
                      setSelectedTemplate(null);
                      setTemplateKeyword("");
                    }}
                    className="flex flex-col gap-0"
                  >
                    {/* 탭 + 검색바 */}
                    <div className="flex flex-col gap-3 border-b px-6 pt-2 pb-4">
                      <TabsList className="w-fit">
                        <TabsTrigger value="saved">저장 문구</TabsTrigger>
                        <TabsTrigger value="recent">최근 발송 문구</TabsTrigger>
                      </TabsList>
                      <InputGroup className="w-full">
                        <InputGroupAddon>
                          <Search className="size-4 text-gray-400" />
                        </InputGroupAddon>
                        <InputGroupInput
                          value={templateKeyword}
                          onChange={(e) => setTemplateKeyword(e.target.value)}
                          placeholder="제목 또는 내용으로 검색"
                        />
                      </InputGroup>
                    </div>

                    {/* 저장 문구 탭 */}
                    <TabsContent value="saved">
                      <ScrollArea className="h-[340px]">
                        {filteredSavedTemplates.length === 0 ? (
                          <div className="flex h-[300px] items-center justify-center">
                            <p className="text-sm text-gray-400">
                              검색 결과가 없습니다.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-3 bg-gray-100 p-5">
                            {filteredSavedTemplates.map((template) => {
                              const isSelected =
                                selectedTemplate?.id === template.id;
                              return (
                                <div
                                  key={template.id}
                                  className={`relative flex flex-col rounded-lg border p-3 transition-all ${
                                    isSelected
                                      ? "border-primary-400 bg-primary-50 shadow-sm"
                                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                  }`}
                                >
                                  {isSelected && (
                                    <span className="bg-primary-500 absolute top-2 right-2 flex size-4 items-center justify-center rounded-full">
                                      <Check className="size-2.5 text-white" />
                                    </span>
                                  )}
                                  <p
                                    className={`font-apple-medium pr-5 text-[15px] leading-snug ${
                                      isSelected
                                        ? "text-primary-700"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {template.title}
                                  </p>
                                  <p className="mt-2 line-clamp-3 h-[68px] text-[14px] leading-relaxed text-gray-500">
                                    {template.content}
                                  </p>
                                  <p className="mt-1 text-[11px] text-gray-400">
                                    {template.savedAt}
                                  </p>
                                  <div className="mt-3 flex gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={
                                        isSelected ? "default" : "outline"
                                      }
                                      className="h-7 flex-1 text-xs"
                                      onClick={() =>
                                        setSelectedTemplate(template)
                                      }
                                    >
                                      {isSelected ? "선택됨" : "선택"}
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                                      onClick={() =>
                                        handleDeleteSavedTemplate(template.id)
                                      }
                                    >
                                      삭제
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    {/* 최근 발송 문구 탭 */}
                    <TabsContent value="recent">
                      <ScrollArea className="h-[340px]">
                        {filteredRecentTemplates.length === 0 ? (
                          <div className="flex h-[300px] items-center justify-center">
                            <p className="text-sm text-gray-400">
                              검색 결과가 없습니다.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-3 p-5">
                            {filteredRecentTemplates.map((template) => {
                              const isSelected =
                                selectedTemplate?.id === template.id;
                              return (
                                <div
                                  key={template.id}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setSelectedTemplate(template)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      setSelectedTemplate(template);
                                    }
                                  }}
                                  className={`relative flex cursor-pointer flex-col rounded-lg border p-3 transition-all ${
                                    isSelected
                                      ? "border-primary-400 bg-primary-50 shadow-sm"
                                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                  }`}
                                >
                                  {isSelected && (
                                    <span className="bg-primary-500 absolute top-2 right-2 flex size-4 items-center justify-center rounded-full">
                                      <Check className="size-2.5 text-white" />
                                    </span>
                                  )}
                                  <p
                                    className={`font-apple-medium pr-5 text-[13px] leading-snug ${
                                      isSelected
                                        ? "text-primary-700"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {template.title}
                                  </p>
                                  <p className="mt-2 line-clamp-3 flex-1 text-[11px] leading-relaxed text-gray-500">
                                    {template.content}
                                  </p>
                                  <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <Users className="size-3 text-gray-400" />
                                      <span className="text-[11px] text-gray-400">
                                        {template.recipientCount.toLocaleString()}
                                        명
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-400">
                                      {template.sentAt}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter className="border-t px-6 py-4">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        취소
                      </Button>
                    </DialogClose>
                    <Button
                      type="button"
                      disabled={!selectedTemplate}
                      onClick={handleConfirmTemplate}
                    >
                      불러오기
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* 문구 저장 */}
              <Dialog
                open={saveTemplateOpen}
                onOpenChange={(next) => {
                  setSaveTemplateOpen(next);
                  if (!next) setSaveTemplateName("");
                }}
              >
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    문구 저장
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>문구 저장</DialogTitle>
                  </DialogHeader>
                  <div className="px-7 py-4">
                    <p className="mb-2 text-sm text-gray-600">
                      현재 작성된 내용을 문구로 저장합니다.
                    </p>
                    <Input
                      placeholder="문구 제목을 입력해주세요"
                      value={saveTemplateName}
                      onChange={(e) => setSaveTemplateName(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        취소
                      </Button>
                    </DialogClose>
                    <Button
                      type="button"
                      disabled={!saveTemplateName.trim()}
                      onClick={handleSaveTemplate}
                    >
                      저장
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* 변수 사용 */}
            {/* <div className="flex flex-col gap-2 rounded-md border border-gray-300 p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-row items-center gap-4">
                  <Checkbox
                    id="variable"
                    checked={isVariable}
                    onCheckedChange={(checked) =>
                      setIsVariable(checked === true)
                    }
                  />
                  <label htmlFor="variable" className="flex items-center gap-4">
                    <p className="font-apple-medium text-sm text-gray-700">
                      변수 사용하기
                    </p>
                    <p className="text-xs text-gray-600">
                      변수를 사용하면 고객별로 맞춤 메시지를 보낼 수 있어요
                    </p>
                  </label>
                </div>
              </div>
              {isVariable && (
                <div className="flex flex-col gap-2">
                  <ul className="bg-point-gray-100 flex flex-wrap gap-2 rounded-md border border-dashed px-6 py-2">
                    <li>
                      <Button
                        variant="outline"
                        className="border-primary-500 text-primary-500 hover:text-primary-500 rounded-full hover:bg-white"
                      >
                        #{"이름"}
                      </Button>
                    </li>
                    <li>
                      <Button variant="outline" className="rounded-full">
                        #{"생년월일"}
                      </Button>
                    </li>
                    <li>
                      <Button variant="outline" className="rounded-full">
                        #{"이메일"}
                      </Button>
                    </li>
                  </ul>
                </div>
              )}
            </div> */}
            <div className="bg-point-gray-100 rounded-md border border-gray-300 p-4">
              <p className="font-apple-medium text-sm text-gray-700">
                사용 가능한 변수
              </p>
              <div className="flex flex-col gap-2">
                <p className="font-apple-medium text-sm text-gray-600">
                  변수를 클릭하면 치환된 결과가 미리보기에 표시됩니다.
                </p>
                <ul className="flex flex-wrap justify-center gap-2">
                  {/* <li>
                    <Button
                      variant="outline"
                      className="border-primary-500 text-primary-500 hover:text-primary-500 rounded-full hover:bg-white"
                    >
                      #{"번호"}
                    </Button>
                  </li> */}
                  {VariableList.map((variable) => (
                    <li key={variable}>
                      <Button variant="outline" className="rounded-full">
                        {"# " + variable}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* <ul className="rounded-md border-gray-300 bg-yellow-50 p-4">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-[#46474c]" />
                <p className="font-apple-medium text-sm text-[#46474c]">
                  <strong>변수</strong>를 사용하면 고객별로 맞춤 메시지를 보낼
                  수 있어요
                </p>
              </li>
            </ul>{" "} */}
            <ul className="bg-point-gray-200 rounded-md border-gray-300 p-4">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-[#46474c]" />
                <p className="font-apple-medium text-sm text-[#46474c]">
                  <strong>변수</strong>를 사용하면 고객별로 맞춤 메시지를 보낼
                  수 있어요
                </p>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-[#46474c]" />
                <p className="font-apple-medium text-sm text-[#46474c]">
                  <strong>변수</strong>를 클릭하면 문자 내용에 포함됩니다.
                </p>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-[#46474c]" />
                <p className="font-apple-medium text-sm text-[#46474c]">
                  <strong>변수</strong>를 클릭하면 치환된 결과가 미리보기에
                  보여집니다.
                </p>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-4 rounded-md bg-white p-7 shadow-sm">
            <StepHeader number={5} title="발송 일시 선택" />
            <RadioGroup
              value={sendTiming}
              onValueChange={(value) => {
                if (value === "NOW" || value === "RESERVATION") {
                  setSendTiming(value);
                }
              }}
              className="flex"
            >
              <FieldLabel htmlFor="NOW">
                <Field orientation="horizontal">
                  <RadioGroupItem value="NOW" id="NOW" />
                  <FieldContent>
                    <FieldTitle>즉시 발송</FieldTitle>
                    <FieldDescription>검토 후 바로 발송</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="RESERVATION">
                <Field orientation="horizontal">
                  <RadioGroupItem value="RESERVATION" id="RESERVATION" />
                  <FieldContent>
                    <FieldTitle>예약 발송</FieldTitle>
                    <FieldDescription>
                      원하는 날짜와 시간 예약 발송
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </RadioGroup>
            {sendTiming === "RESERVATION" && (
              <div className="bg-point-gray-100 flex items-center gap-3 rounded-md p-6">
                {/* 예약 날짜 */}
                <Field className="flex flex-1 flex-col">
                  <FieldLabel htmlFor="date">예약 날짜</FieldLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="justify-start font-normal"
                      >
                        {date ? date.toLocaleDateString() : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        defaultMonth={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setDate(date);
                          setOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
                {/* 예약 시간 */}
                <TimePicker className="flex flex-1 flex-col gap-3">
                  <TimePickerLabel>예약 시간</TimePickerLabel>
                  <TimePickerInputGroup className="h-[36px]">
                    <TimePickerInput segment="hour" />
                    <TimePickerSeparator />
                    <TimePickerInput segment="minute" />
                    <TimePickerInput segment="period" />
                    <TimePickerTrigger />
                  </TimePickerInputGroup>
                  <TimePickerContent>
                    <TimePickerHour />
                    <TimePickerMinute />
                    <TimePickerPeriod />
                  </TimePickerContent>
                </TimePicker>
              </div>
            )}
          </div>
        </div>

        {/* 발송 미리보기 + 발송 버튼*/}
        <div className="sticky top-0 flex w-1/3 flex-col gap-6 rounded-md bg-white p-7 shadow-sm">
          <div className="flex items-center justify-center gap-2">
            <MessageSquareTextIcon className="text-primary-500 size-5" />
            <p> 발송 미리보기</p>
          </div>
          <div className="h-80 rounded-xl border border-gray-200"></div>
          <div className="h-40 rounded-xl border border-gray-200"></div>

          {/* 발송 버튼 */}
          <Button variant="default" className="w-full" size="lg">
            발송하기
          </Button>
        </div>
      </div>
    </section>
  );
}
