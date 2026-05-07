import { useCallback, useState } from "react";
import { addYears, endOfYear, format } from "date-fns";
import type { Matcher } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "../ui/button";

interface DateSelectorProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabled?: Matcher | Matcher[];
  inputClassName?: string;
  inputPlaceholder?: string;
  placeholderClassName?: string;
  defaultMonth?: Date;
  startMonth?: Date;
  endMonth?: Date;
  hasError?: boolean;
}

export function DateSelector({
  selected,
  onSelect,
  disabled,
  inputClassName,
  inputPlaceholder,
  placeholderClassName,
  defaultMonth,
  startMonth,
  endMonth = endOfYear(addYears(new Date(), 10)), //  현재로부터 10년 후 해당 년도의 12월 31일까지
  hasError = false,
}: DateSelectorProps) {
  const [open, setOpen] = useState(false);

  const onSelectDate = useCallback(
    (date: Date | undefined) => {
      onSelect(date);
      setOpen(false); // 날짜 선택 시 팝오버 닫기
    },
    [onSelect],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="none"
          className={cn(
            "flex h-[42px] w-[200px] cursor-pointer items-center justify-center rounded border border-gray-300 bg-white text-base text-gray-700",
            inputClassName,
            hasError && "border-destructive",
          )}
        >
          {selected && format(selected, "yyyy-MM-dd")}
          {!selected && inputPlaceholder && (
            <span className={cn("text-point-gray-600", placeholderClassName)}>
              {inputPlaceholder}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelectDate}
          disabled={disabled}
          captionLayout="dropdown"
          defaultMonth={defaultMonth}
          startMonth={startMonth}
          endMonth={endMonth}
        />
      </PopoverContent>
    </Popover>
  );
}
