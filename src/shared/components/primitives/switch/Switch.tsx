"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import {cn} from "@/shared/utils/className";
import {CheckIcon} from "@phosphor-icons/react"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    dir={"rtl"}
    className={cn(
      "peer group inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
      "data-[state=checked]:bg-surface-success-fill data-[state=unchecked]:bg-surface-disabled",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:!bg-surface-disabled",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        " pointer-events-none flex items-center justify-center h-6 w-6 rounded-full bg-content-white",
        "shadow-[0px_2px_4px_rgba(0,0,0,.10)] ring-0 transition-transform group-disabled:!bg-content-secondary",
        "data-[state=checked]:-translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    >
      <CheckIcon
        className="opacity-0  transition-opacity group-disabled:text-surface-disabled group-data-[state=checked]:opacity-100 text-surface-success-fill"
        size={14}
        weight={"bold"}
      />
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
