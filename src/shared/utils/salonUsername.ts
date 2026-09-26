/**
 * Salon public-link username rules (backend: 3–30 chars, `^[a-z0-9]+(-[a-z0-9]+)*$`, not
 * digits-only). The server stays authoritative — this only gives the owner a precise hint
 * instead of a bare «فرمت آدرس نامعتبر است».
 */
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

/** While typing: lowercase, and turn the usual separators people try (_ and spaces) into "-". */
export function normalizeUsernameInput(raw: string): string {
  return raw.toLowerCase().replace(/[\s_]+/g, "-");
}

/**
 * First format problem in `value`, or null. `final` = the user has paused typing: only then
 * report things that are normal mid-typing (too short, trailing "-", digits so far).
 */
export function usernameFormatProblem(value: string, final: boolean): string | null {
  if (!value) return null;
  if (/[؀-ۿ]/.test(value)) {
    return "حروف فارسی مجاز نیست؛ از حروف انگلیسی استفاده کنید.";
  }
  const bad = value.match(/[^a-z0-9-]/);
  if (bad) {
    return `کاراکتر «${bad[0]}» مجاز نیست؛ فقط حروف انگلیسی، عدد و خط تیره (-).`;
  }
  if (value.startsWith("-")) return "آدرس نمی‌تواند با خط تیره شروع شود.";
  if (value.includes("--")) return "دو خط تیره پشت‌سرهم مجاز نیست.";
  if (value.length > USERNAME_MAX) return `حداکثر ${USERNAME_MAX} کاراکتر.`;
  if (!final) return null;
  if (value.endsWith("-")) return "آدرس نمی‌تواند با خط تیره تمام شود.";
  if (value.length < USERNAME_MIN) return `حداقل ${USERNAME_MIN} کاراکتر.`;
  if (/^\d+$/.test(value)) return "آدرس نمی‌تواند فقط عدد باشد؛ حداقل یک حرف انگلیسی بگذارید.";
  return null;
}
