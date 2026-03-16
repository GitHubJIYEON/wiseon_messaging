import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FullPageLoaderProps {
  className?: string;
}

export function FullPageLoader({ className }: FullPageLoaderProps) {
  return (
    <div
      className={cn(
        "flex h-[calc(100vh-var(--header-height)-var(--sub-header-height))] w-full items-center justify-center",
        className,
      )}
    >
      <Loader2 className="animate-spin text-gray-600" />
    </div>
  );
}
