import {
  BroomIcon,
  CrownIcon,
  CrownSimpleIcon,
  DropIcon,
  EyeIcon,
  FeatherIcon,
  FireIcon,
  FlowerIcon,
  FlowerLotusIcon,
  FootprintsIcon,
  HandIcon,
  HeartIcon,
  LeafIcon,
  LightningIcon,
  MagicWandIcon,
  NeedleIcon,
  PaintBrushBroadIcon,
  PaintBrushIcon,
  PaletteIcon,
  PencilCircleIcon,
  PencilLineIcon,
  PencilRulerIcon,
  PencilSimpleLineIcon,
  RainbowIcon,
  ScissorsIcon,
  SparkleIcon,
  StarIcon,
  SyringeIcon,
  BandaidsIcon,
  WavesIcon,
  WindIcon,
  type Icon,
} from "@phosphor-icons/react";

/**
 * نگاشت نام دقیق انواع خدمات (seed شده در بک‌اند) به آیکون Phosphor متناظر.
 * کلید، نام فارسی ServiceType است — چون شناسه‌ی واقعی برگشتی از API یک Guid است،
 * نه عدد پایدار، و نام همان چیزی است که همیشه در دسترس و پایدار می‌ماند.
 */
export const SERVICE_TYPE_ICONS: Record<string, Icon> = {
  "کوتاهی مو": ScissorsIcon,
  "رنگ مو": PaintBrushIcon,
  "ترمیم ناخن": BandaidsIcon,
  میکاپ: PaletteIcon,
  مانیکور: HandIcon,
  پدیکور: FootprintsIcon,
  "کاشت ناخن": MagicWandIcon,
  "لاک ژل": DropIcon,
  "اکستنشن مژه": EyeIcon,
  "لمینت مژه": SparkleIcon,
  "میکروبلیدینگ ابرو": PencilLineIcon,
  "اصلاح ابرو": PencilSimpleLineIcon,
  "کاشت ابرو": NeedleIcon,
  "کراتینه مو": FireIcon,
  "بوتاکس مو": SyringeIcon,
  "اکستنشن مو": FeatherIcon,
  "هایلایت و بلیاژ": RainbowIcon,
  اپیلاسیون: BroomIcon,
  "لیزر موهای زائد": LightningIcon,
  "پاکسازی پوست": LeafIcon,
  "ماسک صورت": FlowerIcon,
  "میکرودرم‌ابریژن": StarIcon,
  "اصلاح صورت با بند": FlowerLotusIcon,
  "آرایش عروس": CrownIcon,
  شینیون: CrownSimpleIcon,
  "ماساژ صورت": HeartIcon,
  "تاتو لب و ابرو": PencilCircleIcon,
  "اصلاح سر و صورت آقایان": WindIcon,
  "اصلاح ریش": ScissorsIcon,
  "پیرایش فید (طرح مو)": PencilRulerIcon,
  "رنگ ریش": PaintBrushBroadIcon,
  "ماساژ سر و گردن": WavesIcon,
};

/** آیکون پیش‌فرض برای هر نوع خدمتی که سالن خودش دستی اضافه کرده و توی لیست بالا نیست. */
export const DEFAULT_SERVICE_TYPE_ICON: Icon = SparkleIcon;

export function getServiceTypeIcon(name: string): Icon {
  return SERVICE_TYPE_ICONS[name] ?? DEFAULT_SERVICE_TYPE_ICON;
}
