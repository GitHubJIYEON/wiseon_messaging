import type { Control } from "react-hook-form";
import type { CallingNumberFormValues } from "@/features/calling-number/schemas/callingNumberForm";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";

const REQUEST_NOTE_MAX = 500;

export default function RequestNoteField({
  control,
}: {
  control: Control<CallingNumberFormValues>;
}) {
  return (
    <FormField
      control={control}
      name="requestNote"
      render={({ field }) => (
        <FormItem className="mt-4">
          <FormLabel className="sr-only">요청 내용</FormLabel>
          <FormControl>
            <Textarea
              placeholder="(선택) 사용 목적, 발신 대상, 추가 확인이 필요한 사항을 입력"
              maxLength={REQUEST_NOTE_MAX}
              {...field}
              onBlur={(e) => {
                field.onBlur();
                field.onChange(e.target.value.trim());
              }}
            />
          </FormControl>
          <div className="flex items-start justify-between gap-2">
            <FormMessage className="flex-1" />
            <span className="font-apple-light shrink-0 text-[12px] text-gray-500">
              {field.value.length}/{REQUEST_NOTE_MAX}
            </span>
          </div>
        </FormItem>
      )}
    />
  );
}
