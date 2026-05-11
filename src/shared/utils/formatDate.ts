/**
 * ISO 날짜 문자열 또는 Date 객체를 지정 형식으로 변환합니다.
 *
 * @example
 * formatDate("2026-03-30T01:06:01.000Z")        // "2026.03.30"
 * formatDateTime("2026-03-30T01:06:01.000Z")     // "2026.03.30 10:06"
 * formatDateTimeSecond("2026-03-30T01:06:01.000Z") // "2026.03.30 10:06:01"
 */

type DateInput = string | Date;

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

/** 2026.03.30 */
export function formatDate(value: DateInput): string {
  const d = toDate(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

/** 2026.03.30 10:06 */
export function formatDateTime(value: DateInput): string {
  const d = toDate(value);
  const date = formatDate(d);
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${date} ${hh}:${min}`;
}

/** 2026.03.30 10:06:01 */
export function formatDateTimeSecond(value: DateInput): string {
  const d = toDate(value);
  const dateTime = formatDateTime(d);
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dateTime}:${ss}`;
}
