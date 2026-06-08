import {
  ChevronRightIcon,
  CircleAlert,
  Download,
  DownloadIcon,
  ExternalLinkIcon,
  Mail,
  PencilLine,
  Phone,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function CallingNumberGuide({
  onStart,
}: {
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col gap-7">
      <Card className="rounded-md border-none px-2 py-6 shadow-sm">
        <CardHeader>
          <CardTitle>발신번호 신청 안내</CardTitle>
          <CardDescription>
            발신번호 등록 심사에 필요한 정보와 서류를 제출합니다. 제출 후
            검수까지 영업일 기준 1~3일이 소요될 수 있습니다. <br />
            심사 결과에 따라 승인 또는 반려될 수 있으며 반려된 사유는 발신번호
            관리 에서 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-md">신청 서류</p>
          <ul className="grid gap-2 text-sm">
            <li className="flex items-center gap-2">
              <ChevronRightIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <span>위임장 </span>
              <span>(위임자의 인감으로 날인된 위임장)</span>
              <Button variant="outline" size="xs">
                <Download className="text-muted-foreground size-3.5" />
                양식 다운로드
              </Button>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRightIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <span>사업자 등록증 </span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRightIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <span>통신서비스 이용증명원</span>{" "}
              <span> (신청일 기준 1개월 이내 발급)</span>
              <Button variant="link" size="xs" className="text-sm underline">
                발급 방법 가이드
                <ExternalLinkIcon className="text-muted-foreground inline-block size-3.5" />
              </Button>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRightIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <span>대표자 신분증 또는 재직증명서</span>{" "}
              <span>
                {" "}
                (발신번호 소유자가 위임자의 임직원인 경우 재직증명서)
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-destructive flex items-center gap-2 text-sm">
                <CircleAlert className="text-destructive size-4" /> 서류는 3개월
                이내 발급된 서류만 유효합니다.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="rounded-md border-none px-2 py-6 shadow-sm">
        <CardHeader>
          <CardTitle>통신서비스 이용증명원이란?</CardTitle>
          <CardDescription>
            전기통신사업자가 이용자 본인이 사용하는 전화본호임을 증명하기 위해
            발급하는 서류입니다.
            <br />
            사용하는 전화번호임을 증명하기 위해 발급하는 서류입니다. 가입자의
            통신사명, 가입자의 성명/주소/생년원일(기업회원의 경우
            사업자등록번호), 가입자 통신 서비스 종류(유선, 무선, 인터넷 전화 등)
            및 전화번호가 포함되어 있어야 하며, 등록 신청일 기준으로 1개월 이내
            발급된 서류여야만 합니다.
            <br /> 자세한 사항은 가입한 통신사 고객센터에 문의하시기 바랍니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            발신번호 변작방지 및 불법 스팸 방지를 위한 법령 준수
          </p>
          <div className="mt-3 flex w-full flex-row flex-wrap gap-2">
            <Button variant="outline">
              전기통신사업법 제 84조 확인하러 가기{" "}
              <ExternalLinkIcon className="size-3" />
            </Button>
            <Button variant="outline">
              전기통신사업법 제 95조(벌칙) 확인하러 가기{" "}
              <ExternalLinkIcon className="size-3" />
            </Button>
            <Button variant="outline">
              불법스팸 방지를 위한 정보통신망법 안내서{" "}
              <DownloadIcon className="size-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md border-none px-2 py-6 shadow-sm">
        <CardHeader>
          <CardTitle>문의</CardTitle>
          <CardDescription>
            문의 사항이 있으신 경우, 문의하기 글 작성 또는 고객센터로
            문의해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="flex items-center gap-2 text-sm text-gray-700">
            <PencilLine className="size-4 text-gray-600" />
            <Button
              variant="link"
              size="xs"
              className="text-sm text-gray-700"
              onClick={() => {
                window.open("https://www.wiseon.io/support/inquiry", "_blank");
              }}
            >
              문의하기
            </Button>
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="size-4 text-gray-600" /> 02-558-5144
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-700">
            <Mail className="size-4 text-gray-600" /> wiseon@wiseinc.co.kr
          </p>
        </CardContent>
      </Card>

      <CardFooter className="justify-center">
        <Button variant="dark" onClick={onStart}>
          시작하기
        </Button>
      </CardFooter>
    </div>
  );
}
