const UNDO_NO_SHOW = "UndoNoShow:";
const UNDO_NO_SHOW_LEGACY = "UndoNoShowLegacy:";

/**
 * Status-history reasons written by the server are machine tokens (`Created`, `Undo`, `Rescheduled`,
 * `UndoNoShow: …`) or free text typed by a person (a cancel reason). Show the tokens in Persian;
 * `null` means «nothing worth adding after the status word».
 */
export function historyReasonLabel(reason: string | null | undefined): string | null {
  const text = reason?.trim();
  if (!text) return null;
  if (text === "Created") return null;
  if (text === "Undo") return "بازگردانی";
  if (text === "Rescheduled") return "جابه‌جا شد";
  if (text.startsWith(UNDO_NO_SHOW_LEGACY)) {
    const note = text.slice(UNDO_NO_SHOW_LEGACY.length).trim();
    return note
      ? `اصلاح «مراجعه نکرد» توسط پشتیبانی (نوبت قدیمی): ${note}`
      : "اصلاح «مراجعه نکرد» توسط پشتیبانی";
  }
  if (text.startsWith(UNDO_NO_SHOW)) {
    const note = text.slice(UNDO_NO_SHOW.length).trim();
    return note ? `اصلاح «مراجعه نکرد»: ${note}` : "اصلاح «مراجعه نکرد»";
  }
  return text;
}
