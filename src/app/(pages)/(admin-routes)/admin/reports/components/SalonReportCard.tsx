"use client";

import { useState } from "react";
import { Badge } from "@/shared/components/primitives/badge/Badge";
import { Button } from "@/shared/components/primitives/button/Button";
import { TextArea } from "@/shared/components/primitives/textArea/TextArea";
import { IAdminSalonReportListItem } from "@/services/domains/salon-reports/types/salon-reports.type";
import {
  useMutateInvestigateSalonReport,
  useMutateResolveSalonReport,
  useMutateDismissSalonReport,
} from "@/services/domains/salon-reports/hooks/useMutateAdminSalonReportActions";
import {
  salonReportReasonLabel,
  salonReportStatusLabel,
  salonReportStatusVariant,
} from "@/services/domains/salon-reports/utils/admin-report-display";
import { SalonReportStatus } from "@/services/common/enums/domain-enums";

type Mode = "idle" | "resolve" | "dismiss";

export function SalonReportCard({ report }: { report: IAdminSalonReportListItem }) {
  const [mode, setMode] = useState<Mode>("idle");
  const [notes, setNotes] = useState("");

  const { mutateAsync: investigate, isPending: isInvestigating } =
    useMutateInvestigateSalonReport();
  const { mutateAsync: resolve, isPending: isResolving } = useMutateResolveSalonReport();
  const { mutateAsync: dismiss, isPending: isDismissing } = useMutateDismissSalonReport();

  const isPending = isInvestigating || isResolving || isDismissing;

  const handleConfirm = async () => {
    try {
      if (mode === "resolve") {
        await resolve({ id: report.id, data: { adminNotes: notes.trim() || undefined } });
      } else if (mode === "dismiss") {
        await dismiss({ id: report.id, data: { adminNotes: notes.trim() || undefined } });
      }
      setMode("idle");
      setNotes("");
    } catch {
      /* keep panel open on failure */
    }
  };

  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-bold text-foreground">{report.salonName}</p>
          <p className="mt-0.5 text-[11px] text-foreground-muted">
            گزارش‌دهنده: {report.customerName}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Badge variant="error">{salonReportReasonLabel(report.reason)}</Badge>
          <Badge variant={salonReportStatusVariant(report.status)}>
            {salonReportStatusLabel(report.status)}
          </Badge>
        </div>
      </div>

      {report.description ? (
        <p className="mt-3 text-[13px] leading-6 text-foreground">{report.description}</p>
      ) : null}

      <div className="mt-3">
        {mode === "resolve" || mode === "dismiss" ? (
          <div className="flex flex-col gap-2">
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="یادداشت ادمین (اختیاری)"
              className="min-h-16"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={mode === "resolve" ? "destructive" : "default"}
                isLoading={isPending}
                onClick={handleConfirm}
              >
                {mode === "resolve" ? "ثبت تایید تخلف" : "ثبت رد گزارش"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() => setMode("idle")}
              >
                انصراف
              </Button>
            </div>
          </div>
        ) : report.status === SalonReportStatus.Pending ? (
          <Button size="sm" isLoading={isInvestigating} onClick={() => investigate(report.id)}>
            شروع بررسی
          </Button>
        ) : report.status === SalonReportStatus.Investigating ? (
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={() => setMode("resolve")}>
              تایید تخلف و بستن
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setMode("dismiss")}>
              رد گزارش
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
