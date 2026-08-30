import { useRouter } from "next/navigation";
import { IBranchService } from "@/services/domains/salons/types/booking-browse.type";
import { useCreateBooking } from "@/services/domains/booking/hooks/useCreateBooking";
import {
  getApiErrorMessage,
  toBookingStartTime,
} from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useMutateSwitchContext } from "@/services/domains/auth/hooks/useMutateSwitchContext";
import { getLoginHref } from "@/shared/utils/authRedirect";
import { clearBookDraft } from "../utils/bookDraft";

interface UseBookConfirmParams {
  salonPublicId: string | undefined;
  branchPublicId: string | null;
  date: string | null;
  slotTime: string | null;
  resolvedStaffPublicId: string | null;
  offeringPublicIds: string[];
  selectedServices: IBranchService[];
  notes: string;
  persistDraftNow: () => void;
  setError: (v: string) => void;
  setCreatedId: (v: string | null) => void;
  setStep: (updater: number | ((s: number) => number)) => void;
}

/** Final-step submit flow: login redirect, validation, customer-context switch, and create. */
export function useBookConfirm(params: UseBookConfirmParams) {
  const {
    salonPublicId,
    branchPublicId,
    date,
    slotTime,
    resolvedStaffPublicId,
    offeringPublicIds,
    selectedServices,
    notes,
    persistDraftNow,
    setError,
    setCreatedId,
    setStep,
  } = params;

  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const activeSalonContextId = useSalonContextStore((s) => s.salonId);
  const { mutateAsync: switchContext } = useMutateSwitchContext();
  const { mutateAsync: createBooking, isPending: isCreating } =
    useCreateBooking();

  const ensureCustomerContext = async () => {
    if (activeSalonContextId != null) {
      await switchContext({ salonId: null, branchId: null });
    }
  };

  const handleConfirm = async () => {
    setError("");

    if (!isLoggedIn) {
      persistDraftNow();
      router.push(getLoginHref(RouteAddress.SALONS.BOOK(salonPublicId!)));
      return;
    }

    if (
      !salonPublicId ||
      !branchPublicId ||
      !date ||
      !slotTime ||
      !resolvedStaffPublicId
    ) {
      setError("اطلاعات رزرو ناقص است.");
      return;
    }

    if (
      offeringPublicIds.length === 0 ||
      offeringPublicIds.length !== selectedServices.length
    ) {
      setError("شناسه offering برای برخی خدمات یافت نشد.");
      return;
    }

    try {
      await ensureCustomerContext();
      const res = await createBooking({
        salonPublicId,
        branchPublicId,
        startTime: toBookingStartTime(date, slotTime),
        notes: notes.trim() || null,
        services: offeringPublicIds.map((offeringPublicId) => ({
          offeringPublicId,
          staffPublicId: resolvedStaffPublicId,
        })),
      });
      clearBookDraft(salonPublicId);
      setCreatedId(res.data);
      setStep(7);
    } catch (e) {
      setError(
        getApiErrorMessage(
          e,
          "ثبت نوبت ناموفق بود. موجودی کیف‌پول یا آزاد بودن اسلات را بررسی کنید.",
          { audience: "customer" }
        )
      );
    }
  };

  return { handleConfirm, isCreating, isLoggedIn };
}
