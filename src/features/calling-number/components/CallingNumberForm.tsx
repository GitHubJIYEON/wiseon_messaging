import { useState } from "react";
import { useNavigate } from "react-router-dom";
import agreementItems from "@/features/calling-number/data/agreementItems.json";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

export default function CallingNumberForm() {
  const navigate = useNavigate();
  const REQUEST_NOTE_MAX = 500;
  const [requestNote, setRequestNote] = useState("");

  const handleSubmit = () => {
    console.log("발신번호 등록 신청");
  };

  const isFormValid = () => {
    return true;
  };

  return (
    <div className="grid gap-7">
      {/* 1. 이용동의 */}
      <article className="rounded-md bg-white p-7">
        <ArticleHeader number={1} title="이용동의" required={true} />
        <div className="mt-4 rounded-md border p-4">
          {/* 아코디언 컴포넌트  */}
          <AgreementAccordion />
        </div>
      </article>
      {/* 2. 신청자 정보 */}
      <article className="rounded-md bg-white p-7">
        <ArticleHeader
          number={2}
          title="발신 번호 이름 (기관명 또는 법인명)"
          required={true}
        />
        <div className="mt-4">
          <Label className="mb-2 hidden">기관명 (법인명)</Label>
          <Input placeholder="기관명 또는  법인명 입력" />
        </div>
      </article>
      {/* 3. 발신번호 입력 */}
      <article className="rounded-md bg-white p-7">
        <ArticleHeader number={3} title="발신번호 입력" required={true} />
        <div className="mt-4">
          <div className="mt-4">
            <Label className="mb-2 hidden">발신번호</Label>
            <Input placeholder="발신번호" />
          </div>
        </div>
      </article>
      {/* 4. 첨부 서류 */}
      <article className="rounded-md bg-white p-7">
        <ArticleHeader number={4} title="첨부 서류" required={true} />
        <div className="mt-4 rounded-md border p-4">
          <Field>
            <FieldLabel>사업자 등록증</FieldLabel>
            <FieldDescription>사업자 등록증을 첨부해주세요.</FieldDescription>
          </Field>
        </div>
        <div className="mt-4 rounded-md border p-4">
          <Field>
            <FieldLabel>통신 서비스 이용증명원</FieldLabel>
            <FieldDescription>
              발신번호의 통신 서비스 이용증명원 (최근 1개월 이내 발급)
            </FieldDescription>
          </Field>
        </div>
        <div className="mt-4 rounded-md border p-4">
          <Field>
            <FieldLabel>위임장</FieldLabel>
            <FieldDescription>
              대리 신청 시 필요 (위임장 양식을 다운로드하여 작성)
            </FieldDescription>
          </Field>
        </div>
        <div className="mt-4 rounded-md border p-4">
          <Field>
            <FieldLabel>대표자 신분증 또는 재직증명서</FieldLabel>
            <FieldDescription>
              대표자 신분증 사본 또는 재직증명서 중 택 1
            </FieldDescription>
          </Field>
        </div>
      </article>
      {/* 5. 요청 내용 */}
      <article className="rounded-md bg-white p-7">
        <ArticleHeader number={5} title="요청 내용" required={false} />
        <div className="mt-4">
          <Textarea
            placeholder="사용 목적, 발신 대상, 추가 확인이 필요한 사항을 입력"
            maxLength={REQUEST_NOTE_MAX}
            value={requestNote}
            onChange={(e) => setRequestNote(e.target.value)}
          />
          <div className="flex justify-end">
            <span className="font-apple-light text-[12px] text-gray-500">
              {requestNote.length}/{REQUEST_NOTE_MAX}
            </span>
          </div>
        </div>
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
            onClick={() => void navigate("/calling-number/new")}
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
    </div>
  );
}

function ArticleHeader({
  number,
  title,
  required,
}: {
  number: number;
  title: string;
  required: boolean;
}) {
  return (
    <div className="flex flex-row items-center gap-2">
      <span className="bg-primary-500 flex size-6 items-end justify-center rounded-full text-[13px] font-bold text-white">
        {number}
      </span>
      <h4>{title}</h4>
      {required ? (
        <Badge className="ml-auto" variant="red">
          필수
        </Badge>
      ) : (
        <Badge className="ml-auto" variant="gray">
          선택
        </Badge>
      )}
    </div>
  );
}

function AgreementAccordion() {
  return (
    <Accordion type="multiple">
      {agreementItems.map((item: any) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.trigger}</AccordionTrigger>
          <AccordionContent>
            {item.content.map((content: string) => (
              <p key={content}>{content}</p>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
