import {IDateFormatter} from "@/shared/utils/date-handler/interfaces/date-formatter.interface";
import { APP_LOCALE } from "@/shared/utils/locale";
import { SALON_TIME_ZONE } from "@/shared/utils/salonTime";

/**
 * A strategy to format dates into a numeric Jalali format.
 * e.g., "۱۴۰۴/۰۶/۳۰"
 */
export class JalaliNumericFormatter implements IDateFormatter {
    public format(date: Date): string {
        const formatter = new Intl.DateTimeFormat(APP_LOCALE, {
            calendar: 'persian',
            timeZone: SALON_TIME_ZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

        // We use formatToParts to ensure the separator is always '/'
        const parts = formatter.formatToParts(date);
        const year = parts.find(p => p.type === 'year')?.value;
        const month = parts.find(p => p.type === 'month')?.value;
        const day = parts.find(p => p.type === 'day')?.value;

        return `${year}/${month}/${day}`;
    }
}