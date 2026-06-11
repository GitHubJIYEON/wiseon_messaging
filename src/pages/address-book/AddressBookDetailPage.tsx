// import AddressBookDetailTable from "@/features/address-book/components/AddressBookDetailTable";
import { BookUser } from "lucide-react";
import SampleTable from "@/features/address-book/components/SampleTable";
import { Stats, StatsSummaryHeader } from "@/shared/components/ui/stats";

export default function AddressBookDetailPage() {
  return (
    <section className="mx-auto mb-10 flex max-w-6xl flex-col gap-6">
      <h1 className="mt-8 text-center text-2xl">주소록 연락처 관리</h1>

      {/* <AddressBookDetailTable /> */}
      {/* 엑셀 폼처럼 */}
      <SampleTable />
    </section>
  );
}
