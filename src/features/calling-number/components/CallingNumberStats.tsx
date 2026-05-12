import { useState } from "react";
import { PhoneIcon } from "lucide-react";
import progressData from "@/features/calling-number/data/progress.json";
import { Button } from "@/shared/components/ui/button";
import { formatPhoneNumber } from "@/shared/utils/formatPhoneNumber";
import CallingNumberChangeDialog from "./CallingNumberChangeDialog";

export default function CallingNumberStats() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    defaultNumber,
    defaultNumberLabel,
    maxCount,
    normalCount,
    reviewCount,
    availableCount,
  } = progressData;

  const normalPct = (normalCount / maxCount) * 100;
  const reviewPct = (reviewCount / maxCount) * 100;
  const availablePct = (availableCount / maxCount) * 100;

  return (
    <div className="rounded-md bg-white p-7">
      {/* 상단 - 기본 발신번호 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="bg-primary-50 text-primary-500 flex h-12 w-12 items-center justify-center rounded-full">
            <PhoneIcon className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-apple-medium text-[16px] text-gray-600">
              기본 발신번호
            </h2>
            <div className="flex flex-row items-baseline gap-2">
              <span className="font-apple-bold text-[22px] leading-tight tracking-wide text-gray-900">
                {formatPhoneNumber(defaultNumber)}
              </span>
              <span className="font-apple-light text-[14px] text-gray-500">
                {defaultNumberLabel}
              </span>
            </div>
          </div>
        </div>
        {/* 기본 발신번호 변경 모달 */}
        <CallingNumberChangeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          trigger={<Button variant="outline">기본 발신번호 변경</Button>}
        />
      </div>

      <hr className="my-5 border-gray-200" />

      {/* 하단 - 통계 + 프로그레스바 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          {/* 통계 항목 */}
          <div className="flex items-center gap-4 text-[13px]">
            <span className="font-apple-medium text-green-500">
              등록 완료{" "}
              <span className="font-apple-bold text-green-500">
                {normalCount}
              </span>
              {/* <span className="font-apple-light text-gray-500">
                {" "}
                / {maxCount}
              </span> */}
            </span>
            <span className="text-gray-300">|</span>
            <span className="font-apple-medium text-blue-500">
              검수중 <span className="font-apple-bold">{reviewCount}</span>건
            </span>
            <span className="text-gray-300">|</span>
            <span className="font-apple-medium text-primary-500">
              신청 가능{" "}
              <span className="font-apple-bold">{availableCount}</span>건
            </span>
          </div>

          {/* 안내 문구 */}
          <span className="font-apple-light text-[12px] text-gray-500">
            (정상 + 검수중 = 최대 {maxCount}개)
          </span>
        </div>

        {/* 3단 세그먼트 프로그레스바 */}
        <div className="flex h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-all"
            style={{ width: `${normalPct}%` }}
          />
          <div
            className="bg-primary/30 h-full transition-all"
            style={{ width: `${reviewPct}%` }}
          />
          <div
            className="h-full bg-gray-200 transition-all"
            style={{ width: `${availablePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
