export type MessageType = "SMS" | "LMS" | "MMS" | "ALIMTALK" | "FRIENDTALK";
export type MessageStatus = "COMPLETED" | "RESERVED" | "FAILED" | "CANCELED";
export type ContentType = "COMMON" | "AD";
export type RecipientStatus = "SUCCESS" | "FAILED" | "PENDING";
export type FailureReason =
  | "NO_SUBSCRIBER"
  | "INVALID_NUMBER"
  | "UNSUBSCRIBED"
  | "CARRIER_ERROR"
  | "OTHER";

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

export interface MessageResultAttachment {
  id: number;
  name: string;
  url: string;
  type: "IMAGE" | "FILE";
}

export interface MessageResultRecipient {
  id: number;
  phoneNumber: string;
  status: RecipientStatus;
  failureReason?: FailureReason;
  completedAt?: string;
}

export interface MessageResultDetail extends MessageResultItem {
  completedAt?: string;
  title?: string;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  attachments: MessageResultAttachment[];
  recipients: MessageResultRecipient[];
}
