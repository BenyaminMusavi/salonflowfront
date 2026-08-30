import { MutableRefObject, useEffect, useRef } from "react";
import {
  IBranchService,
  IStaffAvailability,
} from "@/services/domains/salons/types/booking-browse.type";
import { loadBookDraft, saveBookDraft } from "../utils/bookDraft";

interface UseBookDraftPersistenceParams {
  salonPublicId: string | undefined;
  createdId: string | null;
  /** Shared with useBookWizardNavigation's auto-skip-single-branch effect. */
  skipBranchHandledRef: MutableRefObject<boolean>;
  step: number;
  branchPublicId: string | null;
  branchName: string;
  selectedServices: IBranchService[];
  date: string | null;
  staff: IStaffAvailability | null;
  useFirstAvailable: boolean;
  resolvedStaffPublicId: string | null;
  resolvedStaffName: string | null;
  slotTime: string | null;
  slotEndTime: string | null;
  notes: string;
  setStep: (step: number) => void;
  setBranchPublicId: (v: string | null) => void;
  setBranchName: (v: string) => void;
  setSelectedServices: (v: IBranchService[]) => void;
  setDate: (v: string | null) => void;
  setStaff: (v: IStaffAvailability | null) => void;
  setUseFirstAvailable: (v: boolean) => void;
  setResolvedStaffPublicId: (v: string | null) => void;
  setResolvedStaffName: (v: string | null) => void;
  setSlotTime: (v: string | null) => void;
  setSlotEndTime: (v: string | null) => void;
  setNotes: (v: string) => void;
}

/** Rehydrates and persists the book wizard's sessionStorage draft (see utils/bookDraft.ts). */
export function useBookDraftPersistence(params: UseBookDraftPersistenceParams) {
  const {
    salonPublicId,
    createdId,
    skipBranchHandledRef,
    step,
    branchPublicId,
    branchName,
    selectedServices,
    date,
    staff,
    useFirstAvailable,
    resolvedStaffPublicId,
    resolvedStaffName,
    slotTime,
    slotEndTime,
    notes,
    setStep,
    setBranchPublicId,
    setBranchName,
    setSelectedServices,
    setDate,
    setStaff,
    setUseFirstAvailable,
    setResolvedStaffPublicId,
    setResolvedStaffName,
    setSlotTime,
    setSlotEndTime,
    setNotes,
  } = params;

  const draftReadyRef = useRef(false);

  // Rehydrate draft once per salon
  useEffect(() => {
    if (!salonPublicId || draftReadyRef.current) return;
    const draft = loadBookDraft(salonPublicId);
    draftReadyRef.current = true;
    if (!draft) return;

    setStep(draft.step);
    setBranchPublicId(draft.branchPublicId);
    setBranchName(draft.branchName);
    setSelectedServices(draft.selectedServices ?? []);
    setDate(draft.date);
    setStaff(draft.staff);
    setUseFirstAvailable(Boolean(draft.useFirstAvailable));
    setResolvedStaffPublicId(
      typeof draft.resolvedStaffPublicId === "string"
        ? draft.resolvedStaffPublicId
        : null
    );
    setResolvedStaffName(draft.resolvedStaffName ?? null);
    setSlotTime(draft.slotTime);
    setSlotEndTime(draft.slotEndTime);
    setNotes(draft.notes ?? "");
    if (draft.branchPublicId != null || draft.step > 1) {
      skipBranchHandledRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonPublicId]);

  // Persist draft
  useEffect(() => {
    if (!salonPublicId || !draftReadyRef.current || createdId != null) return;
    saveBookDraft(salonPublicId, {
      step,
      branchPublicId,
      branchName,
      selectedServices,
      date,
      staff,
      useFirstAvailable,
      resolvedStaffPublicId,
      resolvedStaffName,
      slotTime,
      slotEndTime,
      notes,
    });
  }, [
    salonPublicId,
    step,
    branchPublicId,
    branchName,
    selectedServices,
    date,
    staff,
    useFirstAvailable,
    resolvedStaffPublicId,
    resolvedStaffName,
    slotTime,
    slotEndTime,
    notes,
    createdId,
  ]);

  const persistDraftNow = () => {
    if (!salonPublicId) return;
    saveBookDraft(salonPublicId, {
      step,
      branchPublicId,
      branchName,
      selectedServices,
      date,
      staff,
      useFirstAvailable,
      resolvedStaffPublicId,
      resolvedStaffName,
      slotTime,
      slotEndTime,
      notes,
    });
  };

  return { draftReadyRef, persistDraftNow };
}
