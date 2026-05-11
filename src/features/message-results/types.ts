export type MessageType = "SMS" | "LMS" | "MMS" | "ALIMTALK" | "FRIENDTALK";
export type MessageStatus = "COMPLETED" | "RESERVED" | "FAILED" | "CANCELED";
export type ContentType = "COMMON" | "AD";

export interface MessageResultItem {
  id: number;
  requestedAt: string;
  messageBody: string;
  senderNumber: string;
  recipientCount: number;
  messageType: MessageType;
  contentType: ContentType;
  status: MessageStatus;
}
