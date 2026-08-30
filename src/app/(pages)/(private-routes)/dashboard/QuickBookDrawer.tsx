"use client";

import { FormEvent, useMemo, useState } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/primitives/dialog/Dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/primitives/drawer/Drawer";
import { findConflictingAppointment } from "@/services/domains/appointments/utils/conflictCheck";
import {
  validateQuickBook,
  TQuickBookFieldErrors,
} from "@/services/domains/appointments/utils/quickBookValidation";
import {
  useMutateQuickBook,
  useQuerySalonAppointments,
} from "@/services/domains/appointments/hooks";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useQueryCatalogOfferings } from "@/services/domains/catalog/hooks";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import {
  getApiErrorMessage,
  SUBSCRIPTION_OWNER_LOCK_MESSAGE,
  toBookingStartTime,
} from "@/services/domains/booking/utils/booking-mappers";
import { useSubscriptionEntitlement } from "@/services/domains/subscriptions/hooks/useSubscriptionEntitlement";
import { RouteAddress } from "@/shared/data/routeAddress";
import { DashboardSelect, type DashboardToastState } from "./_components";

function formatClock(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

interface QuickBookDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  onToast: (toast: DashboardToastState) => void;
}

export default function QuickBookDrawer({
  open,
  onOpenChange,
  date,
  onToast,
}: QuickBookDrawerProps) {
  const salonId = useSalonContextStore((s) => s.salonId);
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);

  const salonDetail = useQuerySalonById(salonPublicId || undefined);
  const branches = salonDetail.data?.data?.branches ?? [];
  const branchFallback = branches[0]?.id;
  const [branchId, setBranchId] = useState<number | "">("");
  const activeBranchId = Number(branchId || branchFallback || 0);

  const offeringsQuery = useQueryCatalogOfferings(true);
  const offerings = offeringsQuery.data?.data ?? [];

  const quickBook = useMutateQuickBook();
  const { isEntitled, isLoading: entitlementLoading } =
    useSubscriptionEntitlement();
  const bookingLocked = !entitlementLoading && !isEntitled;

  const [offeringId, setOfferingId] = useState<number | "">("");
  const selectedOfferingId = Number(offeringId || 0);
  const selectedOffering = offerings.find((o) => o.id === selectedOfferingId);

  const staffQuery = useQueryStaffForOfferings(
    salonPublicId || salonId || undefined,
    selectedOffering?.publicId ? [selectedOffering.publicId] : [],
    { enabled: !!selectedOffering?.publicId }
  );
  const staff = staffQuery.data?.data ?? [];
  const [staffId, setStaffId] = useState<number | "">("");
  const selectedStaffId = Number(staffId) || 0;
  const selectedStaffMember = staff.find((s) => s.id === selectedStaffId);

  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [quickBookErrors, setQuickBookErrors] = useState<TQuickBookFieldErrors>({});
  const [confirmation, setConfirmation] = useState<{
    appointmentId: number;
    startTimeLabel: string;
    staffName: string;
    serviceName: string;
    branchName?: string;
  } | null>(null);

  // A second, narrow query (server-filtered to one staff member) just to check for a
  // conflict before submit — the main board list only carries a display name, not a
  // staff id, so it can't be reused for this on its own.
  const staffDayQuery = useQuerySalonAppointments(
    date,
    { staffMemberId: selectedStaffId, pageSize: 50 },
    { enabled: open && !!selectedStaffId }
  );
  const conflict = useMemo(() => {
    if (!selectedStaffId || !selectedOffering || !time) return null;
    const candidateStart = toBookingStartTime(date, time);
    return findConflictingAppointment(
      staffDayQuery.data?.data?.items ?? [],
      candidateStart,
      selectedOffering.durationMinutes
    );
  }, [selectedStaffId, selectedOffering, time, date, staffDayQuery.data]);

  const onQuickBook = async (e: FormEvent) => {
    e.preventDefault();

    if (bookingLocked) {
      onToast({ type: "error", message: SUBSCRIPTION_OWNER_LOCK_MESSAGE });
      return;
    }

    const startTime = toBookingStartTime(date, time);
    const errors = validateQuickBook({
      phone: phone.trim(),
      branchId: activeBranchId,
      offeringId: selectedOfferingId,
      staffId: selectedStaffId,
      startTime,
    });
    if (errors) {
      setQuickBookErrors(errors);
      return;
    }
    setQuickBookErrors({});

    try {
      const res = await quickBook.mutateAsync({
        phone: phone.trim(),
        fullName: fullName.trim() || "میهمان",
        branchId: activeBranchId,
        startTime,
        notes: notes.trim() || null,
        services: [{ offeringId: selectedOfferingId, staffId: selectedStaffId }],
      });
      const staffName =
        selectedStaffMember?.fullName ||
        [selectedStaffMember?.firstName, selectedStaffMember?.lastName]
          .filter(Boolean)
          .join(" ") ||
        "پرسنل";
      setConfirmation({
        appointmentId: res.data?.appointmentId ?? 0,
        startTimeLabel: formatClock(startTime),
        staffName,
        serviceName: selectedOffering?.serviceTypeName || "-",
        branchName: branches.find((b) => b.id === activeBranchId)?.name,
      });
      setPhone("");
      setFullName("");
      setNotes("");
      onOpenChange(false);
    } catch (err) {
      onToast({
        type: "error",
        message: getApiErrorMessage(err, "ثبت رزرو سریع ناموفق بود.", {
          audience: "owner",
        }),
      });
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(nextOpen) => {
          onOpenChange(nextOpen);
          if (nextOpen) setQuickBookErrors({});
        }}
      >
        <DrawerContent className="max-h-[85vh] overflow-y-auto border-border bg-background">
          <DrawerHeader className="text-right">
            <DrawerTitle>رزرو سریع</DrawerTitle>
          </DrawerHeader>
          <form className="grid grid-cols-1 gap-2 px-4 pb-6" onSubmit={onQuickBook}>
            {bookingLocked ? (
              <p className="text-xs text-error">
                {SUBSCRIPTION_OWNER_LOCK_MESSAGE}{" "}
                <Link className="underline" href={RouteAddress.SUBSCRIPTIONS.BASE}>
                  مدیریت اشتراک
                </Link>
              </p>
            ) : null}
            <div>
              <Input
                placeholder="موبایل مشتری"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                hasError={!!quickBookErrors.phone}
              />
              {quickBookErrors.phone && (
                <p className="mt-1 text-xs font-medium text-error">
                  {quickBookErrors.phone}
                </p>
              )}
            </div>
            <Input
              placeholder="نام مشتری"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <div>
              <DashboardSelect
                value={branchId}
                onChange={(e) => setBranchId(Number(e.target.value))}
              >
                <option value="">انتخاب شعبه</option>
                {branches.map((branch) => (
                  <option
                    key={String(branch.id ?? branch.publicId)}
                    value={branch.id ?? ""}
                  >
                    {branch.name}
                  </option>
                ))}
              </DashboardSelect>
              {quickBookErrors.branchId && (
                <p className="mt-1 text-xs font-medium text-error">
                  {quickBookErrors.branchId}
                </p>
              )}
            </div>
            <div>
              <DashboardSelect
                value={selectedOfferingId || ""}
                onChange={(e) => setOfferingId(Number(e.target.value))}
              >
                <option value="">انتخاب سرویس</option>
                {offerings.map((offering) => (
                  <option key={offering.id} value={offering.id}>
                    {offering.serviceTypeName}
                  </option>
                ))}
              </DashboardSelect>
              {quickBookErrors.offeringId && (
                <p className="mt-1 text-xs font-medium text-error">
                  {quickBookErrors.offeringId}
                </p>
              )}
            </div>
            <div>
              <DashboardSelect
                value={selectedStaffId || ""}
                onChange={(e) => setStaffId(Number(e.target.value))}
              >
                <option value="">انتخاب پرسنل</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName ||
                      [member.firstName, member.lastName]
                        .filter(Boolean)
                        .join(" ")}
                  </option>
                ))}
              </DashboardSelect>
              {quickBookErrors.staffId && (
                <p className="mt-1 text-xs font-medium text-error">
                  {quickBookErrors.staffId}
                </p>
              )}
            </div>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            {conflict && (
              <div className="flex items-start gap-2 rounded-[12px] bg-warning-background px-3 py-2 text-xs text-warning-foreground">
                <WarningCircleIcon size={16} className="mt-0.5 shrink-0" />
                <span>
                  این پرسنل در این بازه نوبت دیگری دارد (
                  {formatClock(conflict.startTime)} تا {formatClock(conflict.endTime)}
                  ). می‌توانید ادامه دهید یا زمان دیگری انتخاب کنید.
                </span>
              </div>
            )}
            <Input
              placeholder="یادداشت (اختیاری)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button
              type="submit"
              isLoading={quickBook.isPending}
              disabled={bookingLocked}
            >
              ثبت رزرو سریع
            </Button>
          </form>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={!!confirmation}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setConfirmation(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رزرو ثبت شد</DialogTitle>
            <DialogDescription>جزئیات نوبت جدید</DialogDescription>
          </DialogHeader>
          {confirmation && (
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">شماره نوبت</span>
                <span className="font-bold text-foreground">
                  #{confirmation.appointmentId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">ساعت</span>
                <span className="font-bold text-foreground">
                  {confirmation.startTimeLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">پرسنل</span>
                <span className="font-bold text-foreground">
                  {confirmation.staffName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">سرویس</span>
                <span className="font-bold text-foreground">
                  {confirmation.serviceName}
                </span>
              </div>
              {confirmation.branchName && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">شعبه</span>
                  <span className="font-bold text-foreground">
                    {confirmation.branchName}
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button type="button" onClick={() => setConfirmation(null)}>
              باشه
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
