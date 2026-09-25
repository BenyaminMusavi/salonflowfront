"use client";

import * as React from "react";
import { Input, type InputProps } from "./Input";
import { formatToman } from "@/shared/utils/salonDisplay";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
/** 15 digits stays inside Number.MAX_SAFE_INTEGER. */
const MAX_DIGITS = 15;

/** Keeps only the digits (Persian/Arabic/Latin → Latin), dropping separators and anything else. */
function toLatinDigits(text: string): string {
  let out = "";
  for (const ch of text) {
    const fa = PERSIAN_DIGITS.indexOf(ch);
    const ar = ARABIC_DIGITS.indexOf(ch);
    if (fa >= 0) out += fa;
    else if (ar >= 0) out += ar;
    else if (ch >= "0" && ch <= "9") out += ch;
  }
  return out;
}

function toNumberOrNull(value: number | string | null | undefined): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? Math.round(value) : null;
  // Plain numeric strings (e.g. "700000" or "700000.00" from String(apiValue)) parse as-is;
  // only fall back to digit-extraction for Persian digits / separators.
  const direct = Number(value);
  const n = Number.isFinite(direct) ? direct : Number(toLatinDigits(value));
  return Number.isFinite(n) ? Math.round(n) : null;
}

export interface MoneyInputProps
  extends Omit<InputProps, "value" | "onChange" | "type" | "inputMode" | "endIcon"> {
  /** Amount in Toman. Strings are accepted so callers keeping form state as text can pass it through. */
  value: number | string | null | undefined;
  /** Plain Toman number (no separators), or null when the field is emptied. */
  onValueChange: (value: number | null) => void;
}

/**
 * Toman amount field: shows thousands separators while typing (same formatToman format as every price
 * display), a fixed «تومان» suffix, and the numeric keypad on phones. The value it reports is a
 * plain number in Toman — exactly what the API expects.
 */
const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onValueChange, ...props }, forwardedRef) => {
    const innerRef = React.useRef<HTMLInputElement | null>(null);
    /** Digits that should sit before the caret after the next re-render. */
    const pendingCaretDigits = React.useRef<number | null>(null);
    // Forces a render (and the caret fix below) even when the amount itself didn't change,
    // e.g. a non-digit was typed or a separator was deleted.
    const [, rerender] = React.useReducer((n: number) => n + 1, 0);

    const numeric = toNumberOrNull(value);
    const display = numeric == null ? "" : formatToman(numeric);

    // Reformatting inserts/removes separators, which would throw the caret to the end;
    // put it back after the same number of digits the user had before it.
    React.useLayoutEffect(() => {
      const el = innerRef.current;
      const digits = pendingCaretDigits.current;
      if (!el || digits == null || document.activeElement !== el) return;
      pendingCaretDigits.current = null;
      let pos = 0;
      let seen = 0;
      while (pos < display.length && seen < digits) {
        if (toLatinDigits(display[pos]) !== "") seen++;
        pos++;
      }
      el.setSelectionRange(pos, pos);
    });

    return (
      <Input
        {...props}
        ref={(el) => {
          innerRef.current = el;
          if (typeof forwardedRef === "function") forwardedRef(el);
          else if (forwardedRef) forwardedRef.current = el;
        }}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        onChange={(e) => {
          const raw = e.target.value;
          const caret = e.target.selectionStart ?? raw.length;
          let digits = toLatinDigits(raw);
          let caretDigits = toLatinDigits(raw.slice(0, caret)).length;

          // Only a separator was deleted: delete the digit next to it instead, like a
          // plain number field would (Backspace → digit before, Delete → digit after).
          const previousDigits = numeric == null ? "" : String(numeric);
          const inputType = (e.nativeEvent as InputEvent).inputType ?? "";
          if (digits === previousDigits && raw.length < display.length) {
            if (inputType === "deleteContentBackward" && caretDigits > 0) {
              digits = digits.slice(0, caretDigits - 1) + digits.slice(caretDigits);
              caretDigits -= 1;
            } else if (inputType === "deleteContentForward") {
              digits = digits.slice(0, caretDigits) + digits.slice(caretDigits + 1);
            }
          }

          const leadingZeros = digits.length - digits.replace(/^0+(?=\d)/, "").length;
          digits = digits.slice(leadingZeros, leadingZeros + MAX_DIGITS);
          pendingCaretDigits.current = Math.max(0, caretDigits - leadingZeros);
          onValueChange(digits === "" ? null : Number(digits));
          rerender();
        }}
        endIcon={<span className="text-xs text-foreground-muted">تومان</span>}
      />
    );
  }
);

MoneyInput.displayName = "MoneyInput";

export { MoneyInput };
