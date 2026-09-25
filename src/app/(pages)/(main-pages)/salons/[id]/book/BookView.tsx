"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import TopNavigation from "@/shared/components/composites/layout/top-navigation/TopNavigation";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useQueryBranchServices } from "@/services/domains/salons/hooks/useQueryBranchServices";
import { useQueryAvailableDates } from "@/services/domains/salons/hooks/useQueryAvailableDates";
import { useQueryCalculatePrice } from "@/services/domains/salons/hooks/useQueryCalculatePrice";
import { useQuerySalonAvailableSlots } from "@/services/domains/salons/hooks/useQuerySalonAvailableSlots";
import {
  FIRST_AVAILABLE_QUERY_KEY,
  useQueryFirstAvailable,
} from "@/services/domains/salons/hooks/useQueryFirstAvailable";
import { useQueryClient } from "@tanstack/react-query";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import {
  IBranchService,
  IFirstAvailableSlot,
  ISalonBranch,
  ISalonBrowseSlot,
  IStaffAvailability,
} from "@/services/domains/salons/types/booking-browse.type";
import BookProgressHeader from "./components/BookProgressHeader";
import BookStickyCta from "./components/BookStickyCta";
import BookBranchStep from "./components/BookBranchStep";
import BookServicesStep from "./components/BookServicesStep";
import BookDateStep from "./components/BookDateStep";
import BookStaffStep from "./components/BookStaffStep";
import BookPriceStep from "./components/BookPriceStep";
import BookSlotsStep from "./components/BookSlotsStep";
import BookConfirmStep from "./components/BookConfirmStep";
import BookSuccessPanel from "./components/BookSuccessPanel";
import { useBookDraftPersistence } from "./hooks/useBookDraftPersistence";
import { useBookWizardNavigation } from "./hooks/useBookWizardNavigation";
import { useBookConfirm } from "./hooks/useBookConfirm";
import { resolveStaffFromSlotResponse } from "./utils/resolveSlotStaff";
import { RouteAddress } from "@/shared/data/routeAddress";

/**
 * Customer booking wizard:
 * 1 services (+ branch picker for multi-branch salons) → 2 staff or «اولین نوبت» →
 * 3 date with its free times underneath → 4 invoice → 5 confirm & book.
 *
 * «اولین نوبت» asks GET /api/booking/first-available once and prefills date, time and staff; the
 * date step then only loads that staff member's times. If the lookup fails, the date step falls
 * back to every staff member's free times and the staff is taken from the picked slot.
 */
