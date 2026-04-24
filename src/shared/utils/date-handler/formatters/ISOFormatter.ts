import {IDateFormatter} from "@/shared/utils/date-handler/interfaces/date-formatter.interface";

/**
 * A strategy to format dates into ISO 8601 strings (e.g., "2025-09-20T18:39:12.345Z").
 */
export class ISOFormatter implements IDateFormatter {
    public format(date: Date): string {
        return date.toISOString();
    }
}