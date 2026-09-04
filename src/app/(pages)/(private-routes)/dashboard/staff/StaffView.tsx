"use client";

import { useEffect, useRef, useState } from "react";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useMutateSalonStaff } from "@/services/domains/salons/hooks/useMutateSalonStaff";
import { useQueryStaffRoster } from "@/services/domains/salons/hooks/useQueryStaffRoster";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { StaffInvitationStatus } from "@/services/common/enums/domain-enums";
import type {
  IOnboardingStaff,
  IStaffRosterMember,
} from "@/services/domains/salons/types/onboarding.type";
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

/** Common shape shared by IOnboardingStaff (save-staff response) and IStaffRosterMember (roster GET). */
type TStaffEditorSource = {
  publicId: string | null;
  isCreator: boolean;
  branchPublicId: string;
  phoneNumber?: string | null;
  offeringPublicIds: string[];
};

function makeClientKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `staff-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toEditorValues(staff: TStaffEditorSource[]): StaffEditorValues[] {
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

  const salonQuery = useQuerySalonById(salonPublicId || undefined);
  const salon = salonQuery.data?.data;
  const branches = salon?.branches ?? [];
  const services = salon?.services ?? [];

  const rosterQuery = useQueryStaffRoster(salonPublicId || undefined);
  const roster = rosterQuery.data?.data ?? [];
  const rosterByPublicId = new Map<string, IStaffRosterMember>(
    roster.map((r) => [r.publicId, r])
  );

  const authMeQuery = useQueryAuthMe();
  const ownerPhone = authMeQuery.data?.data?.phone;

  const saveStaff = useMutateSalonStaff();
  const [toast, setToast] = useState<DashboardToastState>(null);
  const [errors, setErrors] = useState<Record<string, TStaffRosterFieldErrors>>({});
  const [rows, setRows] = useState<StaffEditorValues[]>([]);

  // Seed once from the roster GET (the server's source of truth) rather than
  // re-seeding on every background refetch, so the owner's in-progress edits
  // here aren't clobbered by an unrelated cache update.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current || rosterQuery.isLoading) return;
    hydratedRef.current = true;
    setRows(
      roster.length > 0
        ? toEditorValues(roster)
        : [{ ...createEmptyStaff(), isCreator: true, clientKey: makeClientKey() }]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterQuery.isLoading]);

  // Enrichment only: once an invited phone has logged in and status is Active,
  // this resolves their display name. Pending/Active/Rejected itself always
  // comes from the roster's own `status`/`hasLoggedIn` fields, never guessed.
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

    const rosterMatch = rosterByPublicId.get(row.publicId);
    if (!rosterMatch) return "در انتظار ورود اولیه";
    if (rosterMatch.status === StaffInvitationStatus.Rejected) return "دعوت رد شده";
    if (rosterMatch.status === StaffInvitationStatus.Pending) return "در انتظار پذیرش دعوت";
    if (!rosterMatch.hasLoggedIn) return "در انتظار ورود اولیه";

    const matchedProfile = staffProfiles.find((p) => p.staffPublicId === row.publicId);
    return matchedProfile?.firstName || "فعال";
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

  if (salonQuery.isLoading || rosterQuery.isLoading) {
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
