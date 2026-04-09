import AddressBookTable from "@/features/messaging/components/addressBook/AddressBookTable";

export default function AddressListPage() {
  return (
    <section className="mx-auto w-[1200px] pb-[30px]">
      <h1 className="font-apple-ultra py-10 text-center text-[32px] leading-[45px] text-[#1B1D21]">
        주소록 관리
      </h1>

      <AddressBookTable />
    </section>
  );
}
