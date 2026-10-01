"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DotsThreeIcon } from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { Button } from "@/shared/components/primitives/button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";
import {
  historyToAgendaItem,
  useQueryStaffAppointments,
} from "@/services/domains/appointments/hooks";
import type { IAgendaItem } from "@/services/domains/appointments/types/appointments.type";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { salonTodayYmd, utcToSalonYmd } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardSkeleton,
  DashboardToast,
  type DashboardToastState,
} from "../../_components";
import { dashboardQuietButtonClass } from "../../_components/buttonClasses";
import { AgendaRow } from "../../_agenda/AgendaRow";
import { AppointmentDetailsSheet } from "../../_agenda/AppointmentDetailsSheet";
import { agendaRange, type AgendaView } from "../../_agenda/agendaUtils";
import { dayLabel } from "../../_agenda/DayTimePicker";
import { WeeklyScheduleEditor } from "../../_schedule/WeeklyScheduleEditor";
import { SpecialDaysEditor } from "../../_schedule/SpecialDaysEditor";
import { StaffServicesTab } from "../../_staff/StaffServicesTab";
import { STAFF_STATE_LABEL, useSalonStaff, type ISalonStaffMember } from "../../_staff/useSalonStaff";

type Tab = "appointments" | "schedule" | "services";
const TABS: { id: Tab; label: string }[] = [
  { id: "appointments", label: "نوبت‌ها" },
  { id: "schedule", label: "برنامه" },
  { id: "services", label: "خدمات و قیمت" },
];

const segment = (active: boolean) =>
  cn(
    "h-9 flex-1 rounded-full text-[13px] font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "text-foreground-muted"
  );

const rangeChip = (active: boolean) =>
  cn(
    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-surface-brand text-content-brand" : "bg-surface-hover text-foreground-muted"
  );

function AppointmentsTab({ member, onToast }: { member: ISalonStaffMember; onToast: (t: DashboardToastState) => void }) {
  const today = salonTodayYmd();
  const [view, setView] = useState<AgendaView>("today");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const range = agendaRange(view, today, today);
  const query = useQueryStaffAppointments(member.publicId, {
    from: range.from,
    to: range.to,
    page: 1,
    pageSize: 100,
  });
  const items = useMemo(
    () =>
      (query.data?.data?.items ?? [])
        .map(historyToAgendaItem)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [query.data]
  );
  const byDay = useMemo(() => {
    const groups: { day: string; items: IAgendaItem[] }[] = [];
    for (const item of items) {
      const day = utcToSalonYmd(item.startTime);
      const last = groups[groups.length - 1];
      if (last?.day === day) last.items.push(item);
      else groups.push({ day, items: [item] });
    }
    return groups;
  }, [items]);
  const selected = items.find((x) => x.numericId === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {(
          [
            ["today", "امروز"],
            ["tomorrow", "فردا"],
            ["week", "این هفته"],
          ] as const
        ).map(([v, label]) => (
          <button key={v} type="button" className={rangeChip(view === v)} onClick={() => setView(v)}>
            {label}
          </button>
        ))}
      </div>
      {query.isLoading ? (
        <DashboardSkeleton cards={1} rows={4} />
      ) : items.length === 0 ? (
        <p className="rounded-[16px] bg-background-secondary p-6 text-center text-sm text-foreground-muted">
          نوبتی در این بازه ندارد.
        </p>
      ) : (
        byDay.map((g) => (
          <section key={g.day} className="flex flex-col gap-2">
            {view === "week" ? (
              <h3 className="px-1 text-xs font-semibold text-foreground-muted">{dayLabel(g.day)}</h3>
            ) : null}
            <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
              {g.items.map((item) => (
                <AgendaRow key={item.numericId} item={item} showBranch={false} onOpen={(x) => setSelectedId(x.numericId)} />
              ))}
            </div>
          </section>
        ))
      )}
      <AppointmentDetailsSheet
        item={selected}
        isStaff={false}
        showBranch
        onClose={() => setSelectedId(null)}
        onToast={onToast}
      />
    </div>
  );
}

