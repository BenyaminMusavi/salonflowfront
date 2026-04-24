import {IDateFormatter} from "@/shared/utils/date-handler/interfaces/date-formatter.interface";

/**
 * A strategy to format dates into a human-readable Jalali format.
 * e.g., "۳۰ شهریور ۱۴۰۴"
 */
export class JalaliFriendlyFormatter implements IDateFormatter {
    public format(date: Date): string {
        const formatter = new Intl.DateTimeFormat('fa-IR', {
            calendar: 'persian',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return formatter.format(date);
    }
}