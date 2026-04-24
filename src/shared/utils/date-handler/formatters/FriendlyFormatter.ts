import {IDateFormatter} from "@/shared/utils/date-handler/interfaces/date-formatter.interface";

/**
 * A strategy to format dates into a human-readable format (e.g., "September 20, 2025").
 */
export class FriendlyFormatter implements IDateFormatter {
    public format(date: Date): string {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
}