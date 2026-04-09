import { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function UnderlineInput({
  className,
  type,
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      maxLength={500}
      className={cn(
        "focus:border-primary-500 h-10 w-full rounded-none border-b border-gray-300 bg-transparent px-[14px] text-gray-700 transition-colors placeholder:text-gray-600 focus:border-b focus:outline-none",
        "aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}
