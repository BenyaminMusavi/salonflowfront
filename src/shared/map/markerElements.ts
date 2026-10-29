import { getGenderAudience, type TGenderAudienceKey } from "@/shared/utils/genderAudience";

/**
 * DOM elements for MapLibre markers. Each audience differs in colour AND shape AND glyph, so colour
 * is never the only cue: women = pink circle ♀, men = blue rounded square ♂, mixed = purple diamond ⚥,
 * unknown = neutral ring ?. Selected pins grow, get a white outline and rise above the others.
 * Colours are the design-system tokens (CSS variables), not hardcoded hex.
 */
const COLOR: Record<TGenderAudienceKey, string> = {
  female: "var(--color-accent-pink)",
  male: "var(--color-info)",
  mixed: "var(--color-accent-purple)",
  unknown: "var(--color-neutral)",
};

const GLYPH: Record<TGenderAudienceKey, string> = {
  female: "♀",
  male: "♂",
  mixed: "⚥",
  unknown: "?",
};

const SIZE = 32;

export function applyPinStyle(el: HTMLElement, audience: number | null | undefined, selected: boolean): void {
  const meta = getGenderAudience(audience);
  const color = COLOR[meta.key];
  const scale = selected ? 1.25 : 1;
  const base = [
    `width:${SIZE}px`,
    `height:${SIZE}px`,
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "cursor:pointer",
    "padding:0",
    "font:700 16px/1 system-ui,sans-serif",
    "box-shadow:0 2px 6px rgba(0,0,0,.45)",
    `border:${selected ? 3 : 2}px solid ${meta.key === "unknown" ? color : "#fff"}`,
    `z-index:${selected ? 10 : 1}`,
    `outline:${selected ? "3px solid var(--color-primary)" : "none"}`,
    "outline-offset:2px",
  ];

  if (meta.markerShape === "circle") {
    base.push(`background:${color}`, "color:#fff", "border-radius:50%", `transform:scale(${scale})`);
  } else if (meta.markerShape === "square") {
    base.push(`background:${color}`, "color:#fff", "border-radius:8px", `transform:scale(${scale})`);
  } else if (meta.markerShape === "diamond") {
    base.push(`background:${color}`, "color:#fff", "border-radius:6px", `transform:rotate(45deg) scale(${scale})`);
  } else {
    base.push("background:var(--color-surface)", `color:${color}`, "border-radius:50%", "border-style:dashed", `transform:scale(${scale})`);
  }
  el.style.cssText = base.join(";");

  const glyph = el.firstElementChild as HTMLElement | null;
  if (glyph) {
    glyph.textContent = GLYPH[meta.key];
    // The diamond is rotated 45°; counter-rotate the glyph so it stays upright.
    glyph.style.cssText = meta.markerShape === "diamond" ? "transform:rotate(-45deg);display:block" : "display:block";
  }
}

export function createPinElement(
  audience: number | null | undefined,
  label: string,
  selected: boolean
): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("aria-label", `${label} — ${getGenderAudience(audience).label}`);
  el.appendChild(document.createElement("span"));
  applyPinStyle(el, audience, selected);
  return el;
}

export function createClusterElement(count: number): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("aria-label", `${count} شعبه؛ برای بزرگ‌نمایی لمس کنید`);
  const size = count >= 100 ? 52 : count >= 10 ? 44 : 38;
  el.style.cssText = [
    `width:${size}px`,
    `height:${size}px`,
    "border-radius:50%",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "cursor:pointer",
    "padding:0",
    "background:var(--color-primary)",
    "color:var(--color-primary-foreground)",
    "border:3px solid #fff",
    "box-shadow:0 2px 8px rgba(0,0,0,.5)",
    "font:700 14px/1 system-ui,sans-serif",
  ].join(";");
  el.textContent = String(count);
  return el;
}

/** The user's own reference point (blue dot with a white ring). Not interactive. */
export function createUserDotElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.setAttribute("aria-label", "موقعیت شما");
  el.style.cssText =
    "width:16px;height:16px;border-radius:50%;background:var(--color-info);border:3px solid #fff;box-shadow:0 0 0 6px rgba(0,119,217,.25)";
  return el;
}
