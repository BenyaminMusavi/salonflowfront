import {IDateFormatter} from "@/shared/utils/date-handler/interfaces/date-formatter.interface";

/**
 * A strategy to format dates into a relative time format (e.g., "2 days ago", "in 3 weeks").
 */
export class RelativeTimeFormatter implements IDateFormatter {
    public format(date: Date): string {
        const now = new Date();
        const diffInSeconds = (date.getTime() - now.getTime()) / 1000;
        const diffInDays = diffInSeconds / (60 * 60 * 24);

        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

        if (Math.abs(diffInDays) > 30) {
            return rtf.format(Math.round(diffInDays / 30), 'month');
        }
        if (Math.abs(diffInDays) > 1) {
            return rtf.format(Math.round(diffInDays), 'day');
        }
        return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
    }
}