import { useRef, useState, type ChangeEvent } from "react";
import {
  CheckCircle2Icon,
  DownloadIcon,
  ExternalLinkIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Badge } from "@/shared/components/ui/badge";
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
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { downloadBlobAsFile } from "@/shared/utils/downloadFiles";

interface AgreementItem {
  id: string;
  label: string;
  required: boolean;
  detail: string[];
}

const AGREEMENT_ITEMS: AgreementItem[] = [
  {
    id: "privacy",
    label: "발신번호 사전등록제 시행 안내",
    required: true,
    detail: [
      "전기통신사업법 제 84조 2(전화번호의 거짓표기 금지 및 이용자보호)에 의거하여 모든 인터넷 발송 문자메시지 이용자는 **사전에 등록된 발신번호로만 메시지를 전송**할 수 있으며 사전에 등록되지 않은 발신(회신)번호로는 문자전송이 제한됩니다.",
      "사전에 등록된 발신번호가 변작으로 의심되어 KISA(한국인터넷진흥원)로부터 소명요청을 받을 경우, 서비스의 제공이 즉각 중지 처리 될 수 있습니다.",
      "또한, [거짓으로 표시된 전화번호로 인한 이용자의 피해 예방 등에 관한 고시] 개정에 따라 발신번호 추가 등록 방법 및 등록 서류가 강화되어 **통신서비스 이용증명원**을 필수로 제출하여야 합니다.",
    ],
  },
  {
    id: "verification",
    label: "발신번호 변작방지 및 불법 스팸 방지를 위한 법령 준수",
    required: true,
    detail: [
      "**전기통신사업법 제 84조2 전화번호의 거짓표시 금지 및 이용자 보호 법령에 따라 등록하시는 발신번호가 법령에 위반되는 경우 문자 메시지 전송 및 서비스 이용이 제한됩니다.**",
      "제84조의 2제를 위반하여 전화번호를 변작하는 등 거짓으로 표시한 자는 제95조의2(벌칙)에 의거 3년 이하의 징역 또는 1억5천만원 이하의 벌금이 부과 징수될 수 있음을 알려드립니다.",
      "변작이 의심될 경우 한국인터넷진흥원(KISA)에 발신지 변작 여부를 확인 후 변작되었다고 판단되면 발송이 제한됩니다.",
      "**'불법스팸 방지를 위한 정보통신망법 안내서' 에 명시된 내용을 숙지하시어 불법스팸 발송에 따른 불이익을 받지 않도록 유념하여 주시기 바랍니다.**",
      "스팸 신고 및 스미싱 등의 법률 위반에 따른 신고건 접수 시 사전통보 없이 서비스 이용이 제한되며, 수사기관의 의뢰가 있는 경우 명의자의 정보가 정보통신망법에 따라 수사 기관으로 전달 될 수 있습니다.",
    ],
  },
  {
    id: "sendNumber",
    label: "발신번호 등록 세칙",
    required: true,
    detail: [
      "1. 유선전화번호 : 지역번호 포함하여 등록 (예 : 031-YYY-YYYY)",
      "2. 이동통신전화번호 : 010-ABYY-YYYY 11자리 등록만 가능",
    ],
  },
  {
    id: "responsibility",
    label: "제출 서류의 사실 확인 및 책임 동의",
    required: true,
    detail: [
      "제출하신 모든 서류 및 정보가 사실임을 확인합니다. 허위 서류 제출 시 발신번호 등록이 반려되며, 관련 법령에 따라 불이익을 받을 수 있습니다.",
    ],
  },
];

