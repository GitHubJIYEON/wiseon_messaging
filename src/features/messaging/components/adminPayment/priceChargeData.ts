export const PRICE_CHARGE_UNITS = [100, 500, 1000] as const;

export type PriceChargeUnit = (typeof PRICE_CHARGE_UNITS)[number];

export const CHARGE_MESSAGE_TYPES = ["SMS", "LMS", "MMS", "알림톡"] as const;

export type ChargeMessageType = (typeof CHARGE_MESSAGE_TYPES)[number];

export type PriceChargeStatus = "대기" | "완료" | "취소";

export interface PriceChargeRequest {
  id: string;
  requestedAt: string;
  /** 충전 대상 발송 유형 */
  messageType: ChargeMessageType;
  /** 충전 건수 (빠른 선택 100·500·1000 또는 직접 입력) */
  units: number;
  status: PriceChargeStatus;
  organizationName: string;
  applicantName: string;
  requestNote?: string;
  processedAt?: string;
  rejectReason?: string;
}

export const MOCK_PRICE_CHARGE_REQUESTS: PriceChargeRequest[] = [
  {
    id: "chg-001",
    requestedAt: "2026-03-28T09:15:00",
    messageType: "LMS",
    units: 500,
    status: "완료",
    organizationName: "한빛대학교",
    applicantName: "김민수",
    requestNote: "3월 정기 충전",
    processedAt: "2026-03-28T14:22:00",
  },
  {
    id: "chg-002",
    requestedAt: "2026-04-01T11:40:00",
    messageType: "SMS",
    units: 1000,
    status: "대기",
    organizationName: "(주)와이즈온",
    applicantName: "홍길동",
  },
  {
    id: "chg-003",
    requestedAt: "2026-04-02T08:05:00",
    messageType: "알림톡",
    units: 100,
    status: "완료",
    organizationName: "서울시립도서관",
    applicantName: "이영희",
    processedAt: "2026-04-02T10:30:00",
  },
  {
    id: "chg-004",
    requestedAt: "2026-04-03T16:20:00",
    messageType: "MMS",
    units: 500,
    status: "취소",
    organizationName: "테스트기관 A",
    applicantName: "박신청",
    requestNote: "긴급 충전 요청",
    processedAt: "2026-04-04T09:00:00",
    rejectReason: "입금 확인 불가 (입금자명 불일치)",
  },
  {
    id: "chg-005",
    requestedAt: "2026-04-05T13:00:00",
    messageType: "SMS",
    units: 100,
    status: "대기",
    organizationName: "경기교육청",
    applicantName: "최담당",
  },
];
