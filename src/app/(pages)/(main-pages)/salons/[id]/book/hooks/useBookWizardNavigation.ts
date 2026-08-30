import { MutableRefObject, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IBranchService,
  ISalonBranch,
  IStaffAvailability,
} from "@/services/domains/salons/types/booking-browse.type";
import { RouteAddress } from "@/shared/data/routeAddress";

interface UseBookWizardNavigationParams {
  salonPublicId: string | undefined;
  branches: ISalonBranch[];
  step: number;
  branchPublicId: string | null;
  selectedServices: IBranchService[];
  date: string | null;
  staff: IStaffAvailability | null;
  useFirstAvailable: boolean;
  price: unknown;
  slotTime: string | null;
  resolvedStaffPublicId: string | null;
  draftReadyRef: MutableRefObject<boolean>;
  /** Shared with useBookDraftPersistence's rehydrate effect. */
  skipBranchHandledRef: MutableRefObject<boolean>;
  setStep: (updater: number | ((s: number) => number)) => void;
  setBranchPublicId: (v: string | null) => void;
  setBranchName: (v: string) => void;
  setError: (v: string) => void;
}

/** Step-guard logic (canGoNext/goNext/goBack) plus the auto-skip-single-branch effect. */
export function useBookWizardNavigation(params: UseBookWizardNavigationParams) {
  const {
    salonPublicId,
    branches,
    step,
    branchPublicId,
    selectedServices,
    date,
    staff,
    useFirstAvailable,
    price,
    slotTime,
    resolvedStaffPublicId,
    draftReadyRef,
    skipBranchHandledRef,
    setStep,
    setBranchPublicId,
    setBranchName,
    setError,
  } = params;

  const router = useRouter();

  // Auto-select + auto-skip single branch
  useEffect(() => {
    if (!draftReadyRef.current || skipBranchHandledRef.current) return;
    if (branches.length !== 1) {
      if (branches.length > 1) skipBranchHandledRef.current = true;
      return;
    }

    const only = branches[0];
    skipBranchHandledRef.current = true;
    setBranchPublicId(only.publicId);
    setBranchName(only.name);
    setStep((s) => (s === 1 ? 2 : s));
  }, [branches]);

  const canGoNext = (): boolean => {
    switch (step) {
      case 1:
        return !!branchPublicId;
      case 2:
        return (
          selectedServices.length > 0 &&
          selectedServices.every(
            (s) => !!s.offeringPublicId && !!s.servicePublicId
          )
        );
      case 3:
        return !!date;
      case 4:
        return useFirstAvailable || !!staff;
      case 5:
        return !!price;
      case 6:
        return !!slotTime && !!resolvedStaffPublicId;
      default:
        return true;
    }
  };

  const goNext = () => {
    setError("");
    if (step === 2) {
      const missingType = selectedServices.some((s) => !s.servicePublicId);
      const missingOffering = selectedServices.some((s) => !s.offeringPublicId);
      if (missingType) {
        setError(
          "شناسه نوع سرویس برای تاریخ‌ها در دسترس نیست. لطفاً بعداً دوباره تلاش کنید."
        );
        return;
      }
      if (missingOffering) {
        setError(
          "شناسه offering برای ثبت نهایی پیدا نشد. ممکن است کاتالوگ سالن ناقص باشد."
        );
        return;
      }
    }
    if (step === 6 && !resolvedStaffPublicId) {
      setError(
        "پرسنل این ساعت مشخص نشد. پرسنل دیگری انتخاب کنید یا دوباره تلاش کنید."
      );
      return;
    }
    if (!canGoNext()) {
      setError("لطفاً این مرحله را تکمیل کنید.");
      return;
    }
    setStep((s) => Math.min(7, s + 1));
  };

  const goBack = () => {
    setError("");
    if (step === 1) {
      router.push(RouteAddress.SALONS.DETAILS(salonPublicId!));
      return;
    }
    if (step === 2 && branches.length === 1) {
      router.push(RouteAddress.SALONS.DETAILS(salonPublicId!));
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  return { canGoNext, goNext, goBack };
}
