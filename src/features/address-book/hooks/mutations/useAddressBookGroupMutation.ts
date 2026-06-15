import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addressBookGroupApi } from "@/features/address-book/api/addressBookApi";
import type { AddressBookGroupCreateParams } from "../../types/addressBookGroup";

// 그룹 추가
export const useAddressBookGroupMutation = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: AddressBookGroupCreateParams) =>
      addressBookGroupApi.addAddressBookGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["address-book-group-list"] });
    },
  });

  return {
    mutateAsync,
    isPending,
  };
};

// 그룹 삭제
export const useDeleteAddressBookGroupMutation = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (ids: number[]) =>
      addressBookGroupApi.deleteAddressBookGroups(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["address-book-group-list"] });
    },
    onError: (error) => {
      console.error("그룹 삭제 실패: ", error);
    },
  });

  return {
    mutate,
    isPending,
  };
};
