import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface CallingNumberTableSearchProps {
  onSearch: (value: string) => void;
}

export default function CallingNumberTableSearch({
  onSearch,
}: CallingNumberTableSearchProps) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");

  const handleSearch = () => {
    onSearch(inputValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {/* 기간 선택 */}

        {/* 번호 검색 */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="전화번호 검색"
            className="h-9 w-[200px] pl-9"
          />
        </div>
        <Button type="button" variant="outline" onClick={handleSearch}>
          검색
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => void navigate("/calling-number/new")}
      >
        발신번호 등록
      </Button>
    </div>
  );
}
