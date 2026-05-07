import { useState, type ComponentProps } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/components/ui/input-group";

export function PasswordInput({
  onChange,
  value,
  defaultValue,
  className,
  inputClassName,
  ...props
}: Omit<ComponentProps<typeof Input>, "type"> & { inputClassName?: string }) {
  const [showPassword, setShowPassword] = useState(false);

  const Icon = showPassword ? EyeOffIcon : EyeIcon;

  return (
    <InputGroup className={className}>
      <InputGroupInput
        {...props}
        value={value}
        defaultValue={defaultValue}
        type={showPassword ? "text" : "password"}
        onChange={onChange}
        className={inputClassName}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          onClick={() => setShowPassword((p) => !p)}
        >
          <Icon className="size-4.5" />
          <span className="sr-only">
            {showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          </span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
