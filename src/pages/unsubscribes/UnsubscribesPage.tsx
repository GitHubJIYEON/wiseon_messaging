import UnsubscribesStats from "@/features/unsubscribes/components/UnsubscribesStats";
import UnsubscribesTable from "@/features/unsubscribes/components/UnsubscribesTable";

export default function UnsubscribesPage() {
  return (
    <section className="mx-auto mb-10 flex max-w-6xl flex-col gap-6">
      <h1 className="mt-8 text-center text-2xl">수신거부 관리</h1>
      <UnsubscribesStats />
      <UnsubscribesTable />
    </section>
  );
}
