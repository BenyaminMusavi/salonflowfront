import CurrencyFormatterFATOMAN from '@/shared/utils/currency/formatter/CurrencyFormatter.FATOMAN';
import { TIconCurrency } from '@/shared/utils/currency/icons/IconCurrencyType';
import { FC } from 'react';

/**
 * Interface for the formatted currency object.
 */
export interface ICurrencyFormat {
  /** The numeric amount of the currency. */
  amount: number;

  /** The formatted string representation of the currency with commas. */
  formatedAmount: string;

  /** The currency code (e.g., 'USD', 'TOMAN'). */
  currencyCode: string;

  /**
   * A function that returns an object containing the currency symbol title and icon.
   *
   * @param iconClassname - Optional classname to apply to the icon.
   * @param iconWeight - Optional weight of the icon, default is 'medium'.
   * @param iconSize - Optional size of the icon, default is 'md'.
   *
   * @returns An object with the title and an icon component.
   */
  symbol: (
    iconClassname?: string,
    iconWeight?: 'bold' | 'medium' | 'normal' | 'semiBold',
    iconSize?: 'xs' | 'sm' | 'md' | 'lg'
  ) => {
    title: string;
    icon: FC<TIconCurrency>;
  };
}

/**
 * Interface for currency formatters.
 * Responsible for formatting an amount of currency.
 */
export interface ICurrencyFormatter {
  /**
   * Formats the given amount of currency.
   *
   * @param amount - The numeric amount to be formatted.
   *
   * @returns An object that conforms to ICurrencyFormat.
   */
  format(amount: number): ICurrencyFormat;
}

/**
 * Interface for initializing the Currency class.
 */
export interface ICurrency {
  /** The numeric amount of the currency. */
  amount: number;

  /** Optional currency code (default is 'TOMAN'). */
  currencyCode?: string;

  /** Optional locale string for formatting (default is 'fa-IR'). */
  locale?: string;

  /** Optional custom formatter for currency formatting. */
  formatter?: ICurrencyFormatter;
}

/**
 * The Currency class provides functionality to handle currency values, formatting,
 * and conversions between different currencies.
 */
export class Currency {
  private amount: number;
  private currencyCode: string;
  private locale: string;
  private readonly formatter: ICurrencyFormatter;

  /**
   * Constructs a new Currency instance.
   *
   * @param {ICurrency} param - The parameters for the currency instance.
   * @param {number} param.amount - The amount of currency.
   * @param {string} [param.currencyCode] - The currency code (default is 'TOMAN').
   * @param {string} [param.locale] - The locale for formatting (default is 'fa-IR').
   * @param {ICurrencyFormatter} [param.formatter] - The custom currency formatter (default is `CurrencyFormatterFATOMAN`).
   */
  constructor({ amount, locale, formatter, currencyCode }: ICurrency) {
    this.amount = amount;
    this.currencyCode = currencyCode || 'TOMAN';
    this.locale = locale || 'fa-IR';
    this.formatter = formatter || new CurrencyFormatterFATOMAN();
  }

  /**
   * Formats the current currency amount based on the provided formatter.
   *
   * @returns {ICurrencyFormat} The formatted currency object.
   */
  public format(): ICurrencyFormat {
    return this.formatter.format(this.amount);
  }

  /**
   * Sets a new amount for the currency.
   *
   * @param {number} amount - The new currency amount.
   */
  public setAmount(amount: number): void {
    this.amount = amount;
  }

  /**
   * Retrieves the current amount of the currency.
   *
   * @returns {number} The current amount.
   */
  public getAmount(): number {
    return this.format().amount;
  }

  /**
   * Sets a new currency code (e.g., 'USD', 'IRR').
   *
   * @param {string} currencyCode - The new currency code.
   */
  public setCurrency(currencyCode: string): void {
    this.currencyCode = currencyCode;
  }

  /**
   * Retrieves the current currency code.
   *
   * @returns {string} The currency code.
   */
  public getCurrency(): string {
    return this.currencyCode;
  }

  /**
   * Sets a new locale for formatting (e.g., 'en-US', 'fa-IR').
   *
   * @param {string} locale - The new locale.
   */
  public setLocale(locale: string): void {
    this.locale = locale;
  }

  /**
   * Retrieves the current locale for formatting.
   *
   * @returns {string} The locale string.
   */
  public getLocale(): string {
    return this.locale;
  }

  /**
   * Converts the current currency to a different currency using a conversion rate.
   *
   * @param {string} currencyCode - The new currency code.
   * @param {number} conversionRate - The conversion rate to apply.
   *
   * @returns {Currency} A new `Currency` object with the converted amount and currency code.
   */
  public convertTo(currencyCode: string, conversionRate: number): Currency {
    const convertedAmount = this.amount * conversionRate;
    return new Currency({
      amount: convertedAmount,
      currencyCode,
      locale: this.locale,
      formatter: this.formatter,
    });
  }

  /**
   * Adds an amount to the current currency value.
   *
   * @param {number} amount - The amount to add.
   *
   * @returns {Currency} The updated `Currency` instance.
   */
  public add(amount: number): Currency {
    this.amount += amount;
    return this;
  }

  /**
   * Subtracts an amount from the current currency value.
   *
   * @param {number} amount - The amount to subtract.
   *
   * @returns {Currency} The updated `Currency` instance.
   */
  public subtract(amount: number): Currency {
    this.amount -= amount;
    return this;
  }

  /**
   * Compares two `Currency` instances to check if they are equal.
   *
   * @param {Currency} otherCurrency - The other `Currency` instance to compare with.
   *
   * @returns {boolean} True if both the amount and currency code are equal, otherwise false.
   */
  public equals(otherCurrency: Currency): boolean {
    return this.amount === otherCurrency.getAmount() && this.currencyCode === otherCurrency.getCurrency();
  }

  /**
   * Converts an amount between two different currencies.
   *
   * @param {number} amount - The amount to convert.
   * @param {number} fromRate - The rate of the source currency.
   * @param {number} toRate - The rate of the target currency.
   *
   * @returns {number} The converted amount.
   */
  public static convert(amount: number, fromRate: number, toRate: number): number {
    return (amount / fromRate) * toRate;
  }

  /**
   * Removes commas from a number string.
   *
   * @param {string} value - The number string with commas.
   *
   * @returns {string} The number string without commas.
   */
  public static parseNumberWithCommas(value: string): string {
    return value.replace(/,/g, '');
  }
}
