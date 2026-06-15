import { DataTable } from "@/shared/components/dataTable/DataTable";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";

export default function MessageResultsDetailPage() {
  const { table } = useDataTable({
    data: [],
    columns: [],
    pageCount: 1,
  });

  return (
    <section className="mx-auto mb-10 flex max-w-6xl flex-col gap-6">
      <h1 className="mt-8 text-center text-2xl">발송 결과 상세보기</h1>
      <Tabs defaultValue="summary">
        <TabsList variant="line">
          <TabsTrigger value="summary">발신 정보</TabsTrigger>
          <TabsTrigger value="details">수신 정보</TabsTrigger>
        </TabsList>

        {/* 발신 정보 */}
        <TabsContent value="summary">
          <div className="rounded-md bg-white p-7"></div>
        </TabsContent>

        {/* 수신 정보 */}
        <TabsContent value="details">
          <div className="rounded-md bg-white p-7">
            <Tabs defaultValue="success">
              <TabsList>
                <TabsTrigger value="success">성공</TabsTrigger>
                <TabsTrigger value="failed">실패</TabsTrigger>
                <TabsTrigger value="no-response">미응답</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 테이블 */}
            <div className="mt-6">
              <DataTable table={table} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
