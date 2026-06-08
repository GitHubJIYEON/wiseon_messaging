import { useSearchParams } from "react-router-dom";
import CallingNumberForm from "@/features/calling-number/components/CallingNumberForm";
import CallingNumberGuide from "@/features/calling-number/components/CallingNumberGuide";

const STEP = {
  GUIDE: "guide",
  FORM: "form",
} as const;

export default function CallingNumberNewPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const step = searchParams.get("step") ?? STEP.GUIDE;
  const isFormStep = step === STEP.FORM;

  const goToForm = () => {
    setSearchParams({ step: STEP.FORM });
  };

  return (
    <section className="mx-auto mb-10 flex max-w-6xl flex-col gap-6">
      <h1 className="mt-8 text-center text-2xl">발신번호 신청하기</h1>

      {isFormStep ? (
        <CallingNumberForm />
      ) : (
        <CallingNumberGuide onStart={goToForm} />
      )}
    </section>
  );
}
