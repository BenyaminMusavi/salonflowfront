"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/className";

interface SalonsDetailDescriptionProps {
  description?: string | null;
}

export default function SalonsDetailDescription({
  description,
}: SalonsDetailDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!description?.trim()) return null;

  return (
    <div className="mt-4 px-safe-area">
      <p
        className={cn(
          "text-sm leading-6 text-foreground-muted",
          !expanded && "line-clamp-3"
        )}
      >
        {description}
      </p>
      {description.length > 90 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-sm font-medium text-primary"
        >
          {expanded ? "کمتر" : "بیشتر"}
        </button>
      ) : null}
    </div>
  );
}
