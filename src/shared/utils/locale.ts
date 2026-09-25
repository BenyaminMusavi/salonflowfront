/**
 * Locale for every Intl / toLocale* call in the app: Persian text and the Jalali calendar
 * (month/weekday names, relative time, "ساعت" etc.) but Latin digits — the product shows
 * English digits everywhere (e.g. `700,000`, `1405/07/03`). Never pass bare "fa-IR".
 */
export const APP_LOCALE = "fa-IR-u-nu-latn";
