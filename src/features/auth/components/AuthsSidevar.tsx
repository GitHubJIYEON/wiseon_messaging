const projectsList = [
  "설문 · 분석",
  "고객(PCSI)/조직만족도",
  "텍스트마이닝",
  "조직 진단 · 평가",
  "다면평가",
  "의사결정(AHP)",
];

export default function AuthSidebar() {
  return (
    <aside className="h-screen w-md min-w-md shrink-0 bg-[#3f80ea]">
      <div className="mx-auto w-fit pt-[130px]">
        <h2 className="font-apple-semibold py-2.5 text-center text-[20px]/6 text-white">
          WiseON
        </h2>
        <ul className="flex flex-col gap-1.5 rounded-2xl border border-[#0f71ff] p-5">
          {projectsList.map((item, index) => (
            <li
              key={index}
              className="font-apple-bold w-[300px] rounded-[6px] bg-[#075ad3] px-[50px] py-2.5 text-center text-base text-white"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="font-apple-medium pt-5 text-center text-base text-white">
          설문조사와 분석, 보고서자동화 업무 감소
        </div>
      </div>
    </aside>
  );
}
