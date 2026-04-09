export type SmsType = "SMS" | "LMS" | "MMS";
export type ContentType = "COMM" | "AD";
export type MessageStatus = "READY" | "PROCESSING" | "COMPLETED";
export type StatusName = "success" | "fail" | "reserved";
export type ReserveStatus =
  | "READY"
  | "PROCESSING"
  | "CANCELED"
  | "FAIL"
  | "DONE"
  | "STALE";

export interface MessageRecipient {
  to: string;
  subject?: string;
  content?: string;
}

export interface SendMessageRequest {
  type: SmsType;
  contentType?: ContentType;
  countryCode?: string;
  from: string;
  subject?: string;
  content: string;
  messages: MessageRecipient[];
  files?: { fileId: string }[];
  reserveTime?: string;
  reserveTimeZone?: string;
}

export interface SendMessageResponse {
  requestId: string;
  requestTime: string;
  statusCode: string;
  statusName: StatusName;
}

export interface MessageRequestItem {
  requestId: string;
  messageId: string;
  requestTime: string;
  contentType: ContentType;
  type: SmsType;
  countryCode: string;
  from: string;
  to: string;
  status: MessageStatus;
  statusCode?: string;
  statusName?: StatusName;
  statusMessage?: string;
  completeTime?: string;
  telcoCode?: string;
}

export interface MessageRequestParams {
  requestId?: string;
  requestStartTime?: string;
  requestEndTime?: string;
  completeStartTime?: string;
  completeEndTime?: string;
  messageId?: string;
  type?: SmsType;
  contentType?: ContentType;
  from?: string;
  to?: string;
  statusName?: StatusName;
  pageSize?: number;
  nextToken?: string;
}

export interface MessageRequestResponse {
  statusCode: string;
  statusName: StatusName;
  messages: MessageRequestItem[];
  nextToken?: string;
  pageSize: number;
  itemCount: number;
  hasMore: boolean;
}

export interface MessageResultFile {
  name: string;
  fileId: string;
}

export interface MessageResultItem {
  requestId?: string;
  messageId?: string;
  requestTime: string;
  contentType: ContentType;
  type?: SmsType;
  subject?: string;
  content: string;
  countryCode: string;
  from: string;
  to: string;
  status: MessageStatus;
  statusCode: string;
  statusName: StatusName;
  statusMessage: string;
  completeTime: string;
  telcoCode: string;
  files?: MessageResultFile[];
}

export interface MessageResultResponse {
  statusCode: string;
  statusName: StatusName;
  messages: MessageResultItem[];
}

export interface FileUploadRequest {
  fileName: string;
  fileBody: string;
}

export interface FileUploadResponse {
  fileId: string;
  createTime: string;
  expireTime: string;
}

export interface ReserveStatusResponse {
  reserveId: string;
  reserveTime: string;
  reserveTimeZone: string;
  reserveStatus: ReserveStatus;
}

export type UnsubscribeRegisterType = "C" | "M" | "MC";

export interface UnsubscribeItem {
  clientTelNo: string;
  registerType: UnsubscribeRegisterType;
  registerTime: string;
}

export interface UnsubscribeListParams {
  clientTelNo?: string;
  pageSize?: number;
  pageIndex?: number;
  startTime?: number;
  endTime?: number;
}

export interface UnsubscribeCreateRequest {
  clientTelNo: string;
}

export interface UnsubscribeDeleteRequest {
  clientTelNo: string;
}
