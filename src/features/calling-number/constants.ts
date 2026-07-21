export const ACCEPTED_DOCUMENT_EXTENSIONS = ".pdf,.jpg,.jpeg,.png";

export const DOCUMENT_FIELDS = [
  { key: "businessRegistration", label: "사업자 등록증", hasSample: false },
  {
    key: "telecomServiceCertificate",
    label: "통신 서비스 이용증명원",
    hasSample: false,
  },
  { key: "powerOfAttorney", label: "위임장", hasSample: true },
  {
    key: "representativeProof",
    label: "대표자 신분증 또는 재직증명서",
    hasSample: false,
  },
] as const;

export type DocumentKey = (typeof DOCUMENT_FIELDS)[number]["key"];

export const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  BUSINESS_REGISTRATION: "사업자 등록증",
  TELECOM_SERVICE_CERTIFICATE: "통신 서비스 이용증명원",
  POWER_OF_ATTORNEY: "위임장",
  REPRESENTATIVE_PROOF: "대표자 신분증 또는 재직증명서",
};
