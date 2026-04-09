import { MessageSquareIcon, MessagesSquareIcon, SendIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** 데모용 — API 연동 시 교체 */
const PAYMENT_USAGE_DEMO = {
  smsRemaining: 12_450,
  lmsRemaining: 3_280,
  smsSending: 42,
  lmsSending: 18,
} as const;
interface UsageStatCardProps {
  title: string;
  description: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
  iconWrapperClass: string;
  valueClassName?: string;
}

function UsageStatCard({
  title,
  description,
  value,
  unit = "건",
  icon,
  iconWrapperClass,
  valueClassName,
}: UsageStatCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            iconWrapperClass,
          )}
        >
          {icon}
        </div>
      </div>
      <h3 className="font-apple-medium mt-4 text-[13px] text-gray-500">
        {title}
      </h3>
      <p className="mt-1.5 flex items-baseline gap-1">
        <span
          className={cn(
            "font-apple-bold text-[28px] leading-none tracking-tight text-gray-900",
            valueClassName,
          )}
        >
          {value.toLocaleString()}
        </span>
        <span className="font-apple-light text-[14px] text-gray-500">
          {unit}
        </span>
      </p>
      <p className="font-apple-light mt-3 text-[11px] leading-relaxed text-gray-400">
        {description}
      </p>
    </div>
  );
}

export default function PaymentHistoryPage() {
  return (
    <section className="mx-auto w-[1200px] pb-[30px]">
      <h1 className="font-apple-ultra py-10 text-center text-[32px] leading-[45px] text-[#1B1D21]">
        사용 내역
      </h1>

      <div className="mb-4">
        <h2 className="font-apple-medium text-[20px] text-gray-800">
          발송 건수 현황
        </h2>
        <p className="font-apple-light mt-1 text-[13px] text-gray-500">
          유형별 잔여 건수와 현재 발송 처리 중인 건수를 확인할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <UsageStatCard
          title="SMS 남은 건수"
          description="단문(SMS) 발송에 사용할 수 있는 잔여 건수입니다."
          value={PAYMENT_USAGE_DEMO.smsRemaining}
          icon={<MessageSquareIcon className="size-5" />}
          iconWrapperClass="bg-sky-50 text-sky-600"
          valueClassName="text-sky-700"
        />
        <UsageStatCard
          title="LMS 남은 건수"
          description="장문(LMS·MMS) 발송에 사용할 수 있는 잔여 건수입니다."
          value={PAYMENT_USAGE_DEMO.lmsRemaining}
          icon={<MessagesSquareIcon className="size-5" />}
          iconWrapperClass="bg-violet-50 text-violet-600"
          valueClassName="text-violet-800"
        />
        <UsageStatCard
          title="발송 중 SMS"
          description="현재 전송 대기·진행 중인 SMS 건수입니다."
          value={PAYMENT_USAGE_DEMO.smsSending}
          icon={<SendIcon className="size-5" />}
          iconWrapperClass="bg-amber-50 text-amber-600"
          valueClassName="text-amber-700"
        />
        <UsageStatCard
          title="발송 중 LMS"
          description="현재 전송 대기·진행 중인 LMS 건수입니다."
          value={PAYMENT_USAGE_DEMO.lmsSending}
          icon={<SendIcon className="size-5" />}
          iconWrapperClass="bg-orange-50 text-orange-600"
          valueClassName="text-orange-700"
        />
      </div>

      {/* 사용 내역 테이블 */}
    </section>
  );
}
