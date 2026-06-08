import type { ContentType, MessageType } from "./types";

export const MESSAGE_TYPE_CONFIG: Record<
  MessageType,
  { label: string; variant: "green" | "orange" | "red" | "yellow" | "blue" }
> = {
  SMS: { label: "SMS", variant: "green" },
  LMS: { label: "LMS", variant: "orange" },
  MMS: { label: "MMS", variant: "red" },
  ALIMTALK: { label: "알림톡", variant: "yellow" },
  FRIENDTALK: { label: "친구톡", variant: "blue" },
};

export const CONTENT_TYPE_CONFIG: Record<ContentType, { label: string }> = {
  COMMON: { label: "일반" },
  AD: { label: "광고" },
};

export const STATUS_CONFIG = {
  COMPLETED: { label: "성공", variant: "green" },
  RESERVED: { label: "예약", variant: "yellow" },
  FAILED: { label: "실패", variant: "red" },
  CANCELED: { label: "취소", variant: "gray" },
} as const;

export const RECIPIENT_STATUS_CONFIG = {
  SUCCESS: { label: "성공", variant: "green" },
  FAILED: { label: "실패", variant: "red" },
  PENDING: { label: "대기", variant: "yellow" },
} as const;

export const FAILURE_REASON_CONFIG = {
  NO_SUBSCRIBER: { label: "가입자 없음" },
  INVALID_NUMBER: { label: "번호 형식 오류" },
  UNSUBSCRIBED: { label: "수신 거부" },
  CARRIER_ERROR: { label: "통신사 오류" },
  OTHER: { label: "기타" },
} as const;
