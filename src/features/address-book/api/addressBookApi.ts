import { apiClient } from "@/shared/apis/apiClient";
import type {
  AddressBookGroupCreateParams,
  AddressBookGroupListParams,
  AddressBookGroupListResponse,
} from "../types/addressBookGroup";

export const addressBookGroupApi = {
  getAddressBookGroupList: (params: AddressBookGroupListParams) => {
    return apiClient.get<AddressBookGroupListResponse>(
      `/address-books/groups`,
      { params },
    );
  },

  // 그룹 추가
  addAddressBookGroup: (data: AddressBookGroupCreateParams) => {
    return apiClient.post<AddressBookGroupCreateParams>(
      `/address-books/groups`,
      data,
    );
  },

  // 그룹 삭제
  deleteAddressBookGroups: (ids: number[]) => {
    return apiClient.delete<null>(`/address-books/groups`, { data: ids });
  },
};