/** One person's page — everything about them in their own context. */
export default function StaffDetailsView() {
  const router = useRouter();
  const { staffPublicId } = useParams<{ staffPublicId: string }>();
  const { members, branches, isLoading, saveRoster, isSaving } = useSalonStaff();
  const member = members.find((m) => m.publicId === staffPublicId);
  const [tab, setTab] = useState<Tab>("appointments");
  const [toast, setToast] = useState<DashboardToastState>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const multiBranch = branches.length > 1;

  if (isLoading) {
    return (
      <DashboardPage>
        <DashboardSkeleton cards={1} rows={4} />
      </DashboardPage>
    );
  }
  if (!member) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="پرسنل" backHref={RouteAddress.DASHBOARD.STAFF} />
        <p className="rounded-[16px] bg-background-secondary p-6 text-center text-sm text-foreground-muted">
          این نفر در پرسنل سالن نیست.
        </p>
      </DashboardPage>
    );
  }

  const changeBranch = async (branchPublicId: string) => {
    try {
      await saveRoster((rows) =>
        rows.map((r) => (r.publicId === member.publicId ? { ...r, branchPublicId } : r))
      );
      setToast({ type: "success", message: "شعبه تغییر کرد." });
      setBranchOpen(false);
    } catch (err) {
      setToast({ type: "error", message: getApiErrorMessage(err, "تغییر شعبه ناموفق بود.") });
    }
  };

  const remove = async () => {
    try {
      await saveRoster((rows) => rows.filter((r) => r.publicId !== member.publicId));
      router.replace(RouteAddress.DASHBOARD.STAFF);
    } catch (err) {
      setToast({ type: "error", message: getApiErrorMessage(err, "حذف ناموفق بود.") });
      setRemoveOpen(false);
    }
  };

  const meta = [STAFF_STATE_LABEL[member.state], multiBranch ? member.branchName : null]
    .filter(Boolean)
    .join(" · ");
  const canManage = !member.isCreator;

  return (
    <DashboardPage className="gap-5">
      <DashboardPageHeader
        title="پرسنل"
        backHref={RouteAddress.DASHBOARD.STAFF}
        action={
          canManage || multiBranch ? (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-label="کارهای بیشتر"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover"
            >
              <DotsThreeIcon size={22} weight="bold" />
            </button>
          ) : null
        }
      />

      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-brand text-xl font-bold text-content-brand">
          {member.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-foreground" dir="auto">{member.name}</p>
          {member.phone ? <p className="text-sm text-foreground-muted" dir="ltr">{member.phone}</p> : null}
          <p className="text-xs text-foreground-muted">{meta}</p>
        </div>
      </div>

      <div className="flex gap-1 rounded-full bg-background-secondary p-1">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={segment(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "appointments" ? <AppointmentsTab member={member} onToast={setToast} /> : null}
      {tab === "schedule" ? (
        member.staffMemberId ? (
          <div className="flex flex-col gap-5">
            <WeeklyScheduleEditor staffMemberId={member.staffMemberId} onToast={setToast} />
            <SpecialDaysEditor staffMemberId={member.staffMemberId} onToast={setToast} />
          </div>
        ) : (
          <p className="rounded-[16px] bg-background-secondary p-4 text-sm leading-6 text-foreground-muted">
            برنامه‌ی کاری بعد از پذیرش دعوت و داشتن حداقل یک خدمت قابل تنظیم است.
          </p>
        )
      ) : null}
      {tab === "services" ? (
        <StaffServicesTab
          member={member}
          isRosterSaving={isSaving}
          onToast={setToast}
          onRosterChange={async (offeringPublicIds) => {
            await saveRoster((rows) =>
              rows.map((r) => (r.publicId === member.publicId ? { ...r, offeringPublicIds } : r))
            );
          }}
        />
      ) : null}

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)}>
        <div className="flex flex-col gap-1">
          {multiBranch ? (
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                setBranchOpen(true);
              }}
              className="flex min-h-12 items-center rounded-[12px] px-3 text-sm font-semibold text-foreground hover:bg-surface-hover"
            >
              تغییر شعبه
            </button>
          ) : null}
          {canManage ? (
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                setRemoveOpen(true);
              }}
              className="flex min-h-12 items-center rounded-[12px] px-3 text-sm font-semibold text-error hover:bg-surface-hover"
            >
              حذف از پرسنل سالن
            </button>
          ) : null}
        </div>
      </BottomSheet>

      <BottomSheet open={branchOpen} onClose={() => setBranchOpen(false)}>
        <h2 className="mb-3 text-base font-bold text-foreground">شعبه‌ی {member.name}</h2>
        <div className="flex flex-col gap-1">
          {branches.map((b) => (
            <button
              key={b.publicId}
              type="button"
              disabled={isSaving}
              onClick={() => void changeBranch(b.publicId)}
              className={cn(
                "flex min-h-12 items-center rounded-[12px] px-3 text-sm font-semibold hover:bg-surface-hover",
                b.publicId === member.branchPublicId ? "bg-surface-brand text-content-brand" : "text-foreground"
              )}
            >
              {b.name}
            </button>
          ))}
        </div>
      </BottomSheet>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف {member.name} از پرسنل؟</DialogTitle>
            <DialogDescription>
              دیگر به پنل این سالن دسترسی ندارد و برایش نوبت جدید ثبت نمی‌شود. نوبت‌های قبلی او را پیش از حذف بررسی کنید.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" className={dashboardQuietButtonClass} onClick={() => setRemoveOpen(false)}>
              انصراف
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-error hover:bg-error-background"
              isLoading={isSaving}
              onClick={() => void remove()}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
