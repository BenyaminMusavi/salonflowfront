"use client";

import Link from "next/link";
import { CaretLeftIcon, ArrowUpLeftIcon, type Icon } from "@phosphor-icons/react";

/** Settings-style grouped list: a small muted title and borderless rows on one surface. */
export function PanelListGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      {title ? (
        <h2 className="px-1 text-xs font-semibold text-foreground-muted">{title}</h2>
      ) : null}
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
        {children}
      </div>
    </section>
  );
}

/** One tappable row: icon, label, optional hint on the left edge, chevron (or ↗ for external). */
export function PanelListRow({
  href,
  icon: RowIcon,
  label,
  hint,
  external = false,
}: {
  href: string;
  icon: Icon;
  label: string;
  hint?: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-brand text-content-brand">
        <RowIcon size={19} weight="duotone" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
        {label}
      </span>
      {hint ? <span className="shrink-0 text-xs text-foreground-muted">{hint}</span> : null}
      {external ? (
        <ArrowUpLeftIcon size={16} className="shrink-0 text-foreground-muted" />
      ) : (
        <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" />
      )}
    </Link>
  );
}
