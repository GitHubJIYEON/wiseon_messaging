export type CallingNumberStatus = "정상" | "검수중" | "만료" | "반려";

export interface CallingNumber {
  id: number;
  phoneNumber: string;
  name: string;
  registeredAt: string;
  certExpiredAt: string;
  status: CallingNumberStatus;
  usageEnabled: boolean;
}
