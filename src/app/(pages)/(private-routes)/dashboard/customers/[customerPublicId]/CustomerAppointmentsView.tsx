"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ChatCircleTextIcon, PhoneIcon, PlusIcon } from "@phosphor-icons/react";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import {
  historyToAgendaItem,
  useQueryCustomerAppointments,
} from "@/services/domains/appointments/hooks";
import type { IAgendaItem } from "@/services/domains/appointments/types/appointments.type";
import { useCustomerPreviewStore } from "@/services/domains/customers/store/useCustomerPreviewStore";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { APP_LOCALE } from "@/shared/utils/locale";
import { formatSalonDate, salonTodayYmd } from "@/shared/utils/salonTime";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardSkeleton,
  DashboardToast,
  useIsSalonStaff,
  useQuickBookStore,
  type DashboardToastState,
} from "../../_components";
import { AgendaRow } from "../../_agenda/AgendaRow";
import { AppointmentDetailsSheet } from "../../_agenda/AppointmentDetailsSheet";

const PAGE_STEP = 20;
const actionClass =
  "flex h-11 flex-1 items-center justify-center gap-2 rounded-[12px] bg-surface-hover text-sm font-semibold text-foreground transition-colors hover:bg-surface-active";

/** «مهر 1405» (Intl puts the year first for this locale). */
function monthTitle(iso: string): string {
  try {
    return `${formatSalonDate(iso, { month: "long" })} ${formatSalonDate(iso, { year: "numeric" })}`;
  } catch {
    return "";
  }
}

/** A customer's page: who they are, how to reach them, what's next, and their history here. */
export default function CustomerAppointmentsView() {
  const params = useParams<{ customerPublicId: string }>();
  const customerPublicId = params?.customerPublicId;
  const preview = useCustomerPreviewStore((s) =>
    customerPublicId ? s.byPublicId[customerPublicId] : undefined
  );
  const isStaff = useIsSalonStaff();
  const openQuickBook = useQuickBookStore((s) => s.openQuickBook);
  const [pageSize, setPageSize] = useState(PAGE_STEP);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState<DashboardToastState>(null);

  const history = useQueryCustomerAppointments(customerPublicId, { page: 1, pageSize });
  const upcoming = useQueryCustomerAppointments(customerPublicId, {
    from: salonTodayYmd(),
    status: AppointmentStatus.Scheduled,
    page: 1,
    pageSize: 3,
  });
  const noShows = useQueryCustomerAppointments(customerPublicId, {
    status: AppointmentStatus.NoShow,
    page: 1,
    pageSize: 1,
  });

  const result = history.data?.data;
  const items = useMemo(() => (result?.items ?? []).map(historyToAgendaItem), [result]);
  const upcomingItems = useMemo(
    () =>
      (upcoming.data?.data?.items ?? [])
        .map(historyToAgendaItem)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [upcoming.data]
  );
  const months = useMemo(() => {
    // Upcoming ones are already shown above.
    const upcomingIds = new Set(upcomingItems.map((x) => x.numericId));
    const groups: { title: string; items: IAgendaItem[] }[] = [];
    for (const item of items) {
      if (upcomingIds.has(item.numericId)) continue;
      const title = monthTitle(item.startTime);
      const last = groups[groups.length - 1];
      if (last?.title === title) last.items.push(item);
      else groups.push({ title, items: [item] });
    }
    return groups;
  }, [items, upcomingItems]);

  const name = preview?.fullName || result?.items?.[0]?.customerName || "مشتری";
  const phone = preview?.phone;
  const total = result?.totalCount ?? 0;
  const noShowCount = noShows.data?.data?.totalCount ?? 0;
  const selected =
    [...upcomingItems, ...items].find((x) => x.numericId === selectedId) ?? null;

  const stats = [
    `${total.toLocaleString(APP_LOCALE)} نوبت`,
    noShowCount ? `${noShowCount.toLocaleString(APP_LOCALE)} بار مراجعه نکرده` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const row = (item: IAgendaItem) => (
    <AgendaRow
      key={item.numericId}
      item={item}
      variant="history"
      showBranch={false}
      onOpen={(x) => setSelectedId(x.numericId)}
    />
  );

  return (
    <DashboardPage className="gap-5">
      <DashboardPageHeader title="مشتری" backHref={RouteAddress.DASHBOARD.CUSTOMERS} />

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-brand text-xl font-bold text-content-brand">
            {name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-foreground">{name}</p>
            {phone ? (
              <p className="text-sm text-foreground-muted" dir="ltr">
                {phone}
              </p>
            ) : null}
            {result ? <p className="mt-0.5 text-xs text-foreground-muted">{stats}</p> : null}
          </div>
        </div>
        <div className="flex gap-2">
          {phone ? (
            <>
              <a href={`tel:${phone}`} className={actionClass}>
                <PhoneIcon size={18} />
                تماس
              </a>
              <a href={`sms:${phone}`} className={actionClass}>
                <ChatCircleTextIcon size={18} />
                پیامک
              </a>
            </>
          ) : null}
          <button
            type="button"
            onClick={() =>
              openQuickBook(phone ? { customer: { phone, fullName: name } } : undefined)
            }
            className={`${actionClass} bg-primary text-primary-foreground hover:bg-primary`}
          >
            <PlusIcon size={18} weight="bold" />
            نوبت جدید
          </button>
        </div>
      </section>

      {upcomingItems.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-xs font-semibold text-foreground-muted">نوبت‌های آینده</h2>
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
            {upcomingItems.map(row)}
          </div>
        </section>
      ) : null}

      {history.isLoading ? (
        <DashboardSkeleton cards={1} rows={4} />
      ) : history.error ? (
        <p className="text-sm text-error">{getApiErrorMessage(history.error, "خطا در دریافت نوبت‌ها")}</p>
      ) : items.length === 0 ? (
        <div className="rounded-[16px] bg-background-secondary p-6 text-center text-sm text-foreground-muted">
          هنوز نوبتی در این سالن ندارد.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="px-1 text-sm font-bold text-foreground">سابقه</h2>
          {months.map((m, i) => (
            <section key={`${m.title}-${i}`} className="flex flex-col gap-2">
              <h3 className="px-1 text-xs font-semibold text-foreground-muted">{m.title}</h3>
              <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
                {m.items.map(row)}
              </div>
            </section>
          ))}
          {result?.hasNext && pageSize < 100 ? (
            <button
              type="button"
              disabled={history.isFetching}
              onClick={() => setPageSize((s) => Math.min(100, s + PAGE_STEP))}
              className="self-center rounded-full bg-surface-hover px-5 py-2 text-xs font-semibold text-foreground disabled:opacity-50"
            >
              بیشتر
            </button>
          ) : null}
        </div>
      )}

      <AppointmentDetailsSheet
        item={selected}
        isStaff={isStaff}
        showBranch
        onClose={() => setSelectedId(null)}
        onToast={setToast}
      />
      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
