import { SalonReportReason, SalonReportStatus } from "@/services/common/enums/domain-enums";
import { BadgeProps } from "@/shared/components/primitives/badge/Badge";

export function salonReportReasonLabel(reason: SalonReportReason): string {
  switch (reason) {
    case SalonReportReason.Misconduct:
      return "رفتار نامناسب";
    case SalonReportReason.Scam:
      return "کلاهبرداری";
    case SalonReportReason.Inappropriate:
      return "محتوای نامناسب";
    case SalonReportReason.Other:
      return "سایر موارد";
    default:
      return "نامشخص";
  }
}

export function salonReportStatusLabel(status: SalonReportStatus): string {
  switch (status) {
    case SalonReportStatus.Pending:
      return "در انتظار بررسی";
    case SalonReportStatus.Investigating:
      return "در حال بررسی";
    case SalonReportStatus.Resolved:
      return "تایید و بسته‌شده";
    case SalonReportStatus.Dismissed:
      return "ردشده";
    default:
      return "نامشخص";
  }
}

export function salonReportStatusVariant(
  status: SalonReportStatus
): NonNullable<BadgeProps["variant"]> {
  switch (status) {
    case SalonReportStatus.Pending:
      return "warning";
    case SalonReportStatus.Investigating:
      return "brand";
    case SalonReportStatus.Resolved:
      return "error";
    case SalonReportStatus.Dismissed:
      return "default";
    default:
      return "default";
  }
}
