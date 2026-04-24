"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/shared/utils/className";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
  /** Right icon in RTL */
  startIcon?: React.ReactNode;
  startIconClassName?: string;
  inputWrapperClassname?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      hasError,
      startIcon,
      startIconClassName,
      inputWrapperClassname,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div dir="rtl" className="flex w-full">
        <div
          className={cn(
            "relative transition flex w-full rounded-[2px] bg-surface-tertiary",
            "focus-within:inset-ring-2 focus-within:inset-ring-primary",
            hasError && "!inset-ring-2 !inset-ring-content-error",
            inputWrapperClassname
          )}
        >
          {/* Start Icon (positioned top-right for textareas) */}
          {startIcon && (
            <div
              className={cn(
                "flex justify-center w-[30px] pointer-events-none absolute right-3 top-4 text-secondary-60",
                startIconClassName
              )}
            >
              {startIcon}
            </div>
          )}

          <textarea
            ref={ref}
            className={cn(
              "w-full rounded-[2px] bg-transparent text-sm text-black",
              "min-h-32 px-4 py-2.5 resize-none", // resize-none by default
              "placeholder:text-neutral-400",
              "focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              startIcon && "pr-12",
              className
            )}
            {...props}
          />
        </div>
      </motion.div>
    );
  }
);

TextArea.displayName = "TextArea";

export { TextArea };