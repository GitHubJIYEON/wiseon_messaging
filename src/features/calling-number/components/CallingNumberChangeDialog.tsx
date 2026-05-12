import { useState } from "react";
import callingNumberList from "@/features/calling-number/data/callingNumberList.json";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { formatPhoneNumber } from "@/shared/utils/formatPhoneNumber";

interface CallingNumberItem {
  id: number;
  phoneNumber: string;
  name: string;
  isDefault: boolean;
}

const list = callingNumberList as CallingNumberItem[];

interface CallingNumberChangeDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: React.ReactNode;
}

export default function CallingNumberChangeDialog({
  trigger,
  open,
  onOpenChange,
}: CallingNumberChangeDialogProps) {
  const defaultItem = list.find((item) => item.isDefault);
  const [selectedId, setSelectedId] = useState<number | null>(
    defaultItem?.id ?? null,
  );

  const handleConfirm = () => {
    const selected = list.find((item) => item.id === selectedId);
    console.log("기본번호 변경:", selected);
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>기본 발신번호 변경</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 p-7">
          <p className="text-[13px] text-gray-500">
            인증 상태가{" "}
            <span className="font-apple-medium text-green-600">
              정상 ({list.length}건)
            </span>{" "}
            인 발신번호만 기본번호로 설정할 수 있습니다.
          </p>

          <ScrollArea className="max-h-[340px] rounded-md border py-3 pl-3">
            <RadioGroup
              value={String(selectedId)}
              onValueChange={(val) => setSelectedId(Number(val))}
              className="flex flex-col gap-2 pr-3"
            >
              {list.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <label
                    key={item.id}
                    htmlFor={`radio-${item.id}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors",
                      isSelected
                        ? "border-primary-200 bg-primary-50"
                        : "border-gray-200 hover:bg-gray-50",
                    )}
                  >
                    <RadioGroupItem
                      id={`radio-${item.id}`}
                      value={String(item.id)}
                    />
                    <span className="font-apple-medium text-[14px] text-gray-900">
                      {formatPhoneNumber(item.phoneNumber)}
                    </span>
                    <span className="font-apple-light text-[13px] text-gray-500">
                      {item.name}
                    </span>
                    {item.isDefault && (
                      <Badge className="border-primary-200 bg-primary-50 text-primary-500 ml-auto shrink-0 text-[11px]">
                        현재 기본번호
                      </Badge>
                    )}
                  </label>
                );
              })}
            </RadioGroup>
          </ScrollArea>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button variant="default" onClick={handleConfirm}>
            변경하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
