import { useState } from "react";
import {
  Bell,
  Check,
  CircleAlert,
  MessageSquareTextIcon,
  Plus,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { StepHeader } from "@/shared/components/ui/step-header";
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

const RejectNumber = [
  { value: "reject", label: "와이즈온 수신거부번호", number: "02-6321-4141" },
  {
    value: "more",
    label: "신규",
    number: "+ 수신거부번호 등록하기",
  },
];

export default function SmsPage() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [sendTiming, setSendTiming] = useState<"NOW" | "RESERVATION">("NOW");
  const [rejectNumber, setRejectNumber] = useState<string>("02-1234-1234");
  const [isAdvertising, setIsAdvertising] = useState<"COMM" | "AD">("COMM");
  const [isLMS, setIsLMS] = useState(false);

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
            <div></div>
            <ul className="bg-point-gray-200 rounded-md border-gray-300 p-4">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-[#46474c]" />
                <p className="font-apple-medium text-sm text-[#46474c]">
                  중복/수신거부 대상은 발송 시 자동 제외
                </p>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-4 rounded-md bg-white p-7 shadow-sm">
            <StepHeader number={4} title="문자 내용 작성" />
            {/* 메시지 타입 - SMS, LMS */}
            <RadioGroup defaultValue="SMS" className="flex">
              <FieldLabel htmlFor="SMS" onClick={() => setIsLMS(true)}>
                <Field orientation="horizontal">
                  <RadioGroupItem value="SMS" id="SMS" />
                  <FieldContent>
                    <FieldTitle>SMS (단문)</FieldTitle>
                    <FieldDescription>90byte 이하 단문 발송</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="LMS" onClick={() => setIsLMS(false)}>
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
            {!isLMS && (
              <div className="flex flex-row gap-3 border-dotted border-gray-300">
                <Empty className="w-1/3 gap-0 border p-0">
                  <EmptyHeader>
                    <EmptyMedia
                      variant="icon"
                      className="bg-primary-500 size-8 rounded-full text-white"
                    >
                      <Plus className="size-4 text-white" />
                    </EmptyMedia>
                  </EmptyHeader>
                  <EmptyTitle className="text-sm">이미지 (1/3)</EmptyTitle>
                  <EmptyDescription>JPG, PNG, GIF</EmptyDescription>
                </Empty>
                <Empty className="gap-0 border p-0">
                  <EmptyHeader>
                    <EmptyMedia
                      variant="icon"
                      className="bg-primary-500 size-8 rounded-full text-white"
                    >
                      <Plus className="size-4 text-white" />
                    </EmptyMedia>
                  </EmptyHeader>
                  <EmptyTitle className="text-sm">이미지 (2/3)</EmptyTitle>
                  <EmptyDescription>JPG, PNG, GIF</EmptyDescription>
                </Empty>
                <Empty className="gap-0 border p-0">
                  <EmptyHeader>
                    <EmptyMedia
                      variant="icon"
                      className="bg-primary-500 size-8 rounded-full text-white"
                    >
                      <Plus className="size-4 text-white" />
                    </EmptyMedia>
                  </EmptyHeader>
                  <EmptyTitle className="text-sm">이미지 (3/3)</EmptyTitle>
                  <EmptyDescription>JPG, PNG, GIF</EmptyDescription>
                </Empty>
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
                <FieldDescription>
                  변수는 실제 발송 시 수신자 데이터로 치환됩니다.
                </FieldDescription>
              </Field>
            </FieldGroup>
            <div className="bg-point-gray-100 rounded-md border p-4">
              <p className="font-apple-medium text-sm text-gray-700">
                사용 가능한 변수
              </p>
              <div className="flex flex-col gap-2">
                <p className="font-apple-medium text-sm text-gray-600">
                  변수를 클릭하면 치환된 결과가 미리보기에 표시됩니다.
                </p>
                <ul className="flex flex-wrap gap-2">
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
            </div>
            <ul className="rounded-md border-gray-300 bg-yellow-50 p-4">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-[#46474c]" />
                <p className="font-apple-medium text-sm text-[#46474c]">
                  <strong>변수</strong>를 사용하면 고객별로 맞춤 메시지를 보낼
                  수 있어요
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
