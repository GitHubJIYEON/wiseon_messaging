import { useState } from "react";
import { PlusIcon, RefreshCw, Search } from "lucide-react";
import excelIcon from "@/assets/icons/excel_icon.png";
import UnsubscribesDialog from "@/features/unsubscribes/components/UnsubscribesDialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface UnsubscribesTableSearchProps {
  onSearch: (value: string) => void;
  onRefresh: () => void;
  lastRefreshedAt: Date;
}

export default function UnsubscribesTableSearch({
  onSearch,
  onRefresh,
  lastRefreshedAt,
}: UnsubscribesTableSearchProps) {
  const [inputValue, setInputValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSearch = () => {
    onSearch(inputValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleRefresh = () => {
    setInputValue("");
    onSearch("");
    onRefresh();
  };

  const formattedDate = lastRefreshedAt.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="mb-4 flex flex-col gap-3">
      {/* 검색 + 우측 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="번호 검색"
              className="w-[210px] pl-9"
            />
          </div>
          <Button type="button" variant="outline" onClick={handleSearch}>
            검색
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline">
            <img src={excelIcon} alt="다운로드" className="size-4" />
            다운로드
          </Button>
          <UnsubscribesDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            trigger={
              <Button
                type="button"
                variant="default"
                onClick={() => setDialogOpen(true)}
              >
                <PlusIcon className="size-4" />
                번호 추가
              </Button>
            }
          />
        </div>
      </div>

      {/* 새로고침 */}
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" onClick={handleRefresh} className="gap-1.5">
          <RefreshCw className="size-3.5" />
        </Button>
        <span className="font-apple-medium text-[13px] text-gray-500">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}
