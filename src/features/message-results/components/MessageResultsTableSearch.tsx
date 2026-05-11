import { useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import excelIcon from "@/assets/icons/excel_icon.png";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface MessageResultsTableSearchProps {
  onSearch: (value: string) => void;
  onRefresh: () => void;
  lastRefreshedAt: Date;
}

export default function MessageResultsTableSearch({
  onSearch,
  onRefresh,
  lastRefreshedAt,
}: MessageResultsTableSearchProps) {
  const [messageType, setMessageType] = useState("");
  const [contentType, setContentType] = useState("");
  const [statusType, setStatusType] = useState("");
  const [inputValue, setInputValue] = useState("");

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Field className="w-[140px]">
            {/* <FieldLabel htmlFor="message-type-select"></FieldLabel> */}
            <Select
              value={messageType}
              onValueChange={(value: string) => setMessageType(value)}
            >
              <SelectTrigger id="message-type-select">
                <SelectValue placeholder="메시지 종류" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="LMS">LMS</SelectItem>
                  <SelectItem value="MMS">MMS</SelectItem>
                  <SelectItem value="ALIMTALK">알림톡</SelectItem>
                  <SelectItem value="FRIENDTALK">친구톡</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="w-[140px]">
            {/* <FieldLabel htmlFor="message-type-select"></FieldLabel> */}
            <Select
              value={contentType}
              onValueChange={(value: string) => setContentType(value)}
            >
              <SelectTrigger id="content-type-select">
                <SelectValue placeholder="발송 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="COMMON">일반</SelectItem>
                  <SelectItem value="AD">광고</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="w-[140px]">
            {/* <FieldLabel htmlFor="message-type-select"></FieldLabel> */}
            <Select
              value={statusType}
              onValueChange={(value: string) => setStatusType(value)}
            >
              <SelectTrigger id="status-type-select">
                <SelectValue placeholder="발송 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="COMPLETED">성공</SelectItem>
                  <SelectItem value="RESERVED">예약</SelectItem>
                  <SelectItem value="FAILED">실패</SelectItem>
                  <SelectItem value="CANCELED">취소</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="발신 번호 검색"
              className="w-[210px] pl-9"
            />
          </div>
          <Button type="button" variant="outline" onClick={handleSearch}>
            검색
          </Button>
        </div>
        <Button type="button" variant="outline">
          <img src={excelIcon} alt="다운로드" className="size-4" />
          다운로드
        </Button>
      </div>

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
