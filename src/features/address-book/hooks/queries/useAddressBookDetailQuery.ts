import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { addressBookDetailApi } from "../../api/addressBookDetailApi";

export const useAddressBookDetailQuery = (groupId: number) => {
  const { data, isPending } = useQuery({
    queryKey: ["address-book-detail", groupId],
    queryFn: () => addressBookDetailApi.getAddressBookDetail(groupId),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  return {
    data,
    isPending,
  };
};
