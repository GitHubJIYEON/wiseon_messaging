import { apiClient } from "@/shared/apis/apiClient";
import type { AddressBookDetail } from "../types/addressBookDetail";

// 주소록 그룹 상세 조회
export const addressBookDetailApi = {
  getAddressBookDetail: (groupId: number) => {
    return apiClient.get<AddressBookDetail>(
      `/address-books/members/${groupId}`,
    );
  },
};
