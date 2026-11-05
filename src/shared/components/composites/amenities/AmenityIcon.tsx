import type { IconWeight } from "@phosphor-icons/react";
import { getAmenityIcon } from "@/shared/data/amenityIcons";
import { cn } from "@/shared/utils/className";

interface AmenityIconProps {
  amenityKey: string;
  size?: number;
  /** Same weight for every amenity in one place, so the set looks uniform. */
  weight?: IconWeight;
  className?: string;
}

/** One amenity icon (Phosphor, from the key). Decorative: the title is always shown or read next to it. */
export default function AmenityIcon({ amenityKey, size = 18, weight = "regular", className }: AmenityIconProps) {
  const Icon = getAmenityIcon(amenityKey);
  return <Icon size={size} weight={weight} aria-hidden className={cn("shrink-0", className)} />;
}