export default function BookView() {
  const params = useParams<{ id: string }>();
  const salonPublicId = params?.id;
  const queryClient = useQueryClient();

  const { data: salonRes, isLoading: salonLoading } = useQuerySalonById(salonPublicId);
  const salon = salonRes?.data;

  const branches: ISalonBranch[] = useMemo(
    () =>
      (salon?.branches ?? []).filter(
        (b): b is ISalonBranch => typeof b.publicId === "string" && b.publicId.length > 0
      ),
    [salon?.branches]
  );

  const [step, setStep] = useState(1);
  const [branchPublicId, setBranchPublicId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState("");
  const [selectedServices, setSelectedServices] = useState<IBranchService[]>([]);
  const [staff, setStaff] = useState<IStaffAvailability | null>(null);
  const [useFirstAvailable, setUseFirstAvailable] = useState(false);
  const [firstAvailableResolved, setFirstAvailableResolved] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [resolvedStaffPublicId, setResolvedStaffPublicId] = useState<string | null>(null);
  const [resolvedStaffName, setResolvedStaffName] = useState<string | null>(null);
  const [slotTime, setSlotTime] = useState<string | null>(null);
  const [slotEndTime, setSlotEndTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

  const clearSlot = () => {
    setSlotTime(null);
    setSlotEndTime(null);
  };

  /** Everything chosen after the services (staff, first-available, date, time). */
  const resetFromStaff = () => {
    setStaff(null);
    setUseFirstAvailable(false);
    setFirstAvailableResolved(false);
    setDate(null);
    setResolvedStaffPublicId(null);
    setResolvedStaffName(null);
    clearSlot();
  };

  const { data: branchServicesRes, isLoading: servicesLoading } =
    useQueryBranchServices(branchPublicId);

  const branchServices = useMemo(
    () =>
      (branchServicesRes?.data ?? []).filter(
        (s) =>
          typeof s.offeringPublicId === "string" &&
          s.offeringPublicId.length > 0 &&
          typeof s.servicePublicId === "string" &&
          s.servicePublicId.length > 0
      ),
    [branchServicesRes?.data]
  );

  const offeringPublicIds = useMemo(
    () => selectedServices.map((s) => s.offeringPublicId).filter(Boolean),
    [selectedServices]
  );
  const serviceTypePublicIds = useMemo(
    () => selectedServices.map((s) => s.servicePublicId).filter(Boolean),
    [selectedServices]
  );
  const primaryServiceTypePublicId = serviceTypePublicIds[0] ?? null;

  // Step 2 — staff who perform the selected services.
  const { data: staffProfilesRes, isLoading: staffLoading } = useQueryStaffForOfferings(
    salonPublicId,
    offeringPublicIds,
    { enabled: step >= 2, branchPublicId, matchAll: true }
  );
  const staffProfiles = useMemo(() => staffProfilesRes?.data ?? [], [staffProfilesRes?.data]);
  const staffList: IStaffAvailability[] = useMemo(
    () =>
      staffProfiles
        .filter((p): p is typeof p & { staffPublicId: string } => !!p.staffPublicId)
        .map((p) => ({
          staffPublicId: p.staffPublicId,
          fullName: p.firstName || "پرسنل",
          profileImageUrl: p.avatarUrl ?? null,
          staffMemberId: p.staffMemberId,
        })),
    [staffProfiles]
  );

  // Step 2 — «اولین نوبت»: one lookup instead of every staff member's times.
  const firstAvailableQuery = useQueryFirstAvailable({
    salonPublicId,
    branchPublicId,
    offeringPublicIds,
    enabled: useFirstAvailable && step === 2,
  });

  useEffect(() => {
    const found = firstAvailableQuery.data;
    if (!useFirstAvailable || firstAvailableResolved || !found) return;
    const name =
      found.staffName ||
      staffList.find((s) => s.staffPublicId === found.staffPublicId)?.fullName ||
      null;
    setDate(found.date);
    setSlotTime(found.time);
    setSlotEndTime(found.endTime);
    setResolvedStaffPublicId(found.staffPublicId);
    setResolvedStaffName(name);
    setStaff({ staffPublicId: found.staffPublicId, fullName: name ?? "پرسنل" });
    setFirstAvailableResolved(true);
  }, [firstAvailableQuery.data, useFirstAvailable, firstAvailableResolved, staffList]);

  /** Whose calendar/times step 3 loads: the chosen or first-available staff; null = everyone. */
  const scheduleStaffPublicId = useFirstAvailable
    ? firstAvailableResolved
      ? resolvedStaffPublicId
      : null
    : (staff?.staffPublicId ?? null);

  // Step 3 — dates, and the free times of the selected date underneath.
  const { data: datesRes, isLoading: datesLoading } = useQueryAvailableDates(
    branchPublicId,
    primaryServiceTypePublicId,
    scheduleStaffPublicId,
    { enabled: step >= 3 }
  );

  const {
    data: slotsRes,
    isLoading: slotsLoading,
    isError: slotsError,
    refetch: refetchSlots,
  } = useQuerySalonAvailableSlots({
    salonPublicId: salonPublicId ?? undefined,
    branchPublicId: branchPublicId ?? undefined,
    date: date ?? undefined,
    offeringPublicIds,
    staffProfilePublicId: scheduleStaffPublicId,
    enabled: step >= 3 && !!date,
  });

  // Step 4 — invoice for the staff actually doing the booking.
  const {
    data: priceRes,
    isLoading: priceLoading,
    isError: priceError,
    refetch: refetchPrice,
  } = useQueryCalculatePrice(branchPublicId, serviceTypePublicIds, resolvedStaffPublicId, step >= 4);

  const price = priceRes?.data;
  const dates = datesRes?.data ?? [];
  const slotsData = slotsRes?.data;
  const slots = slotsData?.slots ?? [];

  const staffLabel = useFirstAvailable
    ? resolvedStaffName
      ? `اولین نوبت · ${resolvedStaffName}`
      : "اولین نوبت"
    : staff?.fullName || resolvedStaffName || "—";

  const firstAvailableResult: IFirstAvailableSlot | null | undefined =
    firstAvailableResolved && date && slotTime && resolvedStaffPublicId
      ? {
          date,
          time: slotTime,
          endTime: slotEndTime ?? slotTime,
          staffPublicId: resolvedStaffPublicId,
          staffName: resolvedStaffName,
        }
      : firstAvailableQuery.isSuccess
        ? firstAvailableQuery.data
        : undefined;

  const { draftReadyRef, persistDraftNow } = useBookDraftPersistence({
    salonPublicId,
    createdId,
    step,
    branchPublicId,
    branchName,
    selectedServices,
    date,
    staff,
    useFirstAvailable,
    firstAvailableResolved,
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
    setFirstAvailableResolved,
    setResolvedStaffPublicId,
    setResolvedStaffName,
    setSlotTime,
    setSlotEndTime,
    setNotes,
  });

  const { canGoNext, goNext, goBack } = useBookWizardNavigation({
    salonPublicId,
    branches,
    step,
    branchPublicId,
    selectedServices,
    staff,
    useFirstAvailable,
    firstAvailableLoading: useFirstAvailable && firstAvailableQuery.isFetching && !firstAvailableResolved,
    price,
    date,
    slotTime,
    resolvedStaffPublicId,
    draftReadyRef,
    setStep,
    setBranchPublicId,
    setBranchName,
    setError,
  });

  const { handleConfirm, isCreating, isLoggedIn } = useBookConfirm({
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
  });

  const selectBranch = (branch: ISalonBranch) => {
    setBranchPublicId(branch.publicId);
    setBranchName(branch.name);
    setSelectedServices([]);
    resetFromStaff();
  };

  const toggleService = (svc: IBranchService) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.offeringPublicId === svc.offeringPublicId)
        ? prev.filter((s) => s.offeringPublicId !== svc.offeringPublicId)
        : [...prev, svc]
    );
    resetFromStaff();
  };

  const selectStaff = (s: IStaffAvailability) => {
    resetFromStaff();
    setStaff(s);
    setResolvedStaffPublicId(s.staffPublicId);
    setResolvedStaffName(s.fullName);
  };

  const selectFirstAvailable = () => {
    resetFromStaff();
    setUseFirstAvailable(true);
    // Always re-ask, and drop the previous answer first: the earliest slot may have been taken
    // since, and a failed re-ask must not fall back to (and re-apply) the stale result.
    void queryClient.resetQueries({ queryKey: [FIRST_AVAILABLE_QUERY_KEY] });
  };

  const selectDate = (nextDate: string) => {
    setDate(nextDate);
    clearSlot();
    setError("");
    // Fallback mode (no first-available result): staff is decided by the slot picked below.
    if (useFirstAvailable && !firstAvailableResolved) {
      setResolvedStaffPublicId(null);
      setResolvedStaffName(null);
    }
  };

  const selectSlot = (slot: ISalonBrowseSlot) => {
    setSlotTime(slot.time);
    setSlotEndTime(slot.endTime);
    setError("");

    if (scheduleStaffPublicId) {
      setResolvedStaffPublicId(scheduleStaffPublicId);
      setResolvedStaffName(staff?.fullName ?? resolvedStaffName);
      return;
    }

    const resolved = resolveStaffFromSlotResponse({ slot, slotsData, staffList, staffProfiles });
    if (!resolved?.staffPublicId) {
      setResolvedStaffPublicId(null);
      setResolvedStaffName(null);
      setError(
        "پرسنل این ساعت از پاسخ سرور مشخص نشد. پرسنل مشخصی انتخاب کنید یا دوباره تلاش کنید."
      );
      return;
    }
    setResolvedStaffPublicId(resolved.staffPublicId);
    setResolvedStaffName(resolved.fullName);
  };

  if (salonLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-foreground-muted">
        در حال بارگذاری…
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-safe-area text-center text-sm text-error">
        سالن یافت نشد.
      </div>
    );
  }

  if (createdId != null) {
    return <BookSuccessPanel bookingId={createdId} salonId={salonPublicId ?? salon.id} />;
  }

  const showBranchPicker = branches.length > 1;
  const showBranchChip = showBranchPicker && Boolean(branchName) && step > 1;

  return (
    <div className="flex flex-col pb-28">
      <TopNavigation fallbackHref={RouteAddress.SALONS.DETAILS(salonPublicId!)}>
        رزرو نوبت
      </TopNavigation>
      {salon.name ? (
        <p className="-mt-1 px-safe-area text-xs text-foreground-muted">{salon.name}</p>
      ) : null}

      <BookProgressHeader step={step} branchChip={showBranchChip ? branchName : null} />

      <div className="mt-4 flex flex-col gap-4 px-safe-area">
        {error && (
          <p className="rounded-2xl bg-error/10 px-4 py-3 text-xs text-error">{error}</p>
        )}

        {step === 1 && (
          <>
            {showBranchPicker && (
              <BookBranchStep
                branches={branches}
                selectedBranchPublicId={branchPublicId}
                onSelect={selectBranch}
              />
            )}
            {branchPublicId && (
              <BookServicesStep
                services={branchServices}
                selectedServices={selectedServices}
                isLoading={servicesLoading}
                onToggle={toggleService}
              />
            )}
          </>
        )}

        {step === 2 && (
          <BookStaffStep
            staffList={staffList}
            selectedStaffPublicId={staff?.staffPublicId ?? null}
            useFirstAvailable={useFirstAvailable}
            firstAvailable={{
              isLoading: firstAvailableQuery.isFetching && !firstAvailableResolved,
              result: firstAvailableResult,
              isError: firstAvailableQuery.isError,
            }}
            isLoading={staffLoading}
            onSelectFirstAvailable={selectFirstAvailable}
            onSelectStaff={selectStaff}
            onChangeServices={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <>
            <BookDateStep
              dates={dates}
              selectedDate={date}
              isLoading={datesLoading}
              onSelect={selectDate}
              onChangeServices={() => setStep(1)}
            />
            {date && (
              <BookSlotsStep
                slots={slots}
                selectedTime={slotTime}
                isLoading={slotsLoading}
                isError={slotsError}
                onSelect={selectSlot}
                onChangeStaff={() => setStep(2)}
                onRetry={() => {
                  void refetchSlots();
                }}
              />
            )}
          </>
        )}

        {step === 4 && (
          <BookPriceStep
            price={price}
            isLoading={priceLoading}
            isError={priceError}
            onRetry={() => {
              void refetchPrice();
            }}
          />
        )}

        {step === 5 && (
          <BookConfirmStep
            salonName={salon.name}
            branchName={branchName}
            services={selectedServices}
            date={date}
            slotTime={slotTime}
            slotEndTime={slotEndTime}
            staffLabel={staffLabel}
            price={price}
            notes={notes}
            onNotesChange={setNotes}
            isLoggedIn={isLoggedIn}
          />
        )}
      </div>

      <BookStickyCta
        step={step}
        canContinue={canGoNext()}
        isCreating={isCreating}
        isLoggedIn={isLoggedIn}
        onBack={goBack}
        onContinue={goNext}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
