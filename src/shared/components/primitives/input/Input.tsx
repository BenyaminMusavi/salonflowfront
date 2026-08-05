"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/shared/utils/className";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  /** آیکون سمت راست (RTL) */
  startIcon?: React.ReactNode;
  /** آیکون سمت چپ (RTL) */
  endIcon?: React.ReactNode;
  startIconClassName?: string;
  endIconClassName?: string;
  inputWrapperClassname?: string;
  endIconClickable?: boolean;
  onEndIconClick?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      hasError,
      startIcon,
      endIcon,
      startIconClassName,
      endIconClassName,
      endIconClickable = false,
      onEndIconClick,
      inputWrapperClassname,
      ...props
    },
    ref
  ) => {
    const isPasswordType = type === "password";
    const [showPassword, setShowPassword] = React.useState(false);

    const handleEndIconAction = () => {
      if (isPasswordType) {
        setShowPassword((s) => !s);
        return;
      }
      if (endIconClickable && onEndIconClick) onEndIconClick();
    };

    const finalType = isPasswordType
      ? showPassword
        ? "text"
        : "password"
      : type;

    return (
      <motion.div dir="rtl" className="flex w-full h-full">
        <div
          className={cn(
            "relative transition flex items-center w-full rounded-[2px]",
            "bg-input border border-input-border",
            "hover:bg-input-hover",
            "focus-within:bg-input-focus focus-within:border-border-strong",
            "focus-within:inset-ring-2 focus-within:inset-ring-primary",
            hasError && "!inset-ring-2 !inset-ring-error",
            inputWrapperClassname
          )}
        >
          {/* Start Icon (right in RTL) */}
          {startIcon && (
            <div
              className={cn(
                "flex justify-center w-[30px] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60",
                startIconClassName
              )}
            >
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            type={finalType}
            className={cn(
              "w-full h-full rounded-[2px] bg-transparent text-sm text-foreground",
              "min-h-12 px-4 py-2.5",
              "placeholder:text-input-placeholder",
              "focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              startIcon && "pr-12",
              (endIcon || isPasswordType) && "pl-12",
              className
            )}
            {...props}
          />

          {/* End Icon / Password Toggle (left in RTL) */}
          {(endIcon || isPasswordType) && (
            <div
              className={cn(
                "absolute transition left-3 top-1/2 -translate-y-1/2",
                (endIconClickable || isPasswordType)
                  ? "cursor-pointer text-foreground/60 hover:text-foreground/80"
                  : "text-foreground/60",
                endIconClassName
              )}
              onClick={(e) => {
                e.preventDefault();
                handleEndIconAction();
              }}
              role={endIconClickable || isPasswordType ? "button" : undefined}
              tabIndex={endIconClickable || isPasswordType ? 0 : -1}
              onKeyDown={(e) => {
                if (
                  (endIconClickable || isPasswordType) &&
                  (e.key === "Enter" || e.key === " ")
                ) {
                  e.preventDefault();
                  handleEndIconAction();
                }
              }}
            >
              {isPasswordType ? (
                showPassword ? (
                  <EyeOff className="text-foreground h-5 w-5" />
                ) : (
                  <Eye className="text-foreground h-5 w-5" />
                )
              ) : (
                endIcon
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

Input.displayName = "Input";

export { Input };
