import { DateHandler } from "./DateHandler";

/**
 * A builder for creating DateHandler instances in a fluent and readable way.
 * (Builder and Factory Patterns)
 */
export class DateBuilder {
    private _date: Date;

    constructor(baseDate: Date | string | number = new Date()) {
        this._date = new Date(baseDate);
    }

    public static now(): DateBuilder {
        return new DateBuilder();
    }

    public static fromISO(isoString: string): DateBuilder {
        return new DateBuilder(isoString);
    }

    public addDays(days: number): this {
        this._date.setDate(this._date.getDate() + days);
        return this;
    }

    public setYear(year: number): this {
        this._date.setFullYear(year);
        return this;
    }

    public build(): DateHandler {
        return new DateHandler(this._date);
    }
}