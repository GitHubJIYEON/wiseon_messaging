import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { addressBookGroupApi } from "@/features/address-book/api/addressBookApi";
import type { AddressBookGroupListParams } from "@/features/address-book/types/addressBookGroup";

export const useAddressBookListQuery = (params: AddressBookGroupListParams) => {
  const { data, isPending } = useQuery({
    queryKey: ["address-book-group-list", params],
    queryFn: () => addressBookGroupApi.getAddressBookGroupList(params),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  return {
    data,
    isPending,
  };
};

export const useInvalidateAddressBookGroupList = () => {
  const queryClient = useQueryClient();

  const invalidateAddressBookGroupList = () => {
    queryClient.invalidateQueries({ queryKey: ["address-book-group-list"] });
  };

  return invalidateAddressBookGroupList;
};
