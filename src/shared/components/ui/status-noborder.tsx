import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const noBorderStatusVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full border px-2.5 py-1 font-medium text-xs transition-colors",
  {
    variants: {
      variant: {
        gray: "border-none text-gray-500 **:data-[slot=status-indicator]:bg-gray-400 dark:text-gray-400 **:data-[slot=status-indicator]:dark:bg-gray-500",
        green:
          "border-none text-green-600 **:data-[slot=status-indicator]:bg-green-400 dark:text-green-400 **:data-[slot=status-indicator]:dark:bg-green-500",
        red: "border-none text-red-500 **:data-[slot=status-indicator]:bg-red-400 dark:text-red-400 **:data-[slot=status-indicator]:dark:bg-red-500",
        orange:
          "border-none text-orange-500 **:data-[slot=status-indicator]:bg-orange-400 dark:text-orange-400 **:data-[slot=status-indicator]:dark:bg-orange-500",
        blue: "border-none text-blue-500 **:data-[slot=status-indicator]:bg-blue-400 dark:text-blue-400 **:data-[slot=status-indicator]:dark:bg-blue-500",
        yellow:
          "border-none text-yellow-600 **:data-[slot=status-indicator]:bg-yellow-400 dark:text-yellow-400 **:data-[slot=status-indicator]:dark:bg-yellow-500",
      },
    },
    defaultVariants: {
      variant: "gray",
    },
  },
);

interface NoBorderStatusProps
  extends
    VariantProps<typeof noBorderStatusVariants>,
    React.ComponentProps<"div"> {
  asChild?: boolean;
}

function NoBorderStatus(props: NoBorderStatusProps) {
  const { className, variant = "gray", asChild, ...rootProps } = props;

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <RootPrimitive
      data-slot="status"
      data-variant={variant}
      {...rootProps}
      className={cn(noBorderStatusVariants({ variant }), className)}
    />
  );
}

function NoBorderStatusIndicator(props: React.ComponentProps<"div">) {
  const { className, ...indicatorProps } = props;

  return (
    <div
      data-slot="status-indicator"
      {...indicatorProps}
      className={cn(
        "relative flex size-2 shrink-0 rounded-full",
        "before:absolute before:inset-0 before:animate-ping before:rounded-full before:bg-inherit",
        "after:absolute after:inset-[2px] after:rounded-full after:bg-inherit",
        className,
      )}
    />
  );
}

function NoBorderStatusLabel(props: React.ComponentProps<"div">) {
  const { className, ...labelProps } = props;

  return (
    <div className="relative flex items-center gap-1.5">
      <div
        className="relative flex size-2 shrink-0 rounded-full"
        data-slot="status-indicator"
      />
      <div
        data-slot="status-label"
        {...labelProps}
        className={cn("leading-none", className)}
      />
    </div>
  );
}

export {
  NoBorderStatus,
  NoBorderStatusIndicator,
  NoBorderStatusLabel,
  noBorderStatusVariants,
};
