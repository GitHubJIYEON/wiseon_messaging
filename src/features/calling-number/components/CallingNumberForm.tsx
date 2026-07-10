import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLinkIcon, FileDown, FileUp, Upload, X } from "lucide-react";
import { useForm, type Control, type FieldErrors } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import agreementItems from "@/features/calling-number/data/agreementItems.json";
import {
  callingNumberFormSchema,
  type CallingNumberFormValues,
} from "@/features/calling-number/schemas/callingNumberForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { LoadingButton } from "@/shared/components/ui/loading-button";
import { StepHeader } from "@/shared/components/ui/step-header";
import RequestNoteField from "./RequestNoteField";

type AgreementItem = (typeof agreementItems)[number];

const OWNER_NAME_MAX = 50;
const TEL_NO_MAX = 11;

const CALLING_NUMBER_LIST_PATH = "/calling-number/list";

/** API 전송용 — agreedItems는 포함하지 않음 */
export type CallingNumberSubmitPayload = {
  agreement: boolean;
  ownerName: string;
  telNo: string;
  requestNote: string;
  businessLicense: File;
  telecomUsageCert: File;
  delegationLetter: File;
  idOrEmploymentCert: File;
};

function getFirstFormErrorMessage(
  errors: FieldErrors<CallingNumberFormValues>,
): string | undefined {
  return (
    errors.agreement?.message ||
    errors.ownerName?.message ||
    errors.telNo?.message ||
    errors.requestNote?.message ||
    errors.businessLicense?.message ||
    errors.telecomUsageCert?.message ||
    errors.delegationLetter?.message ||
    errors.idOrEmploymentCert?.message ||
    errors.root?.message
  );
}

function createInitialAgreementState() {
  return Object.fromEntries(
    agreementItems.map((item) => [item.value, false]),
  ) as Record<AgreementItem["value"], boolean>;
}

interface CallingNumberFormProps {
  isLoading?: boolean;
  onSubmit?: (data: CallingNumberSubmitPayload) => void | Promise<void>;
}

export default function CallingNumberForm({
  isLoading = false,
  onSubmit,
}: CallingNumberFormProps) {
  return <CallingNumberFormBody isLoading={isLoading} onSubmit={onSubmit} />;
}

