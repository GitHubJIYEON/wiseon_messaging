import { useMemo, useState } from "react";
import {
  BarChart3Icon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  MessageSquareTextIcon,
  TrendingUpIcon,
  XCircleIcon,
} from "lucide-react";
import Chart from "react-apexcharts";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

type PeriodFilter = "7d" | "30d" | "month";
type MessageTypeFilter = "all" | "SMS" | "LMS" | "MMS";

const periodOptions: { label: string; value: PeriodFilter }[] = [
  { label: "최근 7일", value: "7d" },
  { label: "최근 30일", value: "30d" },
  { label: "이번 달", value: "month" },
];

const messageTypeOptions: { label: string; value: MessageTypeFilter }[] = [
  { label: "전체", value: "all" },
  { label: "SMS", value: "SMS" },
  { label: "LMS", value: "LMS" },
  { label: "MMS", value: "MMS" },
];

const dailySendData = [
  { date: "04.21", success: 1280, failed: 42 },
  { date: "04.22", success: 1640, failed: 38 },
  { date: "04.23", success: 1420, failed: 51 },
  { date: "04.24", success: 1960, failed: 45 },
  { date: "04.25", success: 1720, failed: 33 },
  { date: "04.26", success: 980, failed: 28 },
  { date: "04.27", success: 1812, failed: 38 },
];

const messageTypeData = [
  { type: "SMS", count: 8420, color: "#5F75EE" },
  { type: "LMS", count: 3160, color: "#22C55E" },
  { type: "MMS", count: 1260, color: "#F97316" },
];

const monthlyCumulativeData = [
  { month: "1월", count: 8200 },
  { month: "2월", count: 18400 },
  { month: "3월", count: 31800 },
  { month: "4월", count: 44640 },
  { month: "5월", count: 55820 },
  { month: "6월", count: 67400 },
];

const failureReasons = [
  { reason: "가입자 없음", count: 48, color: "bg-red-500" },
  { reason: "번호 형식 오류", count: 31, color: "bg-orange-500" },
  { reason: "수신 거부", count: 24, color: "bg-yellow-500" },
  { reason: "통신사 오류", count: 18, color: "bg-blue-500" },
  { reason: "기타", count: 11, color: "bg-gray-500" },
];

const formatNumber = (value: number) => value.toLocaleString("ko-KR");

