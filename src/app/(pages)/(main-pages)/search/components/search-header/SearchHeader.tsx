"use client";

import {
  MagnifyingGlassIcon,
  FadersIcon,
} from "@phosphor-icons/react";

interface SearchHeaderProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function SearchHeader({
  value,
  onChange,
  onSubmit,
}: SearchHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 flex justify-center bg-background">
      <div className="flex w-full max-w-[600px] items-center gap-3 px-safe-area pb-3 pt-4">
        <form
          className="flex flex-1 items-center gap-3 rounded-full bg-background-secondary px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <MagnifyingGlassIcon
            size={20}
            className="text-foreground-muted shrink-0"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="جستجوی سالن‌ها، خدمات یا متخصصان..."
            className="flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-input-placeholder"
          />
        </form>
        <button
          type="button"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background-secondary text-foreground"
          aria-label="فیلترها"
        >
          <FadersIcon size={20} />
        </button>
      </div>
    </div>
  );
}
