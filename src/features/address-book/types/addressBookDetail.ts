export interface AddressBookDetail {
  groupId: number;
  groupName: string;
  members: AddressBookMember[];
}

export interface AddressBookMember {
  groupId: number;
  memberId: number;
  phoneNumber: string;
  memberName: string;
  position: string;
  organization: string;
  variables1: string;
  variables2: string;
  variables3: string;
  isBlocked: boolean;
  memberComment: string;
  createdAt: string;
  updatedAt: string;
}
