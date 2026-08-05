"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "@/shared/utils/className";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerTitle,
} from "@/shared/components/primitives/drawer/Drawer";

type SelectContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
  isMobile: boolean;
  value?: string;
  onValueChange?: (val: string) => void;
};

const SelectContext = React.createContext<SelectContextType | null>(null);

const useSelect = () => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("Select components must be inside <Select />");
  return ctx;
};
const Select = (
  props: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>,
) => {
  // 1. Track if the component has mounted on the client
  const [mounted, setMounted] = React.useState(false);
  const isMobileQuery = useMediaQuery("(max-width: 768px)");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 2. ONLY treat as mobile if we are actually on the client (mounted)
  // This ensures the Server and the First Client Render match (both false)
  const isMobile = mounted && isMobileQuery;

  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = props.open ?? internalOpen;
  const setOpen = props.onOpenChange ?? setInternalOpen;

  const contextValue = {
    open,
    setOpen,
    isMobile,
    value: props.value,
    onValueChange: props.onValueChange,
  };

  // On Mobile: We skip Radix Root to avoid focus/aria conflicts
  if (isMobile) {
    return (
      <SelectContext.Provider value={contextValue}>
        {props.children}
      </SelectContext.Provider>
    );
  }

  // On Server & Desktop: Use Radix Root
  return (
    <SelectPrimitive.Root {...props} open={open} onOpenChange={setOpen}>
      <SelectContext.Provider value={contextValue}>
        {props.children}
      </SelectContext.Provider>
    </SelectPrimitive.Root>
  );
};
const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
  hasError?: boolean;
  icon?: React.ReactNode; // Add icon prop
}
>(({ className, children, hasError, icon, ...props }, ref) => {
  const { isMobile, setOpen } = useSelect();

  const commonClass = cn(
    "flex h-12 w-full items-center justify-between rounded-[2px] px-3 text-sm text-foreground",
    "bg-input border border-input-border",
    "hover:bg-input-hover hover:border-border-hover",
    "focus-visible:outline-none focus-visible:bg-input-focus focus-visible:border-border-strong",
    "focus-visible:inset-ring-2 focus-visible:inset-ring-primary",
    "disabled:cursor-not-allowed disabled:opacity-50",
    hasError && "!inset-ring-2 !inset-ring-error",
    className,
  );

  const triggerContent = (
    <div className="flex items-center gap-4 overflow-hidden">
      {icon && <span className="shrink-0 text-foreground">{icon}</span>}
      <span className="truncate">{children}</span>
    </div>
  );

  if (isMobile) {
    return (
      <button type="button" ref={ref} className={commonClass} onClick={() => setOpen(true)} {...props}>
        {triggerContent}
        <ChevronDownIcon className="h-5 w-5 opacity-60 shrink-0" />
      </button>
    );
  }

  return (
    <SelectPrimitive.Trigger ref={ref} className={commonClass} {...(props as any)}>
      {triggerContent}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="h-5 w-5 opacity-60 shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = ({
  children,
  className,
  position = "popper",
  drawerLabel,
  ...props
}: any) => {
  const { isMobile, open, setOpen } = useSelect();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerOverlay />
        <DrawerContent className="pb-8 pt-2">
          <DrawerTitle className="text-center text-base text-foreground font-medium my-4">{drawerLabel}</DrawerTitle>
          <DrawerDescription className="sr-only">
            یک مورد را انتخاب کنید
          </DrawerDescription>
          <div className="flex flex-col space-y-1 overflow-y-auto">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        // FIX: Set position to "popper" to prevent it from overlapping the trigger
        position={position}
        // Optional: Adds 4px space between the trigger and the dropdown
        sideOffset={4}
        className={cn(
          "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-background-elevated text-foreground shadow-md",
          // When position="popper", Radix allows these data attributes for better styling
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            // Required for popper position to handle width correctly
            position === "popper" &&
              "h-[var(--radix-select-content-available-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
};

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { icon?: React.ReactNode } // Add icon prop
>(({ className, children, value, icon, ...props }, ref) => {
  const { isMobile, onValueChange, setOpen, value: selectedValue } = useSelect();

  const itemContent = (
    <div className="flex items-center gap-4">
      {icon && <span className="shrink-0 text-foreground">{icon}</span>}
      <span className={"mt-1"}>{children}</span>
    </div>
  );

  if (isMobile) {
    const isSelected = selectedValue === value;
    return (
      <button
        type="button"
        onClick={() => {
          onValueChange?.(value);
          setOpen(false);
        }}
        className={cn(
          "flex w-full items-center justify-between px-6 py-4 text-base text-foreground transition-colors border-b border-border focus:bg-surface-hover",
          className
        )}
      >
        {itemContent}
        {isSelected ? (
          <span className="w-5 h-5 bg-white border-[6px] border-success rounded-full" />
        ) : (
          <span className="w-5 h-5 bg-white border-2 border-border rounded-full" />
        )}
      </button>
    );
  }

  return (
    <SelectPrimitive.Item
      ref={ref}
      value={value}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm text-foreground outline-none focus:bg-surface-hover focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{itemContent}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = "SelectItem";

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ children, placeholder, ...props }, ref) => {
  const { isMobile } = useSelect();

  if (isMobile) {
    // On Mobile: Render a plain span.
    // We use the 'children' (selectedLabel) we passed from the Form component.
    return (
      <span className="block truncate text-sm text-foreground">
        {children || (
          <span className="text-foreground-muted">{placeholder}</span>
        )}
      </span>
    );
  }

  // On Desktop: Use Radix's primitive.
  // IMPORTANT: We do NOT pass 'children' here.
  // Radix will automatically display the text of the active SelectItem.
  return (
    <SelectPrimitive.Value ref={ref} placeholder={placeholder} {...props} />
  );
});
SelectValue.displayName = "SelectValue";

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectPrimitive as SelectGroup,
};
