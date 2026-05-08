import { PhoneOffIcon } from "lucide-react";
import unsubscribesData from "@/features/unsubscribes/data/unsubscribes.json";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Progress } from "@/shared/components/ui/progress";
import { formatPhoneNumber } from "@/shared/utils/format";

const MAX_COUNT = 10000;

export default function UnsubscribesStats() {
  const progressValue = (unsubscribesData.blockList.length / MAX_COUNT) * 100;

  return (
    <div className="rounded-md bg-white p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="bg-primary-50 text-primary-500 flex h-12 w-12 items-center justify-center rounded-full">
            <PhoneOffIcon className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-apple-medium text-[16px] text-gray-600">
              수신거부 번호
            </h2>
            <div className="flex flex-row items-baseline gap-2">
              <span className="font-apple-bold text-[22px] leading-tight tracking-wide text-gray-900">
                {formatPhoneNumber(unsubscribesData.numberOf080)}
              </span>
              <span className="font-apple-light text-[14px] text-gray-500">
                설명
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline">해지하기</Button>
      </div>

      <hr className="my-5 border-gray-200" />

      <Field className="w-full">
        <FieldLabel htmlFor="progress-upload">
          <span className="font-apple-medium text-[13px] text-gray-500">
            등록된 번호 갯수
          </span>
          <span className="text-primary-500">
            {unsubscribesData.blockList.length}
          </span>
          <span className="font-apple-light text-[13px] text-gray-500">
            / {MAX_COUNT} (최대)
          </span>
        </FieldLabel>
        <Progress value={progressValue} id="progress-upload" />
      </Field>
    </div>
  );
}
