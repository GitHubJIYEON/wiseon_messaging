import { Info, PhoneOffIcon } from "lucide-react";
import unsubscribesData from "@/features/unsubscribes/data/unsubscribes.json";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Progress } from "@/shared/components/ui/progress";
import { Stats, StatsSummaryHeader } from "@/shared/components/ui/stats";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { formatPhoneNumber } from "@/shared/utils/formatPhoneNumber";

const MAX_COUNT = 10000;

export default function UnsubscribesStats() {
  const progressValue = (unsubscribesData.blockList.length / MAX_COUNT) * 100;

  return (
    <Stats>
      <StatsSummaryHeader
        icon={<PhoneOffIcon />}
        title="수신거부 번호"
        value={formatPhoneNumber(unsubscribesData.numberOf080)}
        description="설명"
        action={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" className="h-[40px]" variant="ghost">
                <Info className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              수신거부번호 이용 문의 <br /> 070-4788-8282
            </TooltipContent>
          </Tooltip>
        }
      />

      <Field className="w-full">
        <FieldLabel htmlFor="progress-upload">
          <span className="font-apple-medium text-[13px] text-gray-500">
            등록된 번호 갯수
          </span>
          <span className="text-primary-500">
            {unsubscribesData.blockList.length}
          </span>
          <span className="font-apple-light text-[13px] text-gray-500">
            / {MAX_COUNT} 개 (최대)
          </span>
        </FieldLabel>
        <Progress value={progressValue} id="progress-upload" />
      </Field>
    </Stats>
  );
}
