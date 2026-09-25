import { MutableRefObject, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IBranchService,
  ISalonBranch,
  IStaffAvailability,
} from "@/services/domains/salons/types/booking-browse.type";
import { RouteAddress } from "@/shared/data/routeAddress";
import { BOOK_TOTAL_STEPS } from "../components/BookProgressHeader";

/**
 * Booking wizard steps:
 * 1 services (+ branch picker when the salon has several) · 2 staff or «اولین نوبت» ·
 * 3 date + free times · 4 invoice (pre-factor) · 5 confirm & book.
 */
interface UseBookWizardNavigationParams {
  salonPublicId: string | undefined;
  branches: ISalonBranch[];
  step: number;
  branchPublicId: string | null;
  selectedServices: IBranchService[];
  staff: IStaffAvailability | null;
  useFirstAvailable: boolean;
  /** True while the «اولین نوبت» lookup is in flight — can't leave the staff step yet. */
  firstAvailableLoading: boolean;
  /** «اولین نوبت» found no free slot (404) — a staff member must be picked instead. */
  firstAvailableNone: boolean;
  price: unknown;
  date: string | null;
  slotTime: string | null;
  resolvedStaffPublicId: string | null;
  draftReadyRef: MutableRefObject<boolean>;
  setStep: (updater: number | ((s: number) => number)) => void;
  setBranchPublicId: (v: string | null) => void;
  setBranchName: (v: string) => void;
  setError: (v: string) => void;
}

/** Step-guard logic (canGoNext/goNext/goBack) plus auto-selecting a salon's only branch. */
export function useBookWizardNavigation(params: UseBookWizardNavigationParams) {
  const {
    salonPublicId,
    branches,
    step,
    branchPublicId,
    selectedServices,
    staff,
    useFirstAvailable,
    firstAvailableLoading,
    firstAvailableNone,
    price,
    date,
    slotTime,
    resolvedStaffPublicId,
    draftReadyRef,
    setStep,
    setBranchPublicId,
    setBranchName,
    setError,
  } = params;

  const router = useRouter();

  // A single-branch salon never shows the branch picker.
  useEffect(() => {
    if (!draftReadyRef.current || branchPublicId || branches.length !== 1) return;
    setBranchPublicId(branches[0].publicId);
    setBranchName(branches[0].name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches, branchPublicId]);

  const canGoNext = (): boolean => {
    switch (step) {
      case 1:
        return (
          !!branchPublicId &&
          selectedServices.length > 0 &&
          selectedServices.every((s) => !!s.offeringPublicId && !!s.servicePublicId)
        );
      case 2:
        return (useFirstAvailable && !firstAvailableLoading && !firstAvailableNone) || !!staff;
      case 3:
        return !!date && !!slotTime && !!resolvedStaffPublicId;
      case 4:
        return !!price;
      default:
        return true;
    }
  };

  const goNext = () => {
    setError("");
    if (step === 2 && firstAvailableNone) {
      setError("نوبت آزادی پیدا نشد؛ لطفاً یکی از پرسنل را انتخاب کنید.");
      return;
    }
    if (step === 1 && !branchPublicId) {
      setError("ابتدا شعبه را انتخاب کنید.");
      return;
    }
    if (step === 3 && slotTime && !resolvedStaffPublicId) {
      setError("پرسنل این ساعت مشخص نشد. پرسنل دیگری انتخاب کنید یا دوباره تلاش کنید.");
      return;
    }
    if (!canGoNext()) {
      setError(
        step === 3 ? "تاریخ و ساعت نوبت را انتخاب کنید." : "لطفاً این مرحله را تکمیل کنید."
      );
      return;
    }
    setStep((s) => Math.min(BOOK_TOTAL_STEPS, s + 1));
  };

  const goBack = () => {
    setError("");
    if (step === 1) {
      router.push(RouteAddress.SALONS.DETAILS(salonPublicId!));
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  return { canGoNext, goNext, goBack };
}
