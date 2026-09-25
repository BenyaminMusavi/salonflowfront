const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Iranian mobile numbers (09xxxxxxxxx) are 11 digits. */
export const MOBILE_MAX_DIGITS = 11;

/**
 * Normalizes typed/pasted phone text: Persian/Arabic digits → Latin (the backend validates
 * `^09\d{9}$` with Latin digits only), everything that isn't a digit dropped, length capped.
 */
export function normalizePhoneInput(text: string, maxDigits = MOBILE_MAX_DIGITS): string {
  let out = "";
  for (const ch of text) {
    const fa = PERSIAN_DIGITS.indexOf(ch);
    const ar = ARABIC_DIGITS.indexOf(ch);
    if (fa >= 0) out += fa;
    else if (ar >= 0) out += ar;
    else if (ch >= "0" && ch <= "9") out += ch;
    if (out.length >= maxDigits) break;
  }
  return out;
}

/**
 * Attributes every phone field shares: phone keypad on mobile, LTR digits inside the RTL UI
 * (placeholder stays right-aligned while empty).
 */
export const PHONE_INPUT_ATTRS = {
  type: "tel",
  inputMode: "tel",
  dir: "ltr",
  className: "text-left placeholder:text-right",
} as const;
