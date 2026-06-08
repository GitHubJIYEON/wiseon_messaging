import { z } from "zod";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"] as const;

const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB

const FILE_FIELD_KEYS = [
  "businessLicense",
  "telecomUsageCert",
  "delegationLetter",
  "idOrEmploymentCert",
] as const;

function isAllowedFile(file: File) {
  if (
    ALLOWED_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return true;
  }

  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(
    extension as (typeof ALLOWED_EXTENSIONS)[number],
  );
}

const requiredFileSchema = z
  .instanceof(File, { message: "파일을 첨부해주세요." })
  .refine(isAllowedFile, {
    message: "PDF, JPG, PNG 형식만 업로드할 수 있습니다.",
  });

export const callingNumberFormSchema = z
  .object({
    /** API 전송용 — 개별 agreedItems는 스키마에 포함하지 않음 */
    agreement: z.boolean().refine((value) => value === true, {
      message: "전체 동의가 필요합니다.",
    }),
    ownerName: z
      .string()
      .trim()
      .min(1, "기관명 또는 법인명을 입력해주세요.")
      .max(50, "기관명 또는 법인명은 50자 이내로 입력해주세요."),
    telNo: z
      .string()
      .trim()
      .min(1, "발신번호를 입력해주세요.")
      .regex(/^\d+$/, "발신번호는 숫자만 입력해주세요.")
      .max(11, "발신번호는 11자 이내로 입력해주세요."),
    requestNote: z
      .string()
      .trim()
      .max(500, "요청내용은 500자 이내로 입력해주세요."),

    businessLicense: requiredFileSchema,
    telecomUsageCert: requiredFileSchema,
    delegationLetter: requiredFileSchema,
    idOrEmploymentCert: requiredFileSchema,
  })
  .superRefine((data, ctx) => {
    const totalSize = FILE_FIELD_KEYS.reduce(
      (sum, key) => sum + data[key].size,
      0,
    );

    if (totalSize > MAX_TOTAL_SIZE) {
      ctx.addIssue({
        code: "custom",
        path: [],
        message: "첨부파일 총 용량은 10MB 이하여야 합니다.",
      });
    }
  });

export type CallingNumberFormValues = z.infer<typeof callingNumberFormSchema>;
