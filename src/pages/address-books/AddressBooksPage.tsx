import AddressBookTable from "@/features/address-book/components/AddressBookTable";

export default function AddressBooksPage() {
  return (
    <section className="mx-auto mb-10 flex max-w-6xl flex-col gap-6">
      <h1 className="mt-8 text-center text-2xl">주소록 그룹 관리</h1>
      <AddressBookTable />
    </section>
  );
}
