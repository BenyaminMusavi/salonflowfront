import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import {cn} from "@/shared/utils/className";

const buttonVariants = cva(
  "inline-flex rounded-xl cursor-pointer items-center transition rounded-[2px] justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/[0.9]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/[0.9]",
        outline:
          "border border-border-primary hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-surface-secondary text-content-bold",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      shape: {
        default: "",
        rounded: "rounded-full"
      },
      size: {
        default: "h-12 px-4 py-2 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8",
        icon: "h-12 w-12 min-h-12 min-w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default"
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className, shape }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
