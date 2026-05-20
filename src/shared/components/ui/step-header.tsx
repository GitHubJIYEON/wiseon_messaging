import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";

interface StepHeaderProps {
  number: number;
  title: string;
  titleClassName?: string;
  required?: boolean;
  className?: string;
}

function StepHeader({
  number,
  title,
  titleClassName,
  required = false,
  className,
}: StepHeaderProps) {
  return (
    <div className={cn("flex flex-row items-center gap-2", className)}>
      <span className="bg-primary-500 flex size-6 items-end justify-center rounded-md text-[13px] font-bold text-white">
        {number}
      </span>
      <h4 className={cn("text-md", titleClassName)}>{title}</h4>
      {required && (
        <Badge className="ml-auto" variant="red">
          {required ? "필수" : "선택"}
        </Badge>
      )}
    </div>
  );
}

export { StepHeader };
