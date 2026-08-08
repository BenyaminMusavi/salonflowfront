import {
  IBranchService,
  IStaffAvailability,
} from "@/services/domains/salons/types/booking-browse.type";

const DRAFT_VERSION = 1;

export interface IBookWizardDraft {
  version: number;
  step: number;
  branchId: number | null;
  branchName: string;
  selectedServices: IBranchService[];
  date: string | null;
  staff: IStaffAvailability | null;
  /** When true, staff is intentionally null (first available). */
  useFirstAvailable?: boolean;
  /** Numeric staff id resolved from slots / profiles (legacy; prefer resolvedStaffPublicId) */
  resolvedStaffId?: number | null;
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
    if (typeof parsed.step !== "number" || parsed.step < 1 || parsed.step > 7) {
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
