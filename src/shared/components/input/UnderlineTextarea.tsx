import { ComponentProps, forwardRef, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const UnderlineTextarea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 높이를 auto로 설정하여 scrollHeight를 정확히 계산
    textarea.style.height = "auto";
    // scrollHeight로 높이 설정
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [props.value]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    props.onInput?.(e);
  };

  return (
    <textarea
      ref={(node) => {
        textareaRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      data-slot="textarea"
      rows={1}
      className={cn(
        "focus:border-primary-500 min-h-10 w-full resize-none overflow-hidden rounded-none border-b border-gray-300 bg-transparent px-[14px] py-2 text-gray-700 transition-colors placeholder:text-gray-600 focus:border-b focus:outline-none",
        "aria-invalid:border-destructive",
        className,
      )}
      onInput={handleInput}
      maxLength={1000}
      {...props}
    />
  );
});

UnderlineTextarea.displayName = "UnderlineTextarea";
