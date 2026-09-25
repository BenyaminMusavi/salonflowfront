import {IDateFormatter} from "@/shared/utils/date-handler/interfaces/date-formatter.interface";
import { APP_LOCALE } from "@/shared/utils/locale";
import { SALON_TIME_ZONE } from "@/shared/utils/salonTime";

/**
 * A strategy to format dates into a human-readable Jalali format.
 * e.g., "۳۰ شهریور ۱۴۰۴"
 */
export class JalaliFriendlyFormatter implements IDateFormatter {
    public format(date: Date): string {
        const formatter = new Intl.DateTimeFormat(APP_LOCALE, {
            calendar: 'persian',
            timeZone: SALON_TIME_ZONE,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return formatter.format(date);
    }
}