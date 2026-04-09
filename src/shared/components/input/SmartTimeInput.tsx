import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/shared/components/ui/input";

export interface TimeValue {
  hour: number;
  minute: number;
  period: "AM" | "PM";
}

interface SmartTimeInputProps {
  value?: string; // "14:30:00" 형식
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  onChange?: (value: string) => void; // "14:30:00" 형식 반환
}

export const SmartTimeInput = forwardRef<HTMLInputElement, SmartTimeInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "ex) 14:30, 오후 02:30",
      className,
      disabled,
      id,
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState("");
    const [displayValue, setDisplayValue] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // value가 변경될 때 displayValue 업데이트
    useEffect(() => {
      if (value && !isEditing) {
        const timeValue = stringToTimeValue(value);
        if (timeValue) {
          setDisplayValue(formatTimeDisplay(timeValue));
          setInputValue("");
        }
      }
    }, [value, isEditing]);

    const handleFocus = () => {
      setIsEditing(true);
      setInputValue(displayValue || "");
      setDisplayValue("");
    };

    const handleBlur = () => {
      setIsEditing(false);

      // 빈 입력값 처리
      if (!inputValue.trim()) {
        setDisplayValue("");
        if (value) {
          onChange?.(""); // 빈 문자열로 반환
        }
        setInputValue("");
        return;
      }

      // 파싱 시도
      const parsedTime = parseTimeInput(inputValue);
      if (parsedTime) {
        setDisplayValue(formatTimeDisplay(parsedTime));
        onChange?.(timeValueToString(parsedTime));
        setInputValue("");
        return;
      }

      // 파싱 실패 시 이전 값으로 복원
      if (value) {
        const timeValue = stringToTimeValue(value);
        if (timeValue) {
          setDisplayValue(formatTimeDisplay(timeValue));
        }
      } else {
        setDisplayValue("");
      }

      setInputValue("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        inputRef.current?.blur();
      } else if (e.key === "Escape") {
        setInputValue("");
        inputRef.current?.blur();
      }
    };

    return (
      <Input
        ref={ref || inputRef}
        id={id}
        type="text"
        value={isEditing ? inputValue : displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("rounded transition-all duration-200", className)}
      />
    );
  },
);

// 24시간 형식을 12시간 형식으로 변환하는 유틸리티
const convert24to12 = (
  hour24: number,
): { hour: number; period: "AM" | "PM" } => {
  if (hour24 === 0) return { hour: 12, period: "AM" };
  if (hour24 <= 12)
    return { hour: hour24, period: hour24 === 12 ? "PM" : "AM" };
  return { hour: hour24 - 12, period: "PM" };
};

// "14:30:00" 형식 문자열을 TimeValue로 변환
const stringToTimeValue = (timeStr: string): TimeValue | null => {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;

  const hour24 = parseInt(match[1]);
  const minute = parseInt(match[2]);

  if (hour24 > 23 || minute > 59) return null;

  const { hour, period } = convert24to12(hour24);
  return { hour, minute, period };
};

// TimeValue를 "14:30:00" 형식 문자열로 변환
const timeValueToString = (timeValue: TimeValue): string => {
  let hour24 = timeValue.hour;
  if (timeValue.period === "PM" && timeValue.hour !== 12) {
    hour24 += 12;
  } else if (timeValue.period === "AM" && timeValue.hour === 12) {
    hour24 = 0;
  }
  return `${hour24.toString().padStart(2, "0")}:${timeValue.minute.toString().padStart(2, "0")}:00`;
};

// 오전/오후 문자열을 AM/PM으로 변환
const normalizePeriod = (periodStr: string): "AM" | "PM" => {
  const normalized = periodStr.toLowerCase();
  return normalized === "오후" || normalized === "pm" ? "PM" : "AM";
};

/**
 * 스마트 시간 입력 파서 - 핵심 형식 지원
 * 지원 형식: 14:00, 2:30pm, 오후 2시, 2시 30분, 1430, 2
 */
