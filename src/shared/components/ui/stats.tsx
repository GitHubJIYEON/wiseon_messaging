import * as React from "react";
import { cn } from "@/lib/utils";

function Stats({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stats"
      className={cn("rounded-md bg-white p-7", className)}
      {...props}
    />
  );
}

interface StatsSummaryHeaderProps {
  icon?: React.ReactNode;
  title?: string;
  value?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

function StatsSummaryHeader({
  icon,
  title,
  value,
  description,
  action,
  className,
}: StatsSummaryHeaderProps) {
  return (
    <>
      <div className={cn("flex items-center justify-between", className)}>
        <div className="flex items-center gap-6">
          {icon && (
            <div className="bg-primary-50 text-primary-500 flex h-12 w-12 items-center justify-center rounded-full [&>svg]:size-5">
              {icon}
            </div>
          )}
          <div className="flex flex-col gap-1">
            {title && (
              <h2 className="font-apple-medium text-[16px] text-gray-600">
                {title}
              </h2>
            )}
            <div className="flex flex-row items-baseline gap-2">
              {value && (
                <span className="font-apple-bold text-[22px] leading-tight tracking-wide text-gray-900">
                  {value}
                </span>
              )}
              {description && (
                <span className="font-apple-light text-[14px] text-gray-500">
                  {description}
                </span>
              )}
            </div>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <hr className="my-5 border-gray-200" />
    </>
  );
}

export { Stats, StatsSummaryHeader };
