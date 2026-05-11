/**
 * 전화번호를 XXX-XXXX-XXXX 형식으로 변환합니다.
 *
 * 지원 패턴:
 * - 11자리 (010, 011 등 모바일):  010-1234-5678
 * - 10자리 (02 지역번호):          02-1234-5678
 * - 10자리 (031 등 지역번호):      031-123-4567
 * - 9자리  (02 지역번호):          02-123-4567
 * - 080 수신거부 번호:              080-123-4567
 */
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("02")) {
    if (digits.length === 9)
      return digits.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3");
    if (digits.length === 10)
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
  }

  if (digits.length === 10)
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  if (digits.length === 11)
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");

  return value;
}
