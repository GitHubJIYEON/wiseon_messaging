export default function DashboardPage() {
  return (
    <section className="mx-auto w-[1200px] pb-[30px]">
      <h1 className="font-apple-ultra py-10 text-center text-[32px] leading-[45px] text-[#1B1D21]">
        대시보드
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-lg border border-gray-300 p-6">
          <h3 className="text-sm font-medium text-gray-500">총 발송 건수</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
        </div>
        <div className="rounded-lg border border-gray-300 p-6">
          <h3 className="text-sm font-medium text-gray-500">잔여 포인트</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
        </div>
        <div className="rounded-lg border border-gray-300 p-6">
          <h3 className="text-sm font-medium text-gray-500">주소록 수</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
        </div>
      </div>
    </section>
  );
}
