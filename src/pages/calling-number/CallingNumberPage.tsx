import CallingNumberStats from "@/features/calling-number/components/CallingNumberStats";
import CallingNumberTable from "@/features/calling-number/components/CallingNumberTable";

export default function CallingNumberPage() {
  return (
    <section className="mx-auto mb-10 flex max-w-6xl flex-col gap-6">
      <h1 className="mt-8 text-center text-2xl">발신 번호 관리</h1>
      <CallingNumberStats />
      <CallingNumberTable />
    </section>
  );
}
