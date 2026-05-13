import { useState } from "react";
import CallingNumberForm from "@/features/calling-number/components/CallingNumberForm";
import CallingNumberGuide from "@/features/calling-number/components/CallingNumberGuide";

export default function CallingNumberNewPage() {
  const [step, setStep] = useState(1);
  return (
    <section className="mx-auto mb-10 flex max-w-6xl flex-col gap-6">
      <h1 className="mt-8 text-center text-2xl">발신번호 신청하기</h1>
      {step === 1 && <CallingNumberGuide setStep={setStep} />}
      {step === 2 && <CallingNumberForm />}
    </section>
  );
}
