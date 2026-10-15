import { StarIcon } from "@phosphor-icons/react";

interface RatingValueProps {
  /** `null` / undefined = no approved review yet — never shown as 0. */
  rating?: number | null;
  reviewCount?: number | null;
  iconSize?: number;
  iconClassName?: string;
  textClassName?: string;
}

/** Salon rating: star + value, or the plain text «بدون امتیاز» (no star) when there is none. */
export default function RatingValue({
  rating,
  reviewCount,
  iconSize = 12,
  iconClassName = "text-rating",
  textClassName = "",
}: RatingValueProps) {
  if (rating == null) {
    return <span className={textClassName}>بدون امتیاز</span>;
  }
  return (
    <>
      <StarIcon size={iconSize} weight="fill" className={iconClassName} />
      <span className={textClassName}>
        {rating.toFixed(1)}
        {reviewCount ? ` (${reviewCount})` : ""}
      </span>
    </>
  );
}
