import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface AddressBookDetailTableSearchProps {
  onSearch: (value: string) => void;
}

export default function AddressBookDetailTableSearch({
  onSearch,
}: AddressBookDetailTableSearchProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSearch = () => {
    onSearch(inputValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
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
            placeholder="이름 또는 전화번호 검색"
            className="w-[210px] pl-9"
          />
        </div>
        <Button type="button" variant="outline" onClick={handleSearch}>
          검색
        </Button>
      </div>
    </div>
  );
}