const parseTimeInput = (input: string): TimeValue | null => {
  if (!input.trim()) return null;

  const normalized = input.trim().toLowerCase();

  // 1. 24시간 형식: 14:30
  const time24Match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (time24Match) {
    const hour24 = parseInt(time24Match[1]);
    const minute = parseInt(time24Match[2]);
    if (hour24 > 23 || minute > 59) return null;

    const { hour, period } = convert24to12(hour24);
    return { hour, minute, period };
  }

  // 2. 12시간 형식: 2:30pm, 2pm
  const time12Match = normalized.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(am|pm|오전|오후)$/,
  );
  if (time12Match) {
    const hour = parseInt(time12Match[1]);
    const minute = parseInt(time12Match[2] || "0");
    const period = normalizePeriod(time12Match[3]);

    if (hour < 1 || hour > 12 || minute > 59) return null;
    return { hour, minute, period };
  }

  // 3. 한국어 시:분 형식: 오후 05:02, 오전 10:30
  const koreanTimeMatch = normalized.match(/^(오전|오후)\s*(\d{1,2}):(\d{2})$/);
  if (koreanTimeMatch) {
    const period = normalizePeriod(koreanTimeMatch[1]);
    const hour = parseInt(koreanTimeMatch[2]);
    const minute = parseInt(koreanTimeMatch[3]);

    if (hour < 1 || hour > 12 || minute > 59) return null;
    return { hour, minute, period };
  }

  // 4. 한국어 형식: 오후 2시, 오전 10시 30분
  const koreanMatch = normalized.match(
    /^(오전|오후)\s*(\d{1,2})시?(?:\s*(\d{1,2})분?)?$/,
  );
  if (koreanMatch) {
    const period = normalizePeriod(koreanMatch[1]);
    const hour = parseInt(koreanMatch[2]);
    const minute = parseInt(koreanMatch[3] || "0");

    if (hour < 1 || hour > 12 || minute > 59) return null;
    return { hour, minute, period };
  }

  // 5. 한국어 형식 (시간 우선): 2시 30분, 14시 30분
  const koreanSimpleMatch = normalized.match(
    /^(\d{1,2})시(?:\s*(\d{1,2})분?)?$/,
  );
  if (koreanSimpleMatch) {
    const hourInput = parseInt(koreanSimpleMatch[1]);
    const minute = parseInt(koreanSimpleMatch[2] || "0");
    if (minute > 59) return null;

    // 24시간 형식인지 12시간 형식인지 판단
    if (hourInput > 12) {
      // 24시간 형식
      if (hourInput > 23) return null;
      const { hour, period } = convert24to12(hourInput);
      return { hour, minute, period };
    } else {
      // 12시간 형식 (기본값: 오전)
      const hour = hourInput === 0 ? 12 : hourInput;
      const period = "AM";
      return { hour, minute, period };
    }
  }

  // 6. 숫자만: 1430, 230, 14
  const numMatch = normalized.match(/^(\d{1,4})$/);
  if (numMatch) {
    const num = parseInt(numMatch[1]);

    if (num <= 12) {
      // 1-12: 시간만 (12는 정오, 나머지는 오전)
      return {
        hour: num === 0 ? 12 : num,
        minute: 0,
        period: num === 12 ? "PM" : "AM",
      };
    } else if (num <= 24) {
      // 13-24: 24시간 형식 (24는 자정으로 처리)
      const hour24 = num === 24 ? 0 : num;
      const { hour, period } = convert24to12(hour24);
      return { hour, minute: 0, period };
    } else if (num >= 100 && num <= 2400) {
      // HHMM 형식 (2400은 자정으로 처리)
      const hour24 = num === 2400 ? 0 : Math.floor(num / 100);
      const minute = num % 100;
      if (hour24 > 23 || minute > 59) return null;

      const { hour, period } = convert24to12(hour24);
      return { hour, minute, period };
    }
  }

  return null;
};

/**
 * TimeValue를 한국어 표시 형식으로 변환
 * 예: { hour: 2, minute: 30, period: "PM" } -> "오후 02:30"
 */
const formatTimeDisplay = (time: TimeValue): string => {
  const hourStr = time.hour.toString().padStart(2, "0");
  const minuteStr = time.minute.toString().padStart(2, "0");
  const periodStr = time.period === "AM" ? "오전" : "오후";
  return `${periodStr} ${hourStr}:${minuteStr}`;
};
