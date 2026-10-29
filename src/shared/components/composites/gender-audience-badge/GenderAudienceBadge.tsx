import { GenderFemaleIcon, GenderIntersexIcon, GenderMaleIcon } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import { getGenderAudience } from "@/shared/utils/genderAudience";

const ICONS = {
  female: GenderFemaleIcon,
  male: GenderMaleIcon,
  mixed: GenderIntersexIcon,
} as const;

interface GenderAudienceBadgeProps {
  /** Real branch audience: 1 men, 2 women, 3 mixed. */
  audience: number | null | undefined;
  className?: string;
}

/** Icon + text, so the audience is readable without relying on colour. Renders nothing when unknown. */
export default function GenderAudienceBadge({ audience, className }: GenderAudienceBadgeProps) {
  const meta = getGenderAudience(audience);
  if (meta.key === "unknown") return null;
  const Icon = ICONS[meta.key];

  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold", className)}>
      <Icon size={13} weight="bold" aria-hidden />
      {meta.label}
    </span>
  );
}
