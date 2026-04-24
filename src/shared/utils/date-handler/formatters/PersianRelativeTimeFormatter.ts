import {IDateFormatter} from "@/shared/utils/date-handler/interfaces/date-formatter.interface";

/**
 * A strategy to format dates into a relative time format in Persian.
 * e.g., "۳ روز پیش", "ماه آینده"
 */
export class PersianRelativeTimeFormatter implements IDateFormatter {
    public format(date: Date): string {
        const now = new Date();
        const diffInSeconds = (date.getTime() - now.getTime()) / 1000;
        const diffInDays = diffInSeconds / (60 * 60 * 24);

        // The only change needed is the locale: 'fa-IR'
        const rtf = new Intl.RelativeTimeFormat('fa-IR', { numeric: 'auto' });

        if (Math.abs(diffInDays) > 365) {
            return rtf.format(Math.round(diffInDays / 365), 'year');
        }
        if (Math.abs(diffInDays) > 30) {
            return rtf.format(Math.round(diffInDays / 30), 'month');
        }
        if (Math.abs(diffInDays) > 1) {
            return rtf.format(Math.round(diffInDays), 'day');
        }
        if (Math.abs(diffInSeconds) > 3600) {
            return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
        }
        return rtf.format(Math.round(diffInSeconds / 60), 'minute');
    }
}