import { SalonApprovalStatus, TrustStatus } from "@/services/common/enums/domain-enums";
import { BadgeProps } from "@/shared/components/primitives/badge/Badge";
import { formatSalonDate } from "@/shared/utils/salonTime";

export function salonApprovalStatusLabel(status: SalonApprovalStatus): string {
  switch (status) {
    case SalonApprovalStatus.Pending:
      return "در انتظار تایید";
    case SalonApprovalStatus.Approved:
      return "تاییدشده";
    case SalonApprovalStatus.Rejected:
      return "ردشده";
    case SalonApprovalStatus.Draft:
      return "پیش‌نویس";
    default:
      return "نامشخص";
  }
}

export function salonApprovalStatusVariant(
  status: SalonApprovalStatus
): NonNullable<BadgeProps["variant"]> {
  switch (status) {
    case SalonApprovalStatus.Approved:
      return "success";
    case SalonApprovalStatus.Rejected:
      return "error";
    case SalonApprovalStatus.Pending:
      return "warning";
    default:
      return "default";
  }
}

export function trustStatusLabel(status: TrustStatus): string {
  switch (status) {
    case TrustStatus.Active:
      return "فعال";
    case TrustStatus.UnderReview:
      return "در حال بررسی";
    case TrustStatus.Suspended:
      return "معلق";
    default:
      return "نامشخص";
  }
}

export function trustStatusVariant(
  status: TrustStatus
): NonNullable<BadgeProps["variant"]> {
  switch (status) {
    case TrustStatus.Active:
      return "success";
    case TrustStatus.Suspended:
      return "error";
    case TrustStatus.UnderReview:
      return "warning";
    default:
      return "default";
  }
}

export function formatAdminDate(iso: string): string {
  try {
    return formatSalonDate(iso, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
