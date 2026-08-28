"use client";

import { useEffect, useRef, useState } from "react";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useOnboardingDraftStore } from "@/services/domains/salons/store/useOnboardingDraftStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useMutateSalonStaff } from "@/services/domains/salons/hooks/useMutateSalonStaff";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import type { IOnboardingStaff } from "@/services/domains/salons/types/onboarding.type";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardEmptyState,
  DashboardSkeleton,
  DashboardToast,
  type DashboardToastState,
} from "../_components";
import StaffRosterSection from "./components/StaffRosterSection";
import {
  createEmptyStaff,
  type StaffEditorValues,
} from "./components/StaffEditorItem";
import {
  validateStaffRoster,
  type TStaffRosterFieldErrors,
} from "./components/staffRosterValidation";

function makeClientKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `staff-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toEditorValues(staff: IOnboardingStaff[]): StaffEditorValues[] {
  return staff.map((s) => ({
    publicId: s.publicId,
    clientKey: s.publicId ?? makeClientKey(),
    isCreator: s.isCreator,
    branchPublicId: s.branchPublicId,
    phoneNumber: s.phoneNumber ?? "",
    offeringPublicIds: s.offeringPublicIds,
  }));
}

function toOnboardingStaff(rows: StaffEditorValues[]): IOnboardingStaff[] {
  return rows.map((r) => ({
    publicId: r.publicId,
    branchPublicId: r.branchPublicId,
    isCreator: r.isCreator,
    // Owner identity is JWT-linked server-side, not entered here.
    phoneNumber: r.isCreator ? null : r.phoneNumber.trim() || null,
    offeringPublicIds: r.offeringPublicIds,
  }));
}

export default function StaffView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const draftStaff = useOnboardingDraftStore((s) => s.staff);
  const setDraftStaff = useOnboardingDraftStore((s) => s.setStaff);

  const salonQuery = useQuerySalonById(salonPublicId || undefined);
  const salon = salonQuery.data?.data;
  const branches = salon?.branches ?? [];
  const services = salon?.services ?? [];

  const authMeQuery = useQueryAuthMe();
  const ownerPhone = authMeQuery.data?.data?.phone;

  const saveStaff = useMutateSalonStaff();
  const [toast, setToast] = useState<DashboardToastState>(null);
  const [errors, setErrors] = useState<Record<string, TStaffRosterFieldErrors>>({});
  const [rows, setRows] = useState<StaffEditorValues[]>([]);

  // Seed once from the local draft (the best available "current" source — see the
  // caveat banner below) rather than re-seeding on every draftStaff change, so the
  // owner's in-progress edits here aren't clobbered by an unrelated store update.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    setRows(
      draftStaff.length > 0
        ? toEditorValues(draftStaff)
        : [{ ...createEmptyStaff(), isCreator: true, clientKey: makeClientKey() }]
    );
  }, [draftStaff]);

  const allOfferingIds = services
    .map((s) => s.offeringPublicId)
    .filter((id): id is string => !!id);
  const staffProfilesQuery = useQueryStaffForOfferings(
    salonPublicId || undefined,
    allOfferingIds,
    { enabled: allOfferingIds.length > 0 }
  );
  const staffProfiles = staffProfilesQuery.data?.data ?? [];

  const statusLabelFor = (row: StaffEditorValues): string | null => {
    if (row.isCreator) return null;
    if (!row.publicId) return "هنوز ذخیره نشده";
    const matched = staffProfiles.find(
      (p) => p.staffPublicId === row.publicId || p.publicId === row.publicId
    );
    if (matched) {
      return (
        matched.fullName ||
        [matched.firstName, matched.lastName].filter(Boolean).join(" ") ||
        null
      );
    }
    return "در انتظار ورود اولیه";
  };

  const onSave = async () => {
    if (!salonPublicId) {
      setToast({
        type: "error",
        message: "شناسه سالن فعال پیدا نشد. دوباره وارد پنل شوید.",
      });
      return;
    }

    const fieldErrors = validateStaffRoster(rows);
    if (fieldErrors) {
      setErrors(fieldErrors);
      setToast({ type: "error", message: "لطفاً خطاهای فرم را برطرف کنید." });
      return;
    }
    setErrors({});

    try {
      const res = await saveStaff.mutateAsync({
        salonPublicId,
        staff: toOnboardingStaff(rows),
      });
      const saved = res.data ?? [];
      if (saved.length > 0) {
        setDraftStaff(saved);
        setRows(toEditorValues(saved));
      }
      setToast({ type: "success", message: "پرسنل با موفقیت ذخیره شدند." });
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ذخیره پرسنل ناموفق بود."),
      });
    }
  };

  if (!salonPublicId) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="پرسنل" />
        <DashboardEmptyState
          title="سالن فعال یافت نشد"
          description="ابتدا یک سالن را از سوییچر انتخاب کنید."
        />
      </DashboardPage>
    );
  }

  if (salonQuery.isLoading) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="پرسنل" />
        <DashboardSkeleton cards={1} rows={4} />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>
      <DashboardPageHeader title="پرسنل" />

      <div className="flex items-start gap-2 rounded-[12px] bg-warning-background px-3 py-2 text-xs text-warning-foreground">
        <span>
          این لیست بر اساس آخرین ذخیره‌سازی در همین دستگاه است، نه لزوماً آخرین وضعیت
          سرور. اگر پرسنلی از مرورگر یا دستگاه دیگری اضافه شده، برای جلوگیری از حذف
          شدنش باید اینجا هم دوباره اضافه شود.
        </span>
      </div>

      <StaffRosterSection
        staff={rows}
        branches={branches}
        services={services}
        ownerPhone={ownerPhone}
        statusLabelFor={statusLabelFor}
        errors={errors}
        onChange={setRows}
        onSave={() => void onSave()}
        isSaving={saveStaff.isPending}
      />

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
