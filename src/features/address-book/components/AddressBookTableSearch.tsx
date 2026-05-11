import { useState } from "react";
import { PlusIcon, RefreshCw, Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface AddressBookTableSearchProps {
  onSearch: (value: string) => void;
}

export default function AddressBookTableSearch({
  onSearch,
}: AddressBookTableSearchProps) {
  const [inputValue, setInputValue] = useState("");
  const [groupName, setGroupName] = useState("");
  const [open, setOpen] = useState(false);

  const handleSearch = () => {
    onSearch(inputValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleAddGroup = () => {
    console.log(groupName);
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };

  return (
    <div className="mb-4 flex items-center justify-between">
      {/* 검색 */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="그룹명 검색"
            className="w-[210px] pl-9"
          />
        </div>
        <Button type="button" variant="outline" onClick={handleSearch}>
          검색
        </Button>
      </div>

      {/* 버튼 */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button type="button" variant="dark">
            <PlusIcon className="size-4" />
            그룹 추가
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>그룹 추가</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 p-7">
            <Field>
              <FieldLabel className="font-apple-semibold">
                주소록 그룹명
              </FieldLabel>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="주소록 그룹명을 입력해주세요."
              />
            </Field>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button type="button" variant="dark" onClick={handleAddGroup}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
