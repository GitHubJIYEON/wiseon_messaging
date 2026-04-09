import { useMemo, useState } from "react";
import { WalletIcon } from "lucide-react";
import AdminPriceChargeHistoryTable from "@/features/messaging/components/adminPayment/AdminPriceChargeHistoryTable";
import {
  MOCK_PRICE_CHARGE_REQUESTS,
  type PriceChargeRequest,
} from "@/features/messaging/components/adminPayment/priceChargeData";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";

/** 데모: 로그인 사용자 소속 기관명 (실서비스에서는 세션/기관 컨텍스트로 대체) */
const DEMO_USER_ORGANIZATION_NAME = "(주)와이즈온";

export default function PaymentChargePage() {
  const [requests] = useState<PriceChargeRequest[]>(MOCK_PRICE_CHARGE_REQUESTS);

  const orgRequests = useMemo(
    () =>
      requests.filter(
        (r) => r.organizationName === DEMO_USER_ORGANIZATION_NAME,
      ),
    [requests],
  );

  const totalCount = orgRequests.length;
  const completedCount = orgRequests.filter((r) => r.status === "완료").length;
  const pendingCount = orgRequests.filter((r) => r.status === "대기").length;

  const completedPercent =
    totalCount === 0 ? 0 : Math.min(100, (completedCount / totalCount) * 100);
  const pipelinePercent =
    totalCount === 0
      ? 0
      : Math.min(100, ((completedCount + pendingCount) / totalCount) * 100);

  return (
    <section className="mx-auto w-[1200px] pb-[30px]">
      <h1 className="font-apple-ultra py-10 text-center text-[32px] leading-[45px] text-[#1B1D21]">
        충전하기
      </h1>

      {/* 충전 현황 카드  */}
      <div className="mb-12 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-row justify-between gap-4 px-8 pt-6 pb-5">
          <div className="flex items-center gap-6">
            <div className="bg-primary-50 text-primary-500 flex h-12 w-12 items-center justify-center rounded-full">
              <WalletIcon className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-apple-medium text-[14px] text-gray-600">
                충전 신청 현황
              </h2>
              <p className="font-apple-light text-[14px] text-gray-500">
                충전 신청 후 입금 확인 후 충전 완료로 전환됩니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" className="h-[40px]">
              충전 신청하기
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-100 px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-baseline gap-1.5">
                <span className="font-apple-medium text-[13px] text-gray-500">
                  충전 총 건수
                </span>
                <span className="font-apple-bold text-primary-500 text-[18px] leading-none">
                  {totalCount}
                </span>
                <span className="font-apple-light text-[13px] text-gray-500">
                  건
                </span>
              </div>

              <Separator orientation="vertical" className="h-4! bg-gray-200" />

              <div className="flex items-baseline gap-1.5">
                <span className="font-apple-medium text-[13px] text-gray-500">
                  충전 완료
                </span>
                <span className="font-apple-bold text-[18px] leading-none text-green-600">
                  {completedCount}
                </span>
                <span className="font-apple-light text-[13px] text-gray-500">
                  건
                </span>
              </div>

              <Separator orientation="vertical" className="h-4! bg-gray-200" />

              <div className="flex items-baseline gap-1.5">
                <span className="font-apple-medium text-[13px] text-gray-500">
                  신청 대기
                </span>
                <span className="font-apple-medium text-[14px] leading-none text-blue-500">
                  {pendingCount}건
                </span>
              </div>
            </div>

            {pendingCount > 0 && (
              <p className="font-apple-light text-[11px] text-gray-500">
                입금 확인 후 충전 완료로 전환됩니다.
              </p>
            )}
          </div>

          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="relative h-full">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-orange-200 transition-all"
                style={{ width: `${pipelinePercent}%` }}
              />
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-orange-400 transition-all"
                style={{ width: `${completedPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-apple-medium mb-4 text-[20px] text-gray-800">
          충전 내역
        </h2>
        <AdminPriceChargeHistoryTable data={orgRequests} variant="user" />
      </div>
    </section>
  );
}
