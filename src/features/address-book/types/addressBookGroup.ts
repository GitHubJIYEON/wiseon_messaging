export interface AddressBookGroupItem {
  groupId: number;
  groupName: string;
  groupCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddressBookGroupListResponse {
  content: AddressBookGroupItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface AddressBookGroupListParams {
  page?: number;
  size?: number;
  keyword?: string;
}

export interface AddressBookGroupCreateParams {
  groupName: string;
}
