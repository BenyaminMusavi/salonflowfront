import {
  IBranchService,
  IStaffAvailability,
} from "@/services/domains/salons/types/booking-browse.type";

// v3: 5-step flow (services → staff → date+time → invoice → confirm). Older drafts used the
// 7-step order, so their step numbers would land on the wrong screen — they're discarded.
const DRAFT_VERSION = 3;
const LAST_STEP = 5;

export interface IBookWizardDraft {
  version: number;
  step: number;
  branchPublicId: string | null;
  branchName: string;
  selectedServices: IBranchService[];
  date: string | null;
  staff: IStaffAvailability | null;
  /** «اولین نوبت» chosen: staff comes from the first-available lookup (or from the picked slot). */
  useFirstAvailable?: boolean;
  /** First-available lookup succeeded and prefilled date/time/staff. */
  firstAvailableResolved?: boolean;
  /** StaffMember.PublicId for create payload */
  resolvedStaffPublicId?: string | null;
  resolvedStaffName?: string | null;
  slotTime: string | null;
  slotEndTime: string | null;
  notes: string;
}

function storageKey(salonPublicId: string) {
  return `salonflow:book-draft:v${DRAFT_VERSION}:${salonPublicId}`;
}

export function loadBookDraft(
  salonPublicId: string | undefined
): IBookWizardDraft | null {
  if (!salonPublicId || typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(salonPublicId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IBookWizardDraft;
    if (parsed?.version !== DRAFT_VERSION) return null;
    if (typeof parsed.step !== "number" || parsed.step < 1 || parsed.step > LAST_STEP) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveBookDraft(
  salonPublicId: string | undefined,
  draft: Omit<IBookWizardDraft, "version">
): void {
  if (!salonPublicId || typeof window === "undefined") return;
  try {
    const payload: IBookWizardDraft = { version: DRAFT_VERSION, ...draft };
    sessionStorage.setItem(storageKey(salonPublicId), JSON.stringify(payload));
  } catch {
    // Quota / private mode — ignore
  }
}

export function clearBookDraft(salonPublicId: string | undefined): void {
  if (!salonPublicId || typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(storageKey(salonPublicId));
  } catch {
    // ignore
  }
}
