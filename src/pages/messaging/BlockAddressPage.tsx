import { PhoneOffIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function BlockAddressPage() {
  return (
    <section className="mx-auto w-[1200px] pb-[30px]">
      <h1 className="font-apple-ultra py-10 text-center text-[32px] leading-[45px] text-[#1B1D21]">
        수신거부 등록 전
      </h1>
      <div className="mt-8 rounded-[16px] border border-gray-300 bg-white p-8">
        <h4 className="font-apple-medium text-primary-500 text-[16px]">
          080 수신 거부 등록
        </h4>
        <p>수신 거부 전화번호는 최대 1,000개까지 입력 가능 합니다.</p>
      </div>

      {/* <div className="rounded-lg border border-gray-300 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <PhoneOffIcon className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-apple-medium text-[16px] text-gray-600">
                수신거부 번호
              </h2>
              <span className="text-[14px] text-gray-500">
                발신번호가 없습니다. 발신번호를 신청해주세요.
              </span>
            </div>
          </div>
          <Button type="button" className="h-[40px]">
            수신거부번호 신청
          </Button>
        </div>
      </div> */}

      <div className="mt-8 rounded-[16px] border border-gray-300 bg-white p-8">
        <h4 className="font-apple-medium text-primary-500 text-[16px]">
          080 수신거부 관령 법령
        </h4>
        <p className="font-apple-light mt-3 text-[14px] text-gray-800">
          정보 통신망 이용촉진 및 정보보호 등 관하 법률(정보통신망법) 제 50조에
          따라 영리목적의 문자 메시지를 발송하는 경우, "(광고)" 표기 및 080
          수신거부 번호를 포함하여 메시지를 발송해야 합니다. <br />
          해당 요건을 지키지 않았을 경우, 한국인터넷진흥원(KISA)의 권고 등에
          따라 문자메시지 발송에 대한 제한이 발생될 수 있습니다.
        </p>

        <br />
        <p className="font-apple-light mt-3 text-[14px] text-gray-800">
          정보통신망법 제 50조 (영리목적의 광고성 정보 전송 제한) <br />
          1. 누구드닞 전자적 전송매체를 이용하여 영리목적의 광고성 정보를
          전송하려면 그 수신자의 명시적인 사전 동의를 받아야 한다. 다만, 다음 각
          호의 어느 하나에 해당하는 경우에는 사전 동의를 받지 아니한다.
          <br />
          2. 전자적 전송매체를 이용하여 영리목적의 광고성 정보를 전송하려는 자는
          제 1항에도 불구하고 수신자가 수신거부의사를 표시하거나 사전 동의를
          철회한 경우에는 영리목적의 광고성 정보를 전송하여서는 아니 된다.
          <br />
          3. 오후 9시부터 그 다음날 오전 8시까지의 시간에 전자적 전송매체를
          전송매체를 이용하여 영리목적의 광고성 정보를 전송하려는 자는 제
          1항에도 불구하고 그 수신자로부터 별도의 샂던 동의를 받아야 한다.
          <br />
          4. 전지적 전송매체를 이용하여 영리목적의 광고성 정보를 전송하는 자는
          대통려령으로 정하는 바에 따라 다음 각 호의 사항 등 광고성 정보에
          구체적으로 밝혀야 한다. - 전송자의 명칭 및 연락처 <br />
          - 수신의 거부 또는 수신동의의 철회 의사표시를 쉽게 할 수 있는 조치 및
          방법에 관한 사항.
          <br />
          - 이하 생략 -
          <br />
          정보통신망법 제 50조의8(불법행위를 위한 광고성 정보 전송금지) 누구든지
          정보통신망을 이용하여 이 법 또는 다른 법률에서 이용, 판매, 제공, 유통,
          그 밖에 이와 유사한 행위를 금지하는 제화 또는 서비스에 대한 광고성
          정보를 전송하여서는 아니 된다.
          <br />
          정보통신망법 제 76조(과태료) ①다음 각 호의 어느 하나에 해당하는 자와
          제 7호부터 제11호까지의 경우에 해당하는 행위를 하도록 한 자에게는
          3천만원 이하의 과태료를 부과한다. <br />
          12의3. 제50조제7항을 위반하여 수신동의, 수신거부 또는 수신동의 철회에
          대한 처리 결과를 알리지 아니한 자.②③ ④ ⑤
        </p>
      </div>
      <div className="mt-8 rounded-[16px] border border-gray-300 bg-white p-8">
        <h4 className="font-apple-medium text-primary-500 text-[16px]">
          080 수신거부 번호 서비스의 법적 요구사항
        </h4>
        <p className="font-apple-light mt-3 text-[14px] text-gray-800">
          1. 광고성 정보의 표시 <br /> - 모든 광고성 정보에는 "(광고)"표기를
          포함하고, 발신자의 명칭, 연락처 및 수신거부 방법을 명확히 기재해야
          합니다. <br />
          2. 수신거부의 용이성 <br /> - 수신자가 광고성 정보를 쉽게 차단할 수
          있도록, 080 수신거부 번호를 제공하여 수신거부 요청을 무료로 할 수
          있도록 해야 합니다.
          <br />
          3. 신속한 처리 <br /> - 수신자의 수신거부 요청을 받은 경우, 이를 14일
          이내에 처리하여 더 이상 해당 광고성 정보가 발송되지 않도록 해야
          합니다.
        </p>
      </div>
      <div className="mt-8 flex justify-center">
        <Button type="button" variant="dark" className="h-[40px]">
          수신 거부 번호 신청하기
        </Button>
      </div>
    </section>
  );
}