interface FileAttachment {
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

const createInitialAttachments = (): FileAttachment[] => [
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
    accept: ".pdf,.jpg,.jpeg,.png, .docx, .doc",
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

const extractDigits = (value: string) => value.replace(/\D/g, "");

const formatPhoneInput = (value: string) => {
  const digits = extractDigits(value);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

const isValidPhoneNumber = (digits: string) =>
  /^(0[2-6][1-5]?\d{7,8}|01[016789]\d{7,8}|050\d{8}|15\d{6}|16\d{6}|18\d{6})$/.test(
    digits,
  );

export default function CallingNumberRegisterPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"1" | "2">("1");

  const [agreements, setAgreements] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(AGREEMENT_ITEMS.map((item) => [item.id, false])),
  );
  const allAgreed = AGREEMENT_ITEMS.every((item) => agreements[item.id]);
  const requiredAllAgreed = AGREEMENT_ITEMS.filter((i) => i.required).every(
    (item) => agreements[item.id],
  );

  const [companyName, setCompanyName] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");

  const [attachments, setAttachments] = useState<FileAttachment[]>(
    createInitialAttachments,
  );
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [requestNote, setRequestNote] = useState("");
  const REQUEST_NOTE_MAX = 500;

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleToggleAll = (checked: boolean) => {
    setAgreements(
      Object.fromEntries(AGREEMENT_ITEMS.map((item) => [item.id, checked])),
    );
  };

  const handleToggleAgreement = (id: string, checked: boolean) => {
    setAgreements((prev) => ({ ...prev, [id]: checked }));
  };

  const isPhoneNumberValid =
    phoneNumber.trim() !== "" && isValidPhoneNumber(extractDigits(phoneNumber));

  const handleFileAttach = (
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

    setAttachments((prev) =>
      prev.map((a) => (a.id === attachmentId ? { ...a, file } : a)),
    );
  };

  const handleRemoveFile = (attachmentId: string) => {
    setAttachments((prev) =>
      prev.map((a) => (a.id === attachmentId ? { ...a, file: null } : a)),
    );
    const input = fileInputRefs.current[attachmentId];
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

  const isFormValid = () => {
    if (!requiredAllAgreed) return false;
    if (!companyName.trim()) return false;
    if (!isPhoneNumberValid) return false;

    const requiredAttachments = attachments.filter((a) => a.required);
    if (requiredAttachments.some((a) => a.file === null)) return false;

    return true;
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      toast.error("필수 입력 항목을 모두 작성해주세요.");
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    setIsConfirmDialogOpen(false);
    toast.success(
      "발신번호 신청이 접수되었습니다. 검수 후 결과를 안내드립니다.",
    );
    navigate("/messaging/calling-number/list");
  };

  const requiredAttachmentsComplete = attachments
    .filter((a) => a.required)
    .every((a) => a.file !== null);

  return (
    <>
      {step === "1" && (
        <section className="mx-auto flex w-[1200px] flex-col gap-8 pb-[30px]">
          {/* 페이지 타이틀 */}
          <div className="pt-10">
            <h1 className="font-apple-ultra text-center text-[32px] leading-[45px] text-[#1B1D21]">
              발신번호 신청하기
            </h1>
            {/* <p className="font-apple-light mt-3 text-center text-[16px] leading-6 text-gray-600">
            발신번호 등록 심사에 필요한 정보와 서류를 제출합니다. 심사 결과에
            따라 승인 또는 반려될 수 있습니다.
          </p> */}
          </div>

          <div className="rounded-[16px] border border-gray-300 bg-white p-8">
            <h4 className="font-apple-medium text-[18px] text-gray-800">
              발신번호 신청 안내
            </h4>

            <p className="font-apple-light mt-3 text-[14px] text-gray-800">
              발신번호 등록 심사에 필요한 정보와 서류를 제출합니다. 제출 후
              검수까지 영업일 기준 1~3일이 소요될 수 있습니다. <br /> 심사
              결과에 따라 승인 또는 반려될 수 있으며 반려된 사유는 발신번호 관리
              에서 확인할 수 있습니다. <br />
            </p>

            <div className="mt-6">
              <h4 className="font-apple-medium text-[18px] text-gray-800">
                신청 서류
              </h4>
              <p className="font-apple-light mt-3 text-[14px] text-gray-800">
                - 위임장{" "}
                <span className="text-gray-500">
                  (위임자의 인감으로 날인된 위임장){" "}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="ml-2 h-8 border-gray-600 px-3 text-[12px] text-gray-700 hover:bg-gray-100"
                  onClick={handleDownloadDelegationSample}
                >
                  <DownloadIcon className="size-3.5" />
                  양식 다운로드
                </Button>
                <br />
                - 사업자 등록증 <br /> - 통신 서비스 이용증명원{" "}
                <span className="text-primary-500">
                  (신청일 기준 1개월 이내 발급){" "}
                </span>{" "}
                <br /> - 대표자 신분증 또는 재직증명서{" "}
                <span className="text-gray-500">
                  (발신번호 소유자가 위임자의 임직원인 경우 재직증명서){" "}
                </span>{" "}
              </p>
              <p className="font-apple-light text-primary-500 mt-3 text-[14px]">
                * 서류는 3개월 이내 발급된 서류만 유효합니다.
              </p>

              <br />
              {/* <div className="mt-6">
                <h4 className="font-apple-medium text-[16px] text-gray-800">
                  통신서비스 이용증명원이란?
                </h4>

                <p className="font-apple-light mt-3 text-[14px] text-gray-800">
                  전기통신사업자가 이용자 본인이 사용하는 전화본호임을 증명하기
                  위해 발급하는 서류입니다.
                  <br />
                  사용하는 전화번호임을 증명하기 위해 발급하는 서류입니다.
                  가입자의 통신사명, 가입자의 성명/주소/생년원일(기업회원의 경우
                  사업자등록번호), 가입자 통신 서비스 종류(유선, 무선, 인터넷
                  전화 등) 및 전화번호가 포함되어 있어야 하며, 등록 신청일
                  기준으로 1개월 이내 발급된 서류여야만 합니다.
                  <br /> 자세한 사항은 가입한 통신사 고객센터에 문의하시기
                  바랍니다.
                </p>
              </div>
              <div className="mt-6">
                <h4 className="font-apple-medium text-[16px] text-gray-800">
                  발신번호 변작방지 및 불법 스팸 방지를 위한 법령 준수
                </h4>

                <div className="mt-3 flex w-full flex-row flex-wrap gap-2">
                  <Button variant="outline">
                    전기통신사업법 제 84조 확인하러 가기{" "}
                    <ExternalLinkIcon className="size-3" />
                  </Button>
                  <Button variant="outline">
                    전기통신사업법 제 95조(벌칙) 확인하러 가기{" "}
                    <ExternalLinkIcon className="size-3" />
                  </Button>
                  <Button variant="outline">
                    불법스팸 방지를 위한 정보통신망법 안내서{" "}
                    <DownloadIcon className="size-3.5" />
                  </Button>
                </div>
              </div> */}
            </div>
          </div>

          <div className="rounded-[16px] border border-gray-300 bg-white p-8">
            <div>
              <h4 className="font-apple-medium text-[16px] text-gray-800">
                통신서비스 이용증명원이란?
              </h4>

              <p className="font-apple-light mt-3 text-[14px] text-gray-800">
                전기통신사업자가 이용자 본인이 사용하는 전화본호임을 증명하기
                위해 발급하는 서류입니다.
                <br />
                사용하는 전화번호임을 증명하기 위해 발급하는 서류입니다.
                가입자의 통신사명, 가입자의 성명/주소/생년원일(기업회원의 경우
                사업자등록번호), 가입자 통신 서비스 종류(유선, 무선, 인터넷 전화
                등) 및 전화번호가 포함되어 있어야 하며, 등록 신청일 기준으로
                1개월 이내 발급된 서류여야만 합니다.
                <br /> 자세한 사항은 가입한 통신사 고객센터에 문의하시기
                바랍니다.
              </p>
            </div>

            <div className="mt-6">
              <h4 className="font-apple-medium text-[16px] text-gray-800">
                발신번호 변작방지 및 불법 스팸 방지를 위한 법령 준수
              </h4>

              <div className="mt-3 flex w-full flex-row flex-wrap gap-2">
                <Button variant="outline">
                  전기통신사업법 제 84조 확인하러 가기{" "}
                  <ExternalLinkIcon className="size-3" />
                </Button>
                <Button variant="outline">
                  전기통신사업법 제 95조(벌칙) 확인하러 가기{" "}
                  <ExternalLinkIcon className="size-3" />
                </Button>
                <Button variant="outline">
                  불법스팸 방지를 위한 정보통신망법 안내서{" "}
                  <DownloadIcon className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="rounded-[16px] border border-gray-300 bg-white p-8">
            <h4 className="font-apple-medium text-[16px] text-gray-800">
              문의
            </h4>
            <p className="font-apple-light mt-3 text-[14px] text-gray-800">
              전화번호: 02-1234-5678 <br /> 이메일: info@example.com
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              variant="dark"
              className="h-[44px] min-w-[100px]"
              onClick={() => setStep("2")}
            >
              시작하기
            </Button>
          </div>
        </section>
      )}
      {step === "2" && (
        <section className="mx-auto flex w-[1200px] flex-col gap-8 pb-[30px]">
          {/* 페이지 타이틀 */}
          <div className="pt-10">
            <h1 className="font-apple-ultra text-center text-[32px] leading-[45px] text-[#1B1D21]">
              발신번호 신청
            </h1>
            {/* <p className="font-apple-light mt-3 text-center text-[16px] leading-6 text-gray-600">
            발신번호 등록 심사에 필요한 정보와 서류를 제출합니다. 심사 결과에
            따라 승인 또는 반려될 수 있습니다.
          </p> */}
          </div>

          {/* 1. 이용 동의 */}
          <article className="rounded-[16px] border border-gray-300 bg-white p-8">
            <SectionHeader number={1} title="이용 동의" />

            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-center gap-3 border-gray-200 pb-4">
                <Checkbox
                  id="agree-all"
                  checked={allAgreed}
                  onCheckedChange={(checked) =>
                    handleToggleAll(checked === true)
                  }
                />
                <Label
                  htmlFor="agree-all"
                  className="font-apple-medium cursor-pointer text-[15px] text-gray-800"
                >
                  전체 동의
                </Label>
              </div>

              <Accordion type="multiple" className="mt-2">
                {AGREEMENT_ITEMS.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <div className="flex items-center gap-3 py-1">
                      <Checkbox
                        id={`agree-${item.id}`}
                        checked={agreements[item.id]}
                        onCheckedChange={(checked) =>
                          handleToggleAgreement(item.id, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`agree-${item.id}`}
                        className="font-apple-light flex-1 cursor-pointer text-[14px] text-gray-700"
                      >
                        {item.label}
                      </Label>
                      {item.required && (
                        <Badge
                          variant="outline"
                          className="border-red-200 bg-red-50 text-[11px] text-red-500"
                        >
                          필수
                        </Badge>
                      )}
                      <AccordionTrigger className="py-0 hover:no-underline" />
                    </div>
                    <AccordionContent className="ml-7 space-y-2 text-[13px] leading-5 text-gray-600">
                      {item.detail.map((line, i) => (
                        <p key={i}>{renderBoldText(line)}</p>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </article>

          {/* 2. 신청자 정보 */}
          <article className="rounded-[16px] border border-gray-300 bg-white p-8">
            <SectionHeader number={2} title="신청자 정보" />

            <div className="mt-6 space-y-4">
              <div className="max-w-[480px] space-y-2">
                <div className="flex items-center gap-1">
                  <Label
                    htmlFor="company-name"
                    className="font-apple-medium text-[14px] text-gray-700"
                  >
                    이름 (법인명)
                  </Label>
                  <span className="text-[12px] text-red-500">*</span>
                </div>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="개인: 이름 / 법인: 법인명을 입력해주세요"
                  className="h-[42px] max-w-[480px]"
                />
                <p className="font-apple-light text-[12px] text-gray-600">
                  개인 신청 시 본인 이름, 법인 신청 시 법인명을 입력합니다.
                </p>
              </div>
            </div>
          </article>

          {/* 3. 발신번호 입력 */}
          <article className="rounded-[16px] border border-gray-300 bg-white p-8">
            <SectionHeader
              number={3}
              title="발신번호 입력"
              badge={isPhoneNumberValid ? "입력 완료" : undefined}
              badgeColor={isPhoneNumberValid ? "green" : undefined}
            />

            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-1">
                <Label className="font-apple-medium text-[14px] text-gray-700">
                  발신번호
                </Label>
                <span className="text-[12px] text-red-500">*</span>
              </div>
              <Input
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(formatPhoneInput(e.target.value))
                }
                placeholder="예: 02-1234-5678, 010-1234-5678"
                className="h-[42px] max-w-[480px]"
                maxLength={15}
              />
              <p className="font-apple-light text-[12px] text-gray-600">
                통신 서비스 이용증명원 첨부 서류와 일치하는 전화번호를
                입력해주세요.
              </p>
              {phoneNumber.trim() !== "" && !isPhoneNumberValid && (
                <p className="font-apple-light text-[12px] text-red-500">
                  유효하지 않은 번호 형식입니다.
                </p>
              )}
            </div>
          </article>

          {/* 4. 첨부 서류 */}
          <article className="rounded-[16px] border border-gray-300 bg-white p-8">
            <div className="flex items-center justify-between">
              <SectionHeader
                number={4}
                title="첨부 서류"
                badge={requiredAttachmentsComplete ? "제출 완료" : undefined}
                badgeColor={requiredAttachmentsComplete ? "green" : undefined}
              />
            </div>

            <p className="font-apple-light mt-3 text-[13px] text-gray-600">
              허용 형식: PDF, JPG, PNG | 파일당 최대 {MAX_FILE_SIZE_MB}MB
            </p>

            <div className="mt-5 space-y-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-apple-medium text-[14px] text-gray-700">
                        {attachment.label}
                      </p>
                      {attachment.required ? (
                        <Badge
                          variant="outline"
                          className="border-red-200 bg-red-50 text-[11px] text-red-500"
                        >
                          필수
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-gray-200 bg-gray-100 text-[11px] text-gray-500"
                        >
                          선택
                        </Badge>
                      )}
                    </div>
                    <p className="font-apple-light mt-0.5 text-[12px] text-gray-500">
                      {attachment.description}
                      {attachment.guideUrl && (
                        <a
                          href={attachment.guideUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-600 ml-2 inline-flex items-center gap-0.5 underline underline-offset-2"
                        >
                          발급방법
                          <ExternalLinkIcon className="inline size-3" />
                        </a>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {attachment.id === "delegation" && (
                      <Button
                        type="button"
                        variant="outline"
                        className="text-primary-500 hover:bg-primary-50 h-8 px-3 text-[12px]"
                        onClick={handleDownloadDelegationSample}
                      >
                        <DownloadIcon className="size-3.5" />
                        양식 다운로드
                      </Button>
                    )}

                    {attachment.file ? (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[13px] text-green-600">
                          <CheckCircle2Icon className="size-4" />
                          {attachment.file.name.length > 20
                            ? `${attachment.file.name.slice(0, 17)}...`
                            : attachment.file.name}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 w-8 p-0 text-gray-500 hover:bg-red-50 hover:text-red-500"
                          onClick={() => handleRemoveFile(attachment.id)}
                        >
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 px-3 text-[13px]"
                        onClick={() =>
                          fileInputRefs.current[attachment.id]?.click()
                        }
                      >
                        <UploadIcon className="size-3.5" />
                        파일 선택
                      </Button>
                    )}

                    <input
                      ref={(el) => {
                        fileInputRefs.current[attachment.id] = el;
                      }}
                      type="file"
                      accept={attachment.accept}
                      className="hidden"
                      onChange={(e) => handleFileAttach(attachment.id, e)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* 5. 요청 내용 */}
          <article className="rounded-[16px] border border-gray-300 bg-white p-8">
            <SectionHeader number={5} title="요청 내용" optional />

            <div className="mt-6 space-y-2">
              <Textarea
                value={requestNote}
                onChange={(e) =>
                  setRequestNote(e.target.value.slice(0, REQUEST_NOTE_MAX))
                }
                placeholder="사용 목적, 발신 대상, 추가 확인이 필요한 사항을 입력해주세요."
                className="min-h-[120px] resize-none bg-white"
              />
              <div className="flex justify-end">
                <span className="font-apple-light text-[12px] text-gray-500">
                  {requestNote.length}/{REQUEST_NOTE_MAX}
                </span>
              </div>
            </div>
          </article>

          {/* 6. 하단 제출 */}
          <div className="sticky bottom-0 z-10 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-8 py-5 shadow-lg">
            <p className="font-apple-light text-[13px] text-gray-600">
              <span className="text-red-500">*</span> 표시 항목은 필수
              입력입니다. 제출 후 검수까지 영업일 기준 1~3일 소요됩니다.
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-[44px] min-w-[100px]"
                onClick={() => navigate("/messaging/calling-number/list")}
              >
                이전
              </Button>
              <Button
                type="button"
                className="h-[44px] min-w-[140px]"
                onClick={handleSubmit}
                disabled={!isFormValid()}
              >
                등록 신청
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 확인 모달 */}
      <Dialog
        open={isConfirmDialogOpen}
        onOpenChange={(open) => !open && setIsConfirmDialogOpen(false)}
      >
        <DialogContent className="max-w-[480px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>발신번호 등록 신청 확인</DialogTitle>
          </DialogHeader>

          <div className="p-8">
            <p className="font-apple-light text-[14px] leading-6 text-gray-700">
              아래 내용으로 발신번호 등록을 신청합니다.
            </p>

            <div className="mt-5 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-5">
              <ConfirmRow label="신청자" value={companyName} />
              <ConfirmRow label="발신번호" value={phoneNumber} />
              <ConfirmRow
                label="첨부 서류"
                value={`${attachments.filter((a) => a.file).length}건 / ${attachments.length}건`}
              />
              {requestNote.trim() && (
                <ConfirmRow
                  label="요청 내용"
                  value={
                    requestNote.length > 50
                      ? `${requestNote.slice(0, 50)}...`
                      : requestNote
                  }
                />
              )}
            </div>

            <p className="font-apple-light mt-4 text-[13px] text-gray-600">
              제출 후에는 수정이 불가합니다. 검수 결과는 등록하신 연락처로
              안내드립니다.
            </p>

            <DialogFooter className="mt-8 flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
              >
                취소
              </Button>
              <Button type="button" onClick={handleConfirmSubmit}>
                신청하기
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SectionHeader({
  number,
  title,
  optional,
  badge,
  badgeColor,
}: {
  number: number;
  title: string;
  optional?: boolean;
  badge?: string;
  badgeColor?: "green" | "blue";
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-primary-500 flex size-7 items-center justify-center rounded-full text-[13px] font-bold text-white">
        {number}
      </span>
      <h2 className="font-apple-medium text-[18px] text-gray-800">{title}</h2>
      {optional && (
        <Badge
          variant="outline"
          className="border-gray-200 bg-gray-100 text-[11px] text-gray-500"
        >
          선택
        </Badge>
      )}
      {badge && (
        <Badge
          variant="outline"
          className={
            badgeColor === "green"
              ? "border-green-200 bg-green-50 text-[11px] text-green-600"
              : "border-blue-200 bg-blue-50 text-[11px] text-blue-600"
          }
        >
          {badge}
        </Badge>
      )}
    </div>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 text-[14px]">
      <span className="font-apple-medium w-[80px] shrink-0 text-gray-600">
        {label}
      </span>
      <span className="font-apple-light text-gray-700">{value}</span>
    </div>
  );
}

function renderBoldText(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-apple-medium text-gray-800">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}
