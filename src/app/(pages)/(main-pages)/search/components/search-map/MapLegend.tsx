"use client";

import { useEffect, useRef } from "react";
import { createPinElement } from "@/shared/map/markerElements";
import { GENDER_AUDIENCE_LEGEND } from "@/shared/utils/genderAudience";

const AUDIENCE_VALUE = { female: 2, male: 1, mixed: 3, unknown: 0 } as const;

/** The same marker element the map draws (shape + glyph + colour), so the key can never drift from the pins. */
function Swatch({ audience }: { audience: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const el = createPinElement(audience, "", false);
    el.setAttribute("aria-hidden", "true");
    el.tabIndex = -1;
    el.style.cursor = "default";
    el.style.transform = `${el.style.transform} scale(0.62)`;
    host.replaceChildren(el);
  }, [audience]);
  return <span ref={ref} className="inline-flex h-5 w-5 items-center justify-center" aria-hidden />;
}

export default function MapLegend() {
  return (
    <ul
      aria-label="راهنمای نشانگرها"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[12px] bg-surface/90 px-3 py-1.5 text-[11px] text-foreground-muted backdrop-blur-sm"
    >
      {GENDER_AUDIENCE_LEGEND.map((meta) => (
        <li key={meta.key} className="flex items-center gap-1">
          <Swatch audience={AUDIENCE_VALUE[meta.key]} />
          {meta.key === "unknown" ? "نامشخص" : meta.label}
        </li>
      ))}
    </ul>
  );
}
