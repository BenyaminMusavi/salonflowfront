import { useEffect, useRef } from "react";
import {
  IBranchService,
  IStaffAvailability,
} from "@/services/domains/salons/types/booking-browse.type";
import { IBookWizardDraft, loadBookDraft, saveBookDraft } from "../utils/bookDraft";

type TDraftFields = Omit<IBookWizardDraft, "version">;

interface UseBookDraftPersistenceParams {
  salonPublicId: string | undefined;
  createdId: string | null;
  step: number;
  branchPublicId: string | null;
  branchName: string;
  selectedServices: IBranchService[];
  date: string | null;
  staff: IStaffAvailability | null;
  useFirstAvailable: boolean;
  firstAvailableResolved: boolean;
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
  setFirstAvailableResolved: (v: boolean) => void;
  setResolvedStaffPublicId: (v: string | null) => void;
  setResolvedStaffName: (v: string | null) => void;
  setSlotTime: (v: string | null) => void;
  setSlotEndTime: (v: string | null) => void;
  setNotes: (v: string) => void;
}

/** Rehydrates and persists the book wizard's sessionStorage draft (see utils/bookDraft.ts). */
export function useBookDraftPersistence(params: UseBookDraftPersistenceParams) {
  const { salonPublicId, createdId } = params;
  const draftReadyRef = useRef(false);

  const fields: TDraftFields = {
    step: params.step,
    branchPublicId: params.branchPublicId,
    branchName: params.branchName,
    selectedServices: params.selectedServices,
    date: params.date,
    staff: params.staff,
    useFirstAvailable: params.useFirstAvailable,
    firstAvailableResolved: params.firstAvailableResolved,
    resolvedStaffPublicId: params.resolvedStaffPublicId,
    resolvedStaffName: params.resolvedStaffName,
    slotTime: params.slotTime,
    slotEndTime: params.slotEndTime,
    notes: params.notes,
  };

  // Rehydrate draft once per salon
  useEffect(() => {
    if (!salonPublicId || draftReadyRef.current) return;
    const draft = loadBookDraft(salonPublicId);
    draftReadyRef.current = true;
    if (!draft) return;

    params.setStep(draft.step);
    params.setBranchPublicId(draft.branchPublicId);
    params.setBranchName(draft.branchName);
    params.setSelectedServices(draft.selectedServices ?? []);
    params.setDate(draft.date);
    params.setStaff(draft.staff);
    params.setUseFirstAvailable(Boolean(draft.useFirstAvailable));
    params.setFirstAvailableResolved(Boolean(draft.firstAvailableResolved));
    params.setResolvedStaffPublicId(
      typeof draft.resolvedStaffPublicId === "string" ? draft.resolvedStaffPublicId : null
    );
    params.setResolvedStaffName(draft.resolvedStaffName ?? null);
    params.setSlotTime(draft.slotTime);
    params.setSlotEndTime(draft.slotEndTime);
    params.setNotes(draft.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonPublicId]);

  // Persist draft
  const serialized = JSON.stringify(fields);
  useEffect(() => {
    if (!salonPublicId || !draftReadyRef.current || createdId != null) return;
    saveBookDraft(salonPublicId, JSON.parse(serialized) as TDraftFields);
  }, [salonPublicId, serialized, createdId]);

  const persistDraftNow = () => {
    if (!salonPublicId) return;
    saveBookDraft(salonPublicId, fields);
  };

  return { draftReadyRef, persistDraftNow };
}
