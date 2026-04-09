import { InputHTMLAttributes, useEffect, useState } from "react";
import { Input } from "@/shared/components/ui/input";

interface DebouncedInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
}

export function DebouncedInput({
  className,
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: DebouncedInputProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <Input
      type="text"
      className={className}
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
