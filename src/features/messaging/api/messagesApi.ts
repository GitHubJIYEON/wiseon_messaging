import { messagingApiClient } from "@/shared/apis/messaging";
import type {
  FileUploadRequest,
  FileUploadResponse,
  MessageRequestParams,
  MessageRequestResponse,
  MessageResultResponse,
  ReserveStatusResponse,
  SendMessageRequest,
  SendMessageResponse,
  UnsubscribeCreateRequest,
  UnsubscribeDeleteRequest,
  UnsubscribeItem,
  UnsubscribeListParams,
} from "../types/messages";

export const messagesApi = {
  sendMessage: async (data: SendMessageRequest) => {
    return messagingApiClient.post<SendMessageResponse>("messages", data);
  },

  getMessageRequest: async (params: MessageRequestParams) => {
    return messagingApiClient.get<MessageRequestResponse>("messages", {
      params,
    });
  },

  getMessageResult: async (messageId: string) => {
    return messagingApiClient.get<MessageResultResponse>(
      `messages/${messageId}`,
    );
  },

  uploadFile: async (data: FileUploadRequest) => {
    return messagingApiClient.post<FileUploadResponse>("files", data);
  },

  getReserveStatus: async (reserveId: string) => {
    return messagingApiClient.get<ReserveStatusResponse>(
      `reservations/${reserveId}/reserve-status`,
    );
  },

  cancelReservation: async (reserveId: string) => {
    return messagingApiClient.delete(`reservations/${reserveId}`);
  },

  getUnsubscribes: async (params?: UnsubscribeListParams) => {
    return messagingApiClient.get<UnsubscribeItem[]>("unsubscribes", {
      params,
    });
  },

  createUnsubscribes: async (data: UnsubscribeCreateRequest[]) => {
    return messagingApiClient.post<UnsubscribeItem[]>("unsubscribes", data);
  },

  deleteUnsubscribes: async (data: UnsubscribeDeleteRequest[]) => {
    return messagingApiClient.delete("unsubscribes", { data });
  },
};
