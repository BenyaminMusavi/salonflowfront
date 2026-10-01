import { SalonRoleName } from "@/services/common/enums/domain-enums";

/** Persian label for a salon membership role — never show the raw `SalonOwner` / `Staff` value. */
export function salonRoleLabel(roleName: string | null | undefined): string {
  if (roleName === SalonRoleName.SalonOwner) return "سالن‌دار";
  if (roleName === SalonRoleName.Staff) return "پرسنل";
  return "";
}
