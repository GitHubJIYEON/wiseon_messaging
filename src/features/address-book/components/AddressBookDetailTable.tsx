import { DataTable } from "@/shared/components/dataTable/DataTable";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import AddressBookDetailTableColumns from "./AddressBookDetailTableColumns";
import AddressBookDetailTableSearch from "./AddressBookDetailTableSearch";

const addressBookDetailList = {
  totalElements: 10,
  totalPages: 10,
  page: 1,
  size: 10,
  content: [
    {
      id: 1,
      name: "김민준",
      phoneNumber: "01012345678",
      email: "minjun.kim@example.com",
      address: "서울시 강남구 역삼동",
      memo: "메모",
      createdAt: "2026-01-01T10:00:00.000Z",
      updatedAt: "2026-01-01T10:00:00.000Z",
    },
    {
      id: 2,
      name: "이서연",
      phoneNumber: "01023456789",
      email: "seoyeon.lee@example.com",
      address: "서울시 강남구 역삼동",
      memo: "메모",
      createdAt: "2026-01-01T10:00:00.000Z",
      updatedAt: "2026-01-01T10:00:00.000Z",
    },
    {
      id: 3,
      name: "박지훈",
      phoneNumber: "01034567890",
      email: "jihoon.park@example.com",
      address: "서울시 강남구 역삼동",
      memo: "메모",
      createdAt: "2026-01-01T10:00:00.000Z",
      updatedAt: "2026-01-01T10:00:00.000Z",
    },
    {
      id: 4,
      name: "최수빈",
      phoneNumber: "01045678901",
      email: "subin.choi@example.com",
      address: "서울시 강남구 역삼동",
      memo: "메모",
      createdAt: "2026-01-01T10:00:00.000Z",
      updatedAt: "2026-01-01T10:00:00.000Z",
    },
  ],
};

export default function AddressBookDetailTable() {
  const { table } = useDataTable({
    data: addressBookDetailList?.content,
    columns: AddressBookDetailTableColumns({ handleDelete: () => {} }),
    pageCount: addressBookDetailList?.totalPages,
    meta: {
      totalCount: addressBookDetailList?.totalElements,
    },
    getRowId: (row) => String(row.id),
  });

  const handleSearch = (value: string) => {
    console.log(value);
  };

  return (
    <div className="rounded-md bg-white p-7">
      {/* 가로 스크롤 테이블 - 체크박스 + 각 변수에 해당하는 값 표시 / 버튼: 구성원 추가  / 검색바 */}
      <DataTable table={table}>
        <AddressBookDetailTableSearch onSearch={handleSearch} />
      </DataTable>
    </div>
  );
}
