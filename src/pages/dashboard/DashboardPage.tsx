export default function DashboardPage() {
  return (
    <section className="mx-auto mb-10 flex max-w-6xl flex-col gap-6">
      <h1 className="mt-8 text-center text-2xl">대시보드</h1>

      {/* 상단 헤더 */}
      <div className="rounded-md bg-white p-5"></div>

      {/* 미리보기 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-md bg-white p-5"></div>
        <div className="rounded-md bg-white p-5"></div>
        <div className="rounded-md bg-white p-5"></div>
        <div className="rounded-md bg-white p-5"></div>
      </div>

      {/*  */}
    </section>
  );
}
