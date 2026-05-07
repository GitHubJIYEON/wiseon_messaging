import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function UnsubscribesPage() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col">
      <h1 className="m-8 text-center text-2xl">수신거부 서비스 신청하기</h1>
      <div className="flex flex-col gap-4">
        <div className="rounded-lg bg-white p-10"></div>
        <Card>
          <CardHeader>
            <CardTitle>신청서 작성</CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
        <Button variant="dark" className="mx-auto">
          신청하기
        </Button>
      </div>
    </section>
  );
}
