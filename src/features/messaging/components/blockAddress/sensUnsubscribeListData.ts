/**
 * SENS SMS 수신 거부 번호 조회 API 응답 형식
 * @see https://api-gov.ncloud-docs.com/docs/sens-sms-unsubscribe-list
 */
export interface SensUnsubscribeListItem {
  /** 수신 거부 전화번호 (숫자) */
  clientTelNo: string;
  /** 수신 거부 등록 일시 (YYYY-MM-DDTHH:mm:ss.sss) */
  registerTime: string;
  /**
   * 수신 거부 유입 경로 (API 응답 코드)
   * 문서 예: C, M 등 — 화면에서는 REGISTER_TYPE_LABEL로 표시
   */
  registerType: string;
}

/** 테이블 row id (클라이언트 전용) */
export interface SensUnsubscribeTableRow extends SensUnsubscribeListItem {
  id: string;
}

/** SENS GET unsubscribes 응답 배열 → 테이블 row (안정적 row id 부여) */
export function toSensUnsubscribeTableRows(
  items: SensUnsubscribeListItem[],
): SensUnsubscribeTableRow[] {
  return items.map((item, index) => ({
    ...item,
    id: `${item.clientTelNo}-${item.registerTime}-${index}`,
  }));
}

export const REGISTER_TYPE_LABEL: Record<string, string> = {
  C: "ARS",
  M: "수동",
  MC: "수동",
};

export const MOCK_SENS_UNSUBSCRIBE_LIST: SensUnsubscribeTableRow[] = [
  {
    id: "1",
    clientTelNo: "01012345678",
    registerTime: "2025-11-21T16:10:47.884",
    registerType: "M",
  },
  {
    id: "2",
    clientTelNo: "01098765432",
    registerTime: "2025-11-20T09:30:00.000",
    registerType: "C",
  },
  {
    id: "3",
    clientTelNo: "01055556666",
    registerTime: "2025-11-19T14:22:15.120",
    registerType: "M",
  },
];
