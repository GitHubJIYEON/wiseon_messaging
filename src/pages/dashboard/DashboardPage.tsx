import {
  ArrowRightIcon,
  BookUserIcon,
  MessageSquareTextIcon,
  PhoneOffIcon,
  SendIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

const summaryCards = [
  {
    label: "총 발송 건수",
    value: "12,840",
    unit: "건",
    description: "이번 달 누적 발송",
    change: "+18.2%",
    icon: SendIcon,
    className: "bg-blue-50 text-blue-600",
  },
  {
    label: "발송 성공률",
    value: "97.4",
    unit: "%",
    description: "최근 30일 기준",
    change: "+2.1%",
    icon: TrendingUpIcon,
    className: "bg-green-50 text-green-600",
  },
  {
    label: "잔여 건 수",
    value: "500",
    unit: "건",
    description: "약 6,570건 발송 가능",
    change: "충전 필요",
    icon: WalletIcon,
    className: "bg-orange-50 text-orange-600",
  },
  {
    label: "주소록 수",
    value: "4,216",
    unit: "명",
    description: "수신 가능 연락처",
    change: "+124명",
    icon: BookUserIcon,
    className: "bg-purple-50 text-purple-600",
  },
];

const recentResults = [
  {
    id: 1,
    title: "4월 고객 만족도 설문 안내",
    requestedAt: "2026.04.27 14:20",
    channel: "SMS",
    totalCount: 1850,
    successCount: 1812,
    failedCount: 38,
    status: "완료",
  },
  {
    id: 2,
    title: "신규 기능 업데이트 공지",
    requestedAt: "2026.04.27 11:05",
    channel: "LMS",
    totalCount: 640,
    successCount: 631,
    failedCount: 9,
    status: "완료",
  },
  {
    id: 3,
    title: "예약 발송 테스트",
    requestedAt: "2026.04.28 09:00",
    channel: "SMS",
    totalCount: 120,
    successCount: 0,
    failedCount: 0,
    status: "예약",
  },
];

const quickActions = [
  {
    label: "메시지 발송",
    description: "문자 내용을 작성하고 즉시 발송합니다.",
    to: "/messaging/send/sms",
    icon: MessageSquareTextIcon,
    variant: "default" as const,
  },
  {
    label: "주소록 등록",
    description: "수신자 정보를 추가하거나 엑셀로 업로드합니다.",
    to: "/messaging/address/register",
    icon: BookUserIcon,
    variant: "outline" as const,
  },
  {
    label: "수신거부 등록",
    description: "발송 포인트를 충전하고 내역을 확인합니다.",
    to: "/messaging/payment/charge",
    icon: PhoneOffIcon,
    variant: "outline" as const,
  },
];

const formatNumber = (value: number) => value.toLocaleString("ko-KR");

export default function DashboardPage() {
  return (
    <section className="mx-auto w-[1200px] pb-[30px]">
      <div className="py-10 text-center">
        <h1 className="font-apple-ultra text-[32px] leading-[45px] text-[#1B1D21]">
          대시보드
        </h1>
        {/* <p className="font-apple-light mt-2 text-[16px] leading-6 text-gray-500">
          발송 현황을 확인하고 자주 쓰는 작업을 빠르게 시작하세요.
        </p> */}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-apple-medium text-[14px] text-gray-500">
                    {card.label}
                  </p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <strong className="font-apple-bold text-[30px] leading-none text-gray-900">
                      {card.value}
                    </strong>
                    <span className="font-apple-medium text-[15px] text-gray-500">
                      {card.unit}
                    </span>
                  </div>
                </div>
                <div
                  className={`flex size-11 items-center justify-center rounded-full ${card.className}`}
                >
                  <Icon className="size-5" />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="font-apple-light text-[13px] text-gray-500">
                  {card.description}
                </span>
                <span className="font-apple-medium text-primary text-[13px]">
                  {card.change}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-[1fr_360px] gap-6">
        <section className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-apple-medium text-[20px] text-gray-900">
                최근 발송 결과
              </h2>
              <p className="font-apple-light mt-1 text-[14px] text-gray-500">
                최근 발송 요청의 성공률과 상태를 확인할 수 있습니다.
              </p>
            </div>
            <Button asChild variant="ghost" className="h-9 px-2 text-gray-600">
              <Link to="/messaging/send-result">
                전체 보기
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200 text-left">
                  <th className="font-apple-medium px-5 py-3 text-[13px] text-gray-500">
                    발송명
                  </th>
                  <th className="font-apple-medium w-[130px] px-4 py-3 text-[13px] text-gray-500">
                    채널
                  </th>
                  <th className="font-apple-medium w-[150px] px-4 py-3 text-[13px] text-gray-500">
                    성공률
                  </th>
                  <th className="font-apple-medium w-[100px] px-4 py-3 text-[13px] text-gray-500">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentResults.map((result) => {
                  const successRate =
                    result.totalCount === 0
                      ? 0
                      : Math.round(
                          (result.successCount / result.totalCount) * 1000,
                        ) / 10;

                  return (
                    <tr key={result.id} className="hover:bg-gray-50/70">
                      <td className="px-5 py-4">
                        <p className="font-apple-medium truncate text-[14px] text-gray-800">
                          {result.title}
                        </p>
                        <p className="font-apple-light mt-1 text-[12px] text-gray-500">
                          {result.requestedAt} · 총{" "}
                          {formatNumber(result.totalCount)}건
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className="border-gray-300 bg-gray-50 text-gray-600"
                        >
                          {result.channel}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="font-apple-medium text-gray-800">
                              {successRate}%
                            </span>
                            <span className="font-apple-light text-gray-500">
                              실패 {result.failedCount}건
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-green-500"
                              style={{ width: `${successRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className={
                            result.status === "완료"
                              ? "border-green-200 bg-green-50 text-green-600"
                              : "border-yellow-200 bg-yellow-50 text-yellow-600"
                          }
                        >
                          {result.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="font-apple-medium text-[20px] text-gray-900">
              빠른 작업
            </h2>
            <p className="font-apple-light mt-1 text-[14px] text-gray-500">
              자주 쓰는 기능으로 바로 이동합니다.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Button
                    key={action.label}
                    asChild
                    variant={action.variant}
                    className="h-auto justify-start rounded-lg px-4 py-4"
                  >
                    <Link to={action.to}>
                      <Icon className="size-5" />
                      <span className="flex flex-col items-start gap-1 text-left">
                        <span className="font-apple-medium text-[14px]">
                          {action.label}
                        </span>
                        <span className="font-apple-light text-[12px] opacity-80">
                          {action.description}
                        </span>
                      </span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-orange-100 bg-orange-50 p-7">
            <div className="flex items-start gap-4">
              <div className="flex size-11 items-center justify-center rounded-full bg-white text-orange-500">
                <WalletIcon className="size-5" />
              </div>
              <div>
                <h2 className="font-apple-medium text-[18px] text-gray-900">
                  잔여 건 수 현황
                </h2>
                <p className="font-apple-light mt-1 text-[13px] leading-5 text-gray-600">
                  이번 달 11,500 건을 사용했습니다. <br /> 현재 잔여 건 수는{" "}
                  <strong>500</strong> 건 입니다.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
