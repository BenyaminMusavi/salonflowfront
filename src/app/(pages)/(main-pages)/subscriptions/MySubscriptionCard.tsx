"use client";

import { useState } from "react";
import { Badge } from "@/shared/components/primitives/badge/Badge";
import { Button } from "@/shared/components/primitives/button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";
import { SubscriptionStatus } from "@/services/common/enums/domain-enums";
import {
  useMutateCancelSubscription,
  useMutateRequestResume,
} from "@/services/domains/subscriptions/hooks/useMutateSubscriptions";
import { ISubscription } from "@/services/domains/subscriptions/types/subscriptions.type";
import {
  isCancelScheduled,
  subscriptionStatusLabel,
  subscriptionStatusVariant,
} from "@/services/domains/subscriptions/utils/subscription-display";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { formatSalonDate } from "@/shared/utils/salonTime";

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };

/** «اشتراک من»: status, dates, cancel (no refund) and the request to undo a cancellation. */
export default function MySubscriptionCard({ subscription }: { subscription: ISubscription }) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [error, setError] = useState("");
  const { mutateAsync: cancel, isPending: cancelPending } = useMutateCancelSubscription();
  const { mutateAsync: requestResume, isPending: resumePending } = useMutateRequestResume();

  const status = Number(subscription.status);
  const isPendingStart = status === SubscriptionStatus.PendingStart;
  const cancelScheduled = isCancelScheduled({ status, cancelAtPeriodEnd: subscription.cancelAtPeriodEnd });
  const endLabel = subscription.endDate ? formatSalonDate(subscription.endDate, DATE_FORMAT) : null;
  const graceLabel = subscription.gracePeriodEndDate
    ? formatSalonDate(subscription.gracePeriodEndDate, DATE_FORMAT)
    : null;

  // Cancel is only meaningful for a running subscription that is not already cancelled.
  const canCancel = status === SubscriptionStatus.Active && !subscription.cancelAtPeriodEnd;
  const canRequestResume = cancelScheduled && !subscription.resumeRequestedAt;

  const onCancel = async () => {
    setError("");
    try {
      await cancel();
      setCancelOpen(false);
    } catch (e) {
      setCancelOpen(false);
      setError(getApiErrorMessage(e, "لغو اشتراک ناموفق بود."));
    }
  };

  const onRequestResume = async () => {
    setError("");
    try {
      await requestResume();
    } catch (e) {
      setError(getApiErrorMessage(e, "ثبت درخواست ناموفق بود."));
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-[20px] bg-surface-tertiary p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-foreground">اشتراک من</h2>
        <Badge variant={cancelScheduled ? "warning" : subscriptionStatusVariant(status)}>
          {cancelScheduled ? "لغو شده" : subscriptionStatusLabel(status)}
        </Badge>
      </div>

      {subscription.planName ? (
        <p className="text-sm font-semibold text-foreground">{subscription.planName}</p>
      ) : null}

      {isPendingStart ? (
        <p className="text-xs leading-6 text-foreground-muted">
          اشتراک {subscription.pendingDurationMonths ?? ""} ماهه شما پس از تأیید سالن توسط تیم صفا شروع می‌شود.
        </p>
      ) : (
        <div className="flex flex-col gap-1 text-xs text-foreground-muted">
          {subscription.startDate ? (
            <p>شروع: {formatSalonDate(subscription.startDate, DATE_FORMAT)}</p>
          ) : null}
          {endLabel ? (
            <p>{cancelScheduled ? `تا ${endLabel} فعال است و تمدید نمی‌شود.` : `پایان: ${endLabel}`}</p>
          ) : null}
          {status === SubscriptionStatus.Grace && graceLabel ? (
            <p>مهلت تمدید تا {graceLabel}؛ بعد از آن پنل قفل می‌شود.</p>
          ) : null}
        </div>
      )}

      {subscription.resumeRequestedAt ? (
        <p className="rounded-2xl bg-primary/10 px-4 py-3 text-xs text-foreground">
          درخواست شما در انتظار تأیید ادمین است.
        </p>
      ) : null}

      {error ? <p className="rounded-2xl bg-error/10 px-4 py-3 text-xs text-error">{error}</p> : null}

      {canRequestResume || canCancel ? (
        <div className="flex flex-wrap gap-2">
          {canRequestResume ? (
            <Button size="sm" shape="rounded" isLoading={resumePending} onClick={() => void onRequestResume()}>
              درخواست برگرداندن لغو
            </Button>
          ) : null}
          {canCancel ? (
            <Button size="sm" shape="rounded" variant="outline" onClick={() => setCancelOpen(true)}>
              لغو اشتراک
            </Button>
          ) : null}
        </div>
      ) : null}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>لغو اشتراک</DialogTitle>
            <DialogDescription>
              {endLabel ? `اشتراک تا ${endLabel} فعال می‌ماند و بعد از آن تمدید نمی‌شود. ` : ""}
              مبلغ پرداخت‌شده برگردانده نمی‌شود. ادامه می‌دهید؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>
              انصراف
            </Button>
            <Button type="button" variant="destructive" isLoading={cancelPending} onClick={() => void onCancel()}>
              لغو اشتراک
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
