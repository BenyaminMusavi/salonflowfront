import { MapPinIcon, StarIcon } from "@phosphor-icons/react";

export default function SalonsDetailInfo() {
  return (
    <div className="px-safe-area mt-5">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">آرایشگاه کلاسیک کات</h1>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-foreground/10 px-3 py-1.5">
          <StarIcon size={16} className="text-orange-400" weight="fill" />
          <span className="text-sm font-medium text-white">۵</span>
          <span className="text-xs text-foreground-muted">(۲k+)</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <MapPinIcon size={16} className="text-foreground-muted" />
        <span className="text-sm text-foreground-muted">تهران، فلاح، خیابان آزادی</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <span className="text-xl font-bold text-white">۵۵۰,۰۰۰ تومان</span>
        <span className="text-sm text-foreground-muted">تا ۳۰٪ تخفیف</span>
      </div>
    </div>
  );
}