function CallingNumberFormBody({
  isLoading,
  onSubmit,
}: CallingNumberFormProps) {
  const navigate = useNavigate();
  const [agreedItems, setAgreedItems] = useState(createInitialAgreementState);

  const delegationLetterInputRef = useRef<HTMLInputElement>(null); // 위임장 파일 선택
  const idOrEmploymentCertInputRef = useRef<HTMLInputElement>(null); //
  const businessLicenseInputRef = useRef<HTMLInputElement>(null);
  const telecomUsageCertInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CallingNumberFormValues>({
    resolver: zodResolver(callingNumberFormSchema),
    defaultValues: {
      agreement: false,
      ownerName: "",
      telNo: "",
      requestNote: "",
      businessLicense: undefined as unknown as File,
      telecomUsageCert: undefined as unknown as File,
      delegationLetter: undefined as unknown as File,
      idOrEmploymentCert: undefined as unknown as File,
    },
    mode: "onSubmit",
  });

  const { setValue, watch } = form;
  const { isSubmitting } = form.formState;
  const agreement = watch("agreement");
  const isSubmittingForm = isLoading || isSubmitting;

  // 개별 동의(프론트 전용) → API용 agreement 필드 동기화
  useEffect(() => {
    const allChecked = agreementItems.every((item) => agreedItems[item.value]);
    setValue("agreement", allChecked, { shouldValidate: false });
  }, [agreedItems, setValue]);

  const handleSubmit = async (data: CallingNumberFormValues) => {
    const requestBody: CallingNumberSubmitPayload = {
      agreement: data.agreement,
      ownerName: data.ownerName,
      telNo: data.telNo,
      requestNote: data.requestNote,
      businessLicense: data.businessLicense,
      telecomUsageCert: data.telecomUsageCert,
      delegationLetter: data.delegationLetter,
      idOrEmploymentCert: data.idOrEmploymentCert,
    };

    // TODO: API 연동
    try {
      if (onSubmit) {
        await onSubmit(requestBody);
      } else {
        console.log(requestBody);
      }
      toast.success("발신번호 등록 신청이 접수되었습니다.");
      navigate(CALLING_NUMBER_LIST_PATH);
    } catch {
      toast.error("등록 신청에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const onError = (errors: FieldErrors<CallingNumberFormValues>) => {
    const errorMessage = getFirstFormErrorMessage(errors);

    if (errorMessage) {
      toast.error(errorMessage);
    }
  };

  const handleToggleAll = (checked: boolean | "indeterminate") => {
    const next = checked === true;
    setAgreedItems(
      Object.fromEntries(
        agreementItems.map((item) => [item.value, next]),
      ) as Record<AgreementItem["value"], boolean>,
    );
  };

  const handleToggleItem = (
    value: AgreementItem["value"],
    checked: boolean | "indeterminate",
  ) => {
    setAgreedItems((prev) => ({ ...prev, [value]: checked === true }));
  };

  return (
    <Form {...form}>
      <form
        className="grid gap-7"
        onSubmit={form.handleSubmit(handleSubmit, onError)}
        noValidate
      >
        {/* 1. 이용동의 */}
        <article className="flex flex-col gap-3 rounded-md bg-white p-7">
          <StepHeader number={1} title="이용동의" required />
          <div className="rounded-md border px-4">
            {/* 전체 동의 */}
            <div className="flex items-center gap-3 border-b border-gray-200 py-4">
              <Checkbox
                id="agree-all"
                checked={agreement}
                onCheckedChange={handleToggleAll}
              />
              <Label
                htmlFor="agree-all"
                className="font-apple-medium cursor-pointer text-[15px] text-gray-800"
              >
                전체 동의
              </Label>
            </div>
            <AgreementAccordion
              agreedItems={agreedItems}
              onToggleItem={handleToggleItem}
            />
            <FormField
              control={form.control}
              name="agreement"
              render={() => (
                <FormItem className="px-1 pb-3">
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </article>

        {/* 2. 신청자 정보 */}
        <div className="flex w-full flex-row gap-7">
          <article className="w-1/2 rounded-md bg-white p-7">
            <StepHeader
              number={2}
              title="발신 번호 이름 (기관명 또는 법인명)"
              required
            />
            <OwnerNameField control={form.control} />
          </article>

          {/* 3. 발신번호 입력 */}
          <article className="w-1/2 rounded-md bg-white p-7">
            <StepHeader number={3} title="발신번호 입력" required />
            <TelNoField control={form.control} />
          </article>
        </div>

        {/* 4. 첨부 서류 */}
        <article className="rounded-md bg-white p-7">
          <StepHeader number={4} title="첨부 서류" required />
          <div className="bg-point-gray-100 mt-4 rounded-md border p-4">
            <Field>
              <FieldLabel>사업자 등록증</FieldLabel>
              <div className="flex items-center gap-2 text-sm">
                {/* 영역 */}
                <div className="justify-left flex w-full items-center gap-2 rounded-md border border-dashed border-gray-400 bg-white px-4 py-2">
                  <Input
                    type="file"
                    className="hidden"
                    ref={businessLicenseInputRef}
                  />
                  {businessLicenseInputRef ? (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-sm">
                        신청일 기준 3개월 이내 사업자 등록증을 첨부해주세요
                      </span>
                    </div>
                  ) : (
                    <>
                      <Input
                        type="text"
                        className="hidden"
                        readOnly
                        value={form.watch("businessLicense")?.name}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto w-5 p-0"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-auto h-auto w-[128px]"
                    onClick={() => businessLicenseInputRef?.current?.click()}
                  >
                    <Upload className="text-muted-foreground size-4" />
                    파일 선택
                  </Button>
                </FormControl>
              </div>
            </Field>
          </div>

          <div className="bg-point-gray-100 mt-4 rounded-md border p-4">
            <Field>
              <FieldLabel>통신 서비스 이용증명원</FieldLabel>
              <div className="flex items-center gap-2 text-sm">
                <div className="justify-left flex w-full items-center gap-2 rounded-md border border-dashed border-gray-400 bg-white px-4 py-2">
                  <Input
                    type="file"
                    className="hidden"
                    ref={telecomUsageCertInputRef}
                  />
                  {telecomUsageCertInputRef ? (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-sm">
                        신청일 기준 1개월 이내 통신 서비스 이용증명원
                      </span>
                    </div>
                  ) : (
                    <>
                      <Input
                        type="text"
                        value={form.watch("telecomUsageCert")?.name}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto w-5 p-0"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto w-[128px]"
                    onClick={() => telecomUsageCertInputRef?.current?.click()}
                  >
                    <Upload className="text-muted-foreground size-4" />
                    파일 선택
                  </Button>
                </FormControl>
                {/* <Button variant="ghost" className="h-auto w-[128px] underline">
                  발급 방법
                  <ExternalLinkIcon className="inline size-3.5" />
                </Button> */}
              </div>
            </Field>
          </div>
          <div className="bg-point-gray-100 mt-4 rounded-md border p-4">
            <Field>
              <FieldLabel>위임장</FieldLabel>
              <div className="flex items-center gap-2 text-sm">
                <div className="justify-left flex w-full items-center gap-2 rounded-md border border-dashed border-gray-400 bg-white px-4 py-2">
                  <Input
                    type="file"
                    className="hidden"
                    ref={delegationLetterInputRef}
                  />
                  {delegationLetterInputRef ? (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-sm">
                        신청일 기준 3개월 이내 위임장
                      </span>
                    </div>
                  ) : (
                    <>
                      <Input
                        type="text"
                        value={form.watch("delegationLetter")?.name}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto w-5 p-0"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto w-[128px]"
                    onClick={() => idOrEmploymentCertInputRef?.current?.click()}
                  >
                    <Upload className="text-muted-foreground size-4" />
                    파일 선택
                  </Button>
                </FormControl>
                <Button type="button" variant="outline" className="h-auto">
                  <FileDown className="text-muted-foreground size-4" />
                  양식 다운로드
                </Button>
              </div>
            </Field>
          </div>
          <div className="bg-point-gray-100 mt-4 rounded-md border p-4">
            <Field>
              <FieldLabel>대표자 신분증 또는 재직증명서</FieldLabel>
              <div className="flex items-center gap-2 text-sm">
                <div className="justify-left flex w-full items-center gap-2 rounded-md border border-dashed border-gray-400 bg-white px-4 py-2">
                  <Input
                    type="file"
                    className="hidden"
                    ref={idOrEmploymentCertInputRef}
                  />
                  {idOrEmploymentCertInputRef ? (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-sm">
                        신청일 기준 3개월 이내 대표자 신분증 또는 재직증명서
                      </span>
                    </div>
                  ) : (
                    <>
                      <Input
                        type="text"
                        value={form.watch("idOrEmploymentCert")?.name}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto w-5 p-0"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto w-[128px]"
                    onClick={() => idOrEmploymentCertInputRef?.current?.click()}
                  >
                    <Upload className="text-muted-foreground size-4" />
                    파일 선택
                  </Button>
                </FormControl>
              </div>
            </Field>
          </div>

          {/* 안내 */}
          <div className="mt-4 rounded-md border bg-white p-4">
            <p className="text-md text-gray-800">첨부 파일 안내</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>파일 형식: PDF, JPG, PNG</li>
              <li>파일 용량: 4개 파일의 총합 10MB 이하</li>
              <li>
                서류 유효 기간
                <ul className="mt-1 list-inside list-disc space-y-1 pl-4">
                  <li>
                    최근 3개월 이내: 사업자등록증, 위임장, 대표자 신분증 또는
                    재직증명서
                  </li>
                  <li>
                    최근 1개월 이내: 통신서비스 이용증명원
                    <button
                      className="text-primary ml-2 cursor-pointer gap-1 text-sm underline"
                      onClick={() => {
                        // todo. 발급 방법 가이드 페이지로 이동
                        window.open("https://www.wiseon.io/guide", "_blank");
                      }}
                    >
                      발급 방법 가이드{` `}
                      <ExternalLinkIcon className="inline size-3.5" />
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </article>

        {/* 5. 요청 내용 */}
        <article className="rounded-md bg-white p-7">
          <StepHeader number={5} title="요청 내용" required={false} />
          <RequestNoteField control={form.control} />
        </article>

        {/* 하단 제출 */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between rounded-xl bg-white px-8 py-5 shadow-md">
          <p className="text-sm text-gray-600">
            제출 후 검수까지 영업일 기준 1~3일 소요됩니다.
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-[44px] min-w-[100px]"
              disabled={isSubmittingForm}
              onClick={() => navigate("/calling-numbers/new")}
            >
              이전
            </Button>
            <LoadingButton
              type="submit"
              className="h-[44px] min-w-[140px]"
              disabled={isSubmittingForm}
              isLoading={isSubmittingForm}
            >
              신청하기
            </LoadingButton>
          </div>
        </div>
      </form>
    </Form>
  );
}

function OwnerNameField({
  control,
}: {
  control: Control<CallingNumberFormValues>;
}) {
  return (
    <FormField
      control={control}
      name="ownerName"
      render={({ field }) => (
        <FormItem className="mt-4">
          <FormLabel className="sr-only">기관명 (법인명)</FormLabel>
          <FormControl>
            <Input
              placeholder="기관명 또는 법인명 입력"
              maxLength={OWNER_NAME_MAX}
              autoComplete="organization"
              {...field}
              onBlur={(e) => {
                field.onBlur();
                field.onChange(e.target.value.trim());
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TelNoField({
  control,
}: {
  control: Control<CallingNumberFormValues>;
}) {
  return (
    <FormField
      control={control}
      name="telNo"
      render={({ field }) => (
        <FormItem className="mt-4">
          <FormLabel className="sr-only">발신번호</FormLabel>
          <FormControl>
            <Input
              placeholder="통신 서비스 이용증명원 서류와 일치하는 전화번호 (ex. 0212345678)"
              inputMode="numeric"
              maxLength={TEL_NO_MAX}
              autoComplete="tel"
              {...field}
              onChange={(e) =>
                field.onChange(e.target.value.replace(/\D/g, ""))
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type AgreementAccordionProps = {
  agreedItems: Record<AgreementItem["value"], boolean>;
  onToggleItem: (
    value: AgreementItem["value"],
    checked: boolean | "indeterminate",
  ) => void;
};

function AgreementAccordion({
  agreedItems,
  onToggleItem,
}: AgreementAccordionProps) {
  return (
    <Accordion type="multiple" className="mt-1 mb-1 w-full">
      {agreementItems.map((item) => {
        const checkboxId = `agree-${item.value}`;

        return (
          <AccordionItem
            key={item.value}
            value={item.value}
            className="border-0"
          >
            <div className="flex items-start gap-3 border-b border-gray-100 last:border-b-0">
              <Checkbox
                id={checkboxId}
                checked={agreedItems[item.value]}
                onCheckedChange={(checked) => onToggleItem(item.value, checked)}
                className="mt-2 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <AccordionTrigger className="py-2.5 pr-1 text-sm leading-snug text-gray-800 hover:no-underline">
                  <Label
                    htmlFor={checkboxId}
                    className="font-apple-medium flex-1 cursor-pointer pr-2 text-left font-normal text-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.trigger}
                  </Label>
                </AccordionTrigger>
                <AccordionContent className="text-[13px] leading-relaxed text-gray-600">
                  <div className="space-y-2 pb-4">
                    {item.content.map((content) => (
                      <p key={content}>{content}</p>
                    ))}
                  </div>
                </AccordionContent>
              </div>
            </div>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