export default function StatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("7d");
  const [selectedMessageType, setSelectedMessageType] =
    useState<MessageTypeFilter>("all");

  const totalSuccessCount = dailySendData.reduce(
    (sum, item) => sum + item.success,
    0,
  );
  const totalFailedCount = dailySendData.reduce(
    (sum, item) => sum + item.failed,
    0,
  );
  const totalSendCount = totalSuccessCount + totalFailedCount;
  const successRate =
    Math.round((totalSuccessCount / totalSendCount) * 1000) / 10;
  const totalFailureCount = failureReasons.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const kpiCards = [
    {
      label: "총 발송 건수",
      value: formatNumber(totalSendCount),
      unit: "건",
      description: "선택 기간 누적",
      icon: MessageSquareTextIcon,
      className: "bg-blue-50 text-blue-600",
    },
    {
      label: "성공 건수",
      value: formatNumber(totalSuccessCount),
      unit: "건",
      description: "정상 발송 완료",
      icon: CheckCircle2Icon,
      className: "bg-green-50 text-green-600",
    },
    {
      label: "실패 건수",
      value: formatNumber(totalFailedCount),
      unit: "건",
      description: "재확인 필요",
      icon: XCircleIcon,
      className: "bg-red-50 text-red-600",
    },
    {
      label: "발송 성공률",
      value: `${successRate}`,
      unit: "%",
      description: "전 기간 대비 +2.1%",
      icon: TrendingUpIcon,
      className: "bg-purple-50 text-purple-600",
    },
  ];

  const dailySendChartOptions = useMemo<ApexCharts.ApexOptions>(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        stacked: true,
      },
      colors: ["#5F75EE", "#F87171"],
      dataLabels: { enabled: false },
      grid: {
        borderColor: "#E5E7EB",
        strokeDashArray: 4,
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "13px",
        markers: { size: 8 },
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: "42%",
        },
      },
      xaxis: {
        categories: dailySendData.map((item) => item.date),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: "#6B7280", fontSize: "12px" } },
      },
      yaxis: {
        labels: {
          formatter: (value) => `${formatNumber(Math.round(value))}`,
          style: { colors: "#6B7280", fontSize: "12px" },
        },
      },
      tooltip: {
        y: {
          formatter: (value) => `${formatNumber(value)}건`,
        },
      },
    }),
    [],
  );

  const messageTypeChartOptions = useMemo<ApexCharts.ApexOptions>(
    () => ({
      chart: {
        type: "donut",
      },
      colors: messageTypeData.map((item) => item.color),
      dataLabels: {
        enabled: true,
        formatter: (value) => `${Math.round(Number(value))}%`,
      },
      labels: messageTypeData.map((item) => item.type),
      legend: {
        position: "bottom",
        fontSize: "13px",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "전체",
                formatter: () =>
                  `${formatNumber(
                    messageTypeData.reduce((sum, item) => sum + item.count, 0),
                  )}건`,
              },
            },
          },
        },
      },
      stroke: {
        colors: ["#FFFFFF"],
        width: 3,
      },
      tooltip: {
        y: {
          formatter: (value) => `${formatNumber(value)}건`,
        },
      },
    }),
    [],
  );

  const monthlyCumulativeChartOptions = useMemo<ApexCharts.ApexOptions>(
    () => ({
      chart: {
        type: "area",
        toolbar: { show: false },
      },
      colors: ["#22C55E"],
      dataLabels: { enabled: false },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.05,
        },
      },
      grid: {
        borderColor: "#E5E7EB",
        strokeDashArray: 4,
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      xaxis: {
        categories: monthlyCumulativeData.map((item) => item.month),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: "#6B7280", fontSize: "12px" } },
      },
      yaxis: {
        labels: {
          formatter: (value) => `${formatNumber(Math.round(value))}`,
          style: { colors: "#6B7280", fontSize: "12px" },
        },
      },
      tooltip: {
        y: {
          formatter: (value) => `${formatNumber(value)}건`,
        },
      },
    }),
    [],
  );

  return (
    <section className="mx-auto mb-10 flex max-w-6xl flex-col gap-6">
      <h1 className="mt-8 text-center text-2xl">통계</h1>
      {/* <p className="font-apple-light mt-2 text-[16px] leading-6 text-gray-500">
          기간별 발송 성과와 실패 원인을 분석합니다.
        </p> */}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-50 text-primary flex size-10 items-center justify-center rounded-full">
              <CalendarDaysIcon className="size-5" />
            </div>
            <div>
              <h2 className="font-apple-medium text-[16px] text-gray-900">
                기간 필터
              </h2>
              <p className="font-apple-light text-[13px] text-gray-500">
                조회 기간과 메시지 유형을 선택하세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-md bg-gray-100 p-1.5">
              {periodOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={
                    selectedPeriod === option.value ? "default" : "ghost"
                  }
                  className={
                    selectedPeriod === option.value
                      ? "h-8 rounded-md px-4 text-[13px]"
                      : "h-8 rounded-md px-4 text-[13px] text-gray-600 hover:bg-white"
                  }
                  onClick={() => setSelectedPeriod(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <select
              value={selectedMessageType}
              className="font-apple-medium focus:border-primary h-[42px] rounded-lg border border-gray-300 bg-white px-4 text-[14px] text-gray-700 outline-none"
              onChange={(event) =>
                setSelectedMessageType(event.target.value as MessageTypeFilter)
              }
            >
              {messageTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((card) => {
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
              <p className="font-apple-light mt-5 text-[13px] text-gray-500">
                {card.description}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-[1fr_380px] gap-6">
        <section className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-apple-medium text-[20px] text-gray-900">
                일별 발송량
              </h2>
              <p className="font-apple-light mt-1 text-[14px] text-gray-500">
                성공/실패 건수를 일자별로 비교합니다.
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-600"
            >
              {
                periodOptions.find((option) => option.value === selectedPeriod)
                  ?.label
              }
            </Badge>
          </div>
          <Chart
            height={340}
            options={dailySendChartOptions}
            series={[
              {
                name: "성공",
                data: dailySendData.map((item) => item.success),
              },
              {
                name: "실패",
                data: dailySendData.map((item) => item.failed),
              },
            ]}
            type="bar"
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm">
          <h2 className="font-apple-medium text-[20px] text-gray-900">
            메시지 유형별 발송 비율
          </h2>
          <p className="font-apple-light mt-1 text-[14px] text-gray-500">
            선택 기간 내 채널별 사용 비중입니다.
          </p>
          <div className="mt-4">
            <Chart
              height={314}
              options={messageTypeChartOptions}
              series={messageTypeData.map((item) => item.count)}
              type="donut"
            />
          </div>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_380px] gap-6">
        <section className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-apple-medium text-[20px] text-gray-900">
                월별 누적 발송량
              </h2>
              <p className="font-apple-light mt-1 text-[14px] text-gray-500">
                월 단위 누적 추이를 통해 발송 규모 변화를 확인합니다.
              </p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <BarChart3Icon className="size-4" />
              <span className="font-apple-medium text-[13px]">
                전월 대비 +17.2%
              </span>
            </div>
          </div>
          <Chart
            height={340}
            options={monthlyCumulativeChartOptions}
            series={[
              {
                name: "누적 발송량",
                data: monthlyCumulativeData.map((item) => item.count),
              },
            ]}
            type="area"
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm">
          <h2 className="font-apple-medium text-[20px] text-gray-900">
            실패 사유 분석
          </h2>
          <p className="font-apple-light mt-1 text-[14px] text-gray-500">
            실패 건수가 많은 원인부터 정렬했습니다.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            {failureReasons.map((item) => {
              const percent =
                totalFailureCount === 0
                  ? 0
                  : Math.round((item.count / totalFailureCount) * 1000) / 10;

              return (
                <div key={item.reason}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-full ${item.color}`} />
                      <span className="font-apple-medium text-[14px] text-gray-700">
                        {item.reason}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-apple-medium text-[14px] text-gray-900">
                        {formatNumber(item.count)}건
                      </span>
                      <span className="font-apple-light text-[12px] text-gray-500">
                        {percent}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}
