import {
  ArmchairIcon,
  BabyIcon,
  CheckCircleIcon,
  CoffeeIcon,
  CookieIcon,
  CreditCardIcon,
  DropIcon,
  FanIcon,
  LetterCirclePIcon,
  TelevisionSimpleIcon,
  ThermometerSimpleIcon,
  ToiletIcon,
  WheelchairIcon,
  WifiHighIcon,
  type Icon,
} from "@phosphor-icons/react";

/**
 * نگاشت کلید پایدار امکان (Amenity.Key در بک‌اند) به آیکون Phosphor. همه با یک اندازه و وزن رندر می‌شوند
 * (AmenityIcon) تا ظاهرشان یکدست باشد؛ امکان تازه‌ای که اینجا نیست آیکون پیش‌فرض می‌گیرد و صفحه نمی‌شکند.
 */
export const AMENITY_ICONS: Record<string, Icon> = {
  water_cooler: DropIcon,
  cafe_bar: CoffeeIcon,
  free_refreshments: CookieIcon,
  free_wifi: WifiHighIcon,
  waiting_area: ArmchairIcon,
  tv: TelevisionSimpleIcon,
  air_conditioning: FanIcon,
  heating_cooling: ThermometerSimpleIcon,
  parking: LetterCirclePIcon,
  restroom: ToiletIcon,
  wheelchair_access: WheelchairIcon,
  kids_friendly: BabyIcon,
  card_payment: CreditCardIcon,
};

export const DEFAULT_AMENITY_ICON: Icon = CheckCircleIcon;

export function getAmenityIcon(key: string): Icon {
  return AMENITY_ICONS[key] ?? DEFAULT_AMENITY_ICON;
}
