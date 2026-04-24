import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/utils/className";

const badgeVariants = cva(
  "flex items-center text-[12px] justify-center rounded-full border border-transparent font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "",
        brand: "",
        success: "",
        warning: "",
        error: "",
      },
      kind: {
        normal: "",
        fill: "",
      },
      size: {
        sm: "h-5 px-2",
        md: "h-6 px-[10px]",
      },
      disabled: {
        true: "bg-surface-quaternary text-content-disabled cursor-not-allowed",
        false: ""
      }
    },
    compoundVariants: [
      // --- Default ---
      { variant: "default", kind: "normal", disabled: false, className: "bg-surface-tertiary text-content-primary" },
      { variant: "default", kind: "fill", disabled: false, className: "bg-surface-fill text-content-white" },

      // --- Brand ---
      { variant: "brand", kind: "normal", disabled: false, className: "bg-surface-brand text-content-brand" },
      { variant: "brand", kind: "fill", disabled: false, className: "bg-surface-brand-fill text-content-white" },

      // --- Success ---
      { variant: "success", kind: "normal", disabled: false, className: "bg-surface-success text-content-success" },
      { variant: "success", kind: "fill", disabled: false, className: "bg-surface-success-fill text-content-white" },

      // --- Warning ---
      { variant: "warning", kind: "normal", disabled: false, className: "bg-surface-warning text-content-warning" },
      { variant: "warning", kind: "fill", disabled: false, className: "bg-surface-warning-fill text-content-white" },

      // --- Error ---
      { variant: "error", kind: "normal", disabled: false, className: "bg-surface-error text-content-error" },
      { variant: "error", kind: "fill", disabled: false, className: "bg-surface-error-fill text-content-white" },
    ],
    defaultVariants: {
      variant: "default",
      kind: "normal",
      size: "md",
      disabled: false
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

function Badge({
                 className,
                 variant,
                 kind,
                 size,
                 disabled = false,
                 asChild = false,
                 ...props
               }: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, kind, size, disabled }), className)}
      aria-disabled={disabled || undefined}
      {...props}
    />
  )
}

export { Badge, badgeVariants }