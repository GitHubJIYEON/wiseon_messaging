import { useMemo, useRef, useState } from "react";
import {
  CalendarClockIcon,
  CoinsIcon,
  MessageSquareTextIcon,
  PlusIcon,
  SendIcon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

const senderPhoneOptions = [
  { value: "main", label: "대표 발신번호 02-6321-4141" },
  { value: "cs", label: "고객센터 02-1234-5678" },
  { value: "marketing", label: "마케팅 전용 070-9876-1234" },
];

const addressBookOptions = [
  {
    value: "new",
    label: "신규 가입 고객",
    count: 340,
    variables: [
      { key: "name", label: "이름", token: "#{이름}" },
      { key: "signupDate", label: "가입일", token: "#{가입일}" },
      { key: "coupon", label: "쿠폰명", token: "#{쿠폰명}" },
      { key: "surveyLink", label: "설문 링크", token: "#{설문 링크}" },
      { key: "surveyDeadline", label: "설문 마감일", token: "#{설문 마감일}" },
      { key: "surveyResult", label: "설문 결과", token: "#{설문 결과}" },
    ],
    previewRecipientName: "박서준",
    previewRecipient: {
      name: "박서준",
      signupDate: "2026-03-14",
      coupon: "웰컴 10% 할인쿠폰",
      surveyLink: "https://www.google.com",
      surveyDeadline: "2026-03-22",
      surveyResult: "https://www.google.com",
      e: "https://www.google.com",
    },
  },
  {
    value: "event",
    label: "이벤트 신청자",
    count: 892,
    variables: [
      { key: "name", label: "이름", token: "#{이름}" },
      { key: "eventName", label: "이벤트명", token: "#{이벤트명}" },
      { key: "reservationDate", label: "예약일", token: "#{예약일}" },
    ],
    previewRecipientName: "최유진",
    previewRecipient: {
      name: "최유진",
      eventName: "봄 프로모션 설명회",
      reservationDate: "2026-03-22",
    },
  },
  {
    value: "no value",
    label: "변수 없는 주소록",
    count: 892,
    variables: [],
    previewRecipientName: "이름",
    previewRecipient: {
      name: "이름",
    },
  },
] as const;

const rejectNumberOptions = [
  { value: "080-123-4567", label: "080-123-4567" },
  { value: "080-555-1234", label: "080-555-1234" },
];

const messageFormatOptions = [
  {
    value: "sms",
    label: "SMS",
    description: "90byte 이하 단문 발송",
    pricing: "50건 이하 무료, 초과 시 9.9원/건",
    byteLimit: 90,
    freeLimit: 50,
    unitPrice: 9.9,
  },
  {
    value: "lms",
    label: "LMS",
    description: "2000byte 이하 장문 발송",
    pricing: "10건 이하 무료, 초과 시 33원/건",
    byteLimit: 2000,
    freeLimit: 10,
    unitPrice: 33,
  },
] as const;

export default function SendSmsPage() {
  const messageBodyRef = useRef<HTMLTextAreaElement>(null);
  const [senderPhone, setSenderPhone] = useState("main");
  const [messageFormat, setMessageFormat] = useState<"sms" | "lms">("lms");
  const [messageType, setMessageType] = useState<"ad" | "info">("info");
  const [addressBook, setAddressBook] = useState("");
  const [rejectNumber, setRejectNumber] = useState("080-123-4567");
  const [brandName, setBrandName] = useState("WISEON");
  const [messageTitle, setMessageTitle] = useState("3월 고객 감사 혜택 안내");
  const [messageBody, setMessageBody] = useState(
    "#{이름}님, 안녕하세요.\n#{쿠폰명}이 발급되었습니다.\n지금 접속하시면 바로 사용하실 수 있습니다.",
  );
  const [sendTiming, setSendTiming] = useState<"now" | "reserved">("now");
  const [reservedDate, setReservedDate] = useState("2026-03-20");
  const [reservedTime, setReservedTime] = useState("14:00");

  const handleSend = () => {
    console.log("발송하기");
  };

  const selectedAddressBook = useMemo(() => {
    return addressBookOptions.find((item) => item.value === addressBook);
  }, [addressBook]);
  const selectedMessageFormat = useMemo(() => {
    return messageFormatOptions.find((item) => item.value === messageFormat);
  }, [messageFormat]);
  const availableVariables = selectedAddressBook?.variables ?? [];
  const variablePreviewItems = availableVariables.map((variable) => ({
    token: variable.token,
    label: variable.label,
    example:
      selectedAddressBook?.previewRecipient[
        variable.key as keyof typeof selectedAddressBook.previewRecipient
      ] ?? "",
  }));

  const recipientCount = selectedAddressBook?.count ?? 0;
  const messageLength = messageBody.length;
  const messageByteLength = new TextEncoder().encode(messageBody).length;
  const byteLimit = selectedMessageFormat?.byteLimit ?? 90;
  const freeLimit = selectedMessageFormat?.freeLimit ?? 0;
  const unitPrice = selectedMessageFormat?.unitPrice ?? 0;
  const estimatedCost =
    recipientCount <= freeLimit
      ? 0
      : Math.round(recipientCount * unitPrice * 10) / 10;
  const previewBody = variablePreviewItems.reduce(
    (acc, variable) => acc.replaceAll(variable.token, variable.example),
    messageBody,
  );

  const handleInsertVariable = (token: string) => {
    const textarea = messageBodyRef.current;

    if (!textarea) {
      setMessageBody((prev) => `${prev}${token}`);
      return;
    }

    const selectionStart = textarea.selectionStart ?? messageBody.length;
    const selectionEnd = textarea.selectionEnd ?? messageBody.length;
    const nextMessageBody =
      messageBody.slice(0, selectionStart) +
      token +
      messageBody.slice(selectionEnd);

    setMessageBody(nextMessageBody);

    requestAnimationFrame(() => {
      const nextCursorPosition = selectionStart + token.length;
      textarea.focus();
      textarea.setSelectionRange(nextCursorPosition, nextCursorPosition);
    });
  };

  return (
    <section className="mx-auto w-[1280px] pt-10 pb-[30px]">
      <div className="mb-8">
        <h1 className="font-apple-ultra text-center text-[32px] leading-[45px] text-[#1B1D21]">
          문자 보내기
        </h1>
        <p className="font-apple-light mt-3 text-center text-[16px] leading-6 text-gray-500">
          발신 정보, 발송 대상, 메시지 내용, 예약 시간을 한 화면에서 설정하고
          바로 미리보기로 검토할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <section className="rounded-[16px] border border-gray-300 bg-white p-8">
            <div className="mb-6">
              <h2 className="font-apple-medium text-[22px] leading-7 text-gray-700">
                발송 대상 선택
              </h2>
              <p className="font-apple-light mt-2 text-[14px] leading-5 text-gray-500">
                주소록을 선택하면 예상 발송 대상자 수와 포인트가 함께
                계산됩니다.
              </p>
            </div>

            <div className="grid grid-cols-[1fr_220px] gap-5">
              <FieldBlock label="보낼 연락처">
                <Select value={addressBook} onValueChange={setAddressBook}>
                  <SelectTrigger className="h-11 w-full bg-white">
                    <SelectValue placeholder="주소록 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {addressBookOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBlock>

              <div className="bg-point-gray-100 rounded-[12px] px-5 py-4">
                <p className="font-apple-light text-[13px] leading-5 text-gray-500">
                  선택 대상
                </p>
                <p className="font-apple-medium mt-2 text-[28px] leading-8 text-gray-700">
                  {recipientCount.toLocaleString()}명
                </p>
                <p className="font-apple-light mt-2 text-[13px] leading-5 text-gray-500">
                  중복/수신거부 대상은 발송 시 자동 제외 가능
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[16px] border border-gray-300 bg-white p-8">
            <div className="mb-6">
              <h2 className="font-apple-medium text-[22px] leading-7 text-gray-700">
                발송 기본 설정
              </h2>
              <p className="font-apple-light mt-2 text-[14px] leading-5 text-gray-500">
                발신번호와 메시지 유형을 먼저 선택하면 이후 설정이 더
                쉬워집니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <FieldBlock label="발신번호">
                <Select value={senderPhone} onValueChange={setSenderPhone}>
                  <SelectTrigger className="h-11 w-full bg-white">
                    <SelectValue placeholder="발신번호 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {senderPhoneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBlock>

              <FieldBlock label="광고문자 여부" className="col-span-2">
                <RadioCardGroup
                  value={messageType}
                  onValueChange={(value) =>
                    setMessageType(value as "ad" | "info")
                  }
                  options={[
                    {
                      value: "info",
                      label: "정보성 문자",
                      description: "주문, 인증, 안내 등 필수 고지",
                    },
                    {
                      value: "ad",
                      label: "광고 문자",
                      description: "(광고) 표기 및 수신거부 문구 포함",
                    },
                  ]}
                />
              </FieldBlock>
            </div>
          </section>

          <section className="rounded-[16px] border border-gray-300 bg-white p-8">
            <div className="mb-6">
              <h2 className="font-apple-medium text-[22px] leading-7 text-gray-700">
                보낼 내용 작성
              </h2>
              <p className="font-apple-light mt-2 text-[14px] leading-5 text-gray-500">
                수신거부 번호, 상호명, 제목, 본문을 입력하고 우측 미리보기에서
                즉시 확인하세요.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <FieldBlock label="메시지 유형" className="col-span-2">
                <RadioCardGroup
                  value={messageFormat}
                  onValueChange={(value) =>
                    setMessageFormat(value as "sms" | "lms")
                  }
                  options={messageFormatOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                    description: `${option.description} · ${option.pricing}`,
                  }))}
                />
              </FieldBlock>

              <FieldBlock label="수신거부 번호">
                <Select value={rejectNumber} onValueChange={setRejectNumber}>
                  <SelectTrigger className="h-11 w-full bg-white">
                    <SelectValue placeholder="수신거부 번호 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {rejectNumberOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBlock>

              <FieldBlock label="상호명">
                <Input
                  value={brandName}
                  onChange={(event) => setBrandName(event.target.value)}
                  className="h-11 bg-white"
                  placeholder="상호명 입력"
                />
              </FieldBlock>

              <FieldBlock label="제목" className="col-span-2">
                <Input
                  value={messageTitle}
                  onChange={(event) => setMessageTitle(event.target.value)}
                  className="h-11 bg-white"
                  placeholder="제목 입력"
                />
              </FieldBlock>

              <FieldBlock label="본문" className="col-span-2">
                {availableVariables.length > 0 && (
                  <div className="bg-point-gray-100 mb-4 rounded-[12px] border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-apple-medium text-[14px] leading-5 text-gray-700">
                          사용 가능한 변수
                        </p>
                        {availableVariables.length > 0 && (
                          <p className="font-apple-light mt-1 text-[13px] leading-5 text-gray-500">
                            {selectedAddressBook?.label}의 컬럼 값을 본문에
                            삽입할 수 있습니다.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {availableVariables.map((variable) => (
                        <button
                          key={variable.token}
                          type="button"
                          className="border-primary-200 text-primary-600 inline-flex cursor-pointer items-center gap-1 rounded-full border bg-white px-3 py-1.5 text-[13px] leading-5"
                          onClick={() => handleInsertVariable(variable.token)}
                        >
                          <PlusIcon className="size-3.5" />
                          {variable.token}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 rounded-[10px] bg-white px-3 py-2 text-[12px] leading-5 text-gray-500">
                      변수를 클릭하면 현재 커서 위치에 삽입되고, 우측
                      미리보기에는 예시 수신자 기준으로 치환 결과가 표시됩니다.
                    </div>
                  </div>
                )}

                <Textarea
                  ref={messageBodyRef}
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  className="min-h-[220px] resize-none bg-white"
                  placeholder="메시지 본문을 입력해주세요."
                />
                <div className="mt-2 flex items-center justify-between text-[13px] leading-5 text-gray-500">
                  <span>
                    변수는 실제 발송 시 수신자 데이터로 치환됩니다.
                    {selectedMessageFormat && (
                      <>
                        현재 {selectedMessageFormat.label} 기준 {byteLimit}byte
                        이하 권장
                      </>
                    )}
                  </span>
                  <span>
                    {messageLength.toLocaleString()}자 /{" "}
                    {messageByteLength.toLocaleString()}byte
                  </span>
                </div>
                {messageByteLength > byteLimit && (
                  <p className="text-danger-500 mt-2 text-[13px] leading-5">
                    현재 본문은 {selectedMessageFormat?.label} 기준 권장
                    바이트를 초과했습니다. 메시지 유형을 변경하거나 내용을
                    줄여주세요.
                  </p>
                )}
              </FieldBlock>
            </div>
          </section>

          <section className="rounded-[16px] border border-gray-300 bg-white p-8">
            <div className="mb-6">
              <h2 className="font-apple-medium text-[22px] leading-7 text-gray-700">
                발송 시간 설정
              </h2>
              <p className="font-apple-light mt-2 text-[14px] leading-5 text-gray-500">
                즉시 발송 또는 예약 발송을 선택할 수 있습니다.
              </p>
            </div>

            <div className="space-y-5">
              <RadioCardGroup
                value={sendTiming}
                onValueChange={(value) =>
                  setSendTiming(value as "now" | "reserved")
                }
                options={[
                  {
                    value: "now",
                    label: "즉시 발송",
                    description: "검토 후 바로 발송합니다.",
                  },
                  {
                    value: "reserved",
                    label: "예약 발송",
                    description: "원하는 날짜와 시간에 예약합니다.",
                  },
                ]}
              />

              {sendTiming === "reserved" && (
                <div className="bg-point-gray-100 grid grid-cols-2 gap-5 rounded-[12px] p-5">
                  <FieldBlock label="예약 날짜">
                    <Input
                      type="date"
                      value={reservedDate}
                      onChange={(event) => setReservedDate(event.target.value)}
                      className="h-11 bg-white"
                    />
                  </FieldBlock>
                  <FieldBlock label="예약 시간">
                    <Input
                      type="time"
                      value={reservedTime}
                      onChange={(event) => setReservedTime(event.target.value)}
                      className="h-11 bg-white"
                    />
                  </FieldBlock>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="sticky top-6 h-fit space-y-6 self-start">
          <section className="rounded-[16px] border border-gray-300 bg-white p-6">
            <div className="mb-5 flex items-center gap-2">
              <MessageSquareTextIcon className="text-primary-500 size-5" />
              <h2 className="font-apple-medium text-[18px] leading-6 text-gray-700">
                발송 미리보기
              </h2>
            </div>

            <div className="rounded-[28px] bg-[#F4F6FA] p-4">
              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between text-[12px] text-gray-500">
                  <span>{brandName || "상호명"}</span>
                  <span>{messageLength}자</span>
                </div>

                <div className="rounded-[18px] bg-[#F8FAFC] px-4 py-3 text-[14px] leading-6 text-gray-700">
                  {messageType === "ad" && (
                    <p className="text-primary-600 mb-2 font-medium">(광고)</p>
                  )}
                  {messageTitle && (
                    <p className="font-apple-medium mb-2 text-[15px] leading-6 text-gray-700">
                      {messageTitle}
                    </p>
                  )}
                  <p className="whitespace-pre-line">
                    {previewBody || "메시지 본문을 입력해주세요."}
                  </p>
                  {messageType === "ad" && (
                    <p className="mt-3 text-[12px] leading-5 text-gray-500">
                      무료수신거부 {rejectNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-primary-50 mt-4 rounded-[12px] px-4 py-3">
              <div className="text-primary-600 mb-2 flex items-center gap-2">
                <SparklesIcon className="size-4" />
                <span className="font-apple-medium text-[13px] leading-5">
                  변수 미리보기
                </span>
              </div>
              <div className="space-y-1 text-[13px] leading-5 text-gray-600">
                {variablePreviewItems.map((item) => (
                  <p key={item.token}>
                    {item.token} ({item.label}) = {item.example}
                  </p>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[16px] border border-gray-300 bg-white p-6">
            <div className="space-y-4">
              <SummaryRow
                icon={<CoinsIcon className="text-primary-500 size-4" />}
                label="보유 포인트"
                value="124,500 P"
              />
              <SummaryRow
                icon={<SendIcon className="text-primary-500 size-4" />}
                label="예상 발송 대상"
                value={`${recipientCount.toLocaleString()}명`}
              />
              <SummaryRow
                icon={
                  <MessageSquareTextIcon className="text-primary-500 size-4" />
                }
                label={`예상 차감 포인트 (${messageFormat.toUpperCase()})`}
                value={`${estimatedCost.toLocaleString()} P`}
              />
              <SummaryRow
                icon={<CalendarClockIcon className="text-primary-500 size-4" />}
                label="발송 시점"
                value={
                  sendTiming === "now"
                    ? "즉시 발송"
                    : `${reservedDate} ${reservedTime}`
                }
              />
            </div>

            <div className="mt-6 space-y-3">
              <Button variant="outline" className="h-11 w-full bg-white">
                테스트 발송
              </Button>
              <Button className="h-12 w-full text-[15px]" onClick={handleSend}>
                발송하기
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

interface FieldBlockProps {
  label: string;
  className?: string;
  children: React.ReactNode;
}

function FieldBlock({ label, className, children }: FieldBlockProps) {
  return (
    <div className={className}>
      <p className="font-apple-medium mb-2 text-[14px] leading-5 text-gray-700">
        {label}
      </p>
      {children}
    </div>
  );
}

interface RadioCardOption {
  value: string;
  label: string;
  description: string;
}

interface RadioCardGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  options: RadioCardOption[];
}

function RadioCardGroup({
  value,
  onValueChange,
  options,
}: RadioCardGroupProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      className="grid grid-cols-2 gap-3"
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex cursor-pointer items-start gap-3 rounded-[12px] border border-gray-300 px-4 py-4 ${
            value === option.value ? "bg-point-gray-100" : "bg-white"
          }`}
        >
          <RadioGroupItem value={option.value} className="mt-1" />
          <div>
            <p className="font-apple-medium text-[14px] leading-5 text-gray-700">
              {option.label}
            </p>
            <p className="font-apple-light mt-1 text-[13px] leading-5 text-gray-500">
              {option.description}
            </p>
          </div>
        </label>
      ))}
    </RadioGroup>
  );
}

interface SummaryRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function SummaryRow({ icon, label, value }: SummaryRowProps) {
  return (
    <div className="bg-point-gray-100 flex items-center justify-between rounded-[12px] px-4 py-3">
      <div className="flex items-center gap-2 text-gray-600">
        {icon}
        <span className="text-[13px] leading-5">{label}</span>
      </div>
      <span className="font-apple-medium text-[14px] leading-5 text-gray-700">
        {value}
      </span>
    </div>
  );
}
