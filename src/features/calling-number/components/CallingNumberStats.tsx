import { useState } from "react";
import { PhoneIcon } from "lucide-react";
import progressData from "@/features/calling-number/data/progress.json";
import { Button } from "@/shared/components/ui/button";
import { Stats, StatsSummaryHeader } from "@/shared/components/ui/stats";
import { formatPhoneNumber } from "@/shared/utils/formatPhoneNumber";
import CallingNumberChangeDialog from "./CallingNumberChangeDialog";

const mockData = {
  defaultNumber: "0212345678",
  defaultNumberLabel: "고객센터 대표번호",
  maxCount: 30,
  normalCount: 5,
  reviewCount: 3,
  availableCount: 22,
};

export default function CallingNumberStats() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const normalPct = Math.round(
    (mockData.normalCount / mockData.maxCount) * 100,
  );
  const reviewPct = Math.round(
    (mockData.reviewCount / mockData.maxCount) * 100,
  );
  const availablePct = 100 - normalPct - reviewPct;

  return (
    <Stats>
      {mockData.availableCount < mockData.maxCount ? (
        <StatsSummaryHeader
          icon={<PhoneIcon />}
          title="기본 발신번호"
          value={formatPhoneNumber(mockData.defaultNumber)}
          description={mockData.defaultNumberLabel}
          action={
            <CallingNumberChangeDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              trigger={<Button variant="outline">기본 발신번호 변경</Button>}
            />
          }
        />
      ) : (
        <StatsSummaryHeader
          icon={<PhoneIcon />}
          description={"등록된 발신번호가 없습니다."}
        />
      )}

      {/* 프로그레스 바 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-4">
            <span className="font-apple-medium text-primary-500">
              등록 완료{" "}
              <span className="font-apple-bold">{mockData.normalCount}건</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="font-apple-medium text-primary/60">
              검수중{" "}
              <span className="font-apple-bold">{mockData.reviewCount}</span>건
            </span>
            <span className="text-gray-300">|</span>
            <span className="font-apple-medium text-gray-500">
              신청 가능{" "}
              <span className="font-apple-bold">{mockData.availableCount}</span>
              건
            </span>
          </div>
          <span className="font-apple-light text-[12px] text-gray-700">
            총 {mockData.maxCount}건
          </span>
        </div>

        <div className="flex h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary-500 h-full transition-all"
            style={{ width: `${normalPct}%` }}
          />
          <div
            className="bg-primary/50 h-full transition-all"
            style={{ width: `${reviewPct}%` }}
          />
          <div
            className="h-full bg-gray-200 transition-all"
            style={{ width: `${availablePct}%` }}
          />
        </div>
      </div>
    </Stats>
  );
}
