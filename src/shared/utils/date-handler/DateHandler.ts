import {IDateFormatter} from "@/shared/utils/date-handler/interfaces/date-formatter.interface";

/**
 * An immutable class providing a clean API for date manipulation.
 * (Facade Pattern, Single Responsibility Principle)
 */
export class DateHandler {
    private readonly _date: Date;

    // Private constructor to enforce creation via the builder.
    constructor(date: Date) {
        this._date = new Date(date.getTime());
    }

    /**
     * Formats the date using a provided strategy.
     * @param formatter An object that implements IDateFormatter.
     */
    public format(formatter: IDateFormatter): string {
        return formatter.format(this._date);
    }

    /**
     * Returns a new DateHandler instance with the added days.
     */
    public addDays(days: number): DateHandler {
        const newDate = new Date(this._date.getTime());
        newDate.setDate(newDate.getDate() + days);
        return new DateHandler(newDate);
    }

    /**
     * Returns a new DateHandler instance with the subtracted months.
     */
    public subtractMonths(months: number): DateHandler {
        const newDate = new Date(this._date.getTime());
        newDate.setMonth(newDate.getMonth() - months);
        return new DateHandler(newDate);
    }

    public isBefore(other: DateHandler): boolean {
        return this._date < other.nativeDate;
    }

    public isAfter(other: DateHandler): boolean {
        return this._date > other.nativeDate;
    }

    /**
     * Provides access to the native Date object.
     */
    public get nativeDate(): Date {
        return new Date(this._date.getTime());
    }
}