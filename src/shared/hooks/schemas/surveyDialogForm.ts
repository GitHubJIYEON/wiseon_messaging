import { z } from "zod";

const MAX_TARGET_RESPONSES = 100_000;

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("ko-KR").format(num);
};

export const surveyDialogFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "최소 한 글자 이상 입력해주세요.")
      .max(100, "최대 100자 이하로 입력해주세요."),
    dateRange: z.object({
      startedAt: z.date("시작일을 선택해주세요."),
      finishedAt: z.date("종료일을 선택해주세요."),
    }),
    targetRNum: z
      .number("숫자를 입력해주세요.")
      .min(1, "목표응답수는 최소 1 이상이어야 합니다.")
      .max(
        MAX_TARGET_RESPONSES,
        `목표응답수는 최대 ${formatNumber(MAX_TARGET_RESPONSES)}명 이하이어야 합니다.`,
      ),
  })
  .refine((data) => data.dateRange.startedAt < data.dateRange.finishedAt, {
    message: "시작일은 종료일보다 이전이어야 합니다.",
    path: ["dateRange", "finishedAt"],
  });

export type SurveyDialogFormType = z.infer<typeof surveyDialogFormSchema>;
