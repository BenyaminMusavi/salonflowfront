/**
 * Interface representing the parameters for the separator function.
 */
export interface ISeparator {
  /**
   * The numeric value as a string to be formatted with separators.
   */
  value: string;

  /**
   * The size of groups (number of digits) to separate in the integer part.
   */
  groupSize: number;

  /**
   * The character to use as a separator between groups (e.g., ',' for thousands).
   */
  separatorChar: string;
}

/**
 * Formats a numeric string by inserting a separator character at specified intervals,
 * but only for the integer part. The decimal part (if any) is left unformatted.
 *
 * @param {ISeparator} params - The input parameters.
 * @param {string} params.value - The numeric value (as a string) to format.
 * @param {number} params.groupSize - The size of the groups to separate (e.g., 3 for thousands).
 * @param {string} params.separatorChar - The character to use as a separator (e.g., ',' or '.').
 *
 * @returns {string} The formatted number with separators in the integer part only.
 *
 * @example
 * // Formats '1234567.89' as '1,234,567.89' (using ',' as the separator for groups of 3)
 * separator({value: '1234567.89', groupSize: 3, separatorChar: ','});
 */
export function separator({value, groupSize, separatorChar}: ISeparator): string {
  // Determine if the value is negative
  const isNegative = value.startsWith('-');

  // Split the value into integer and decimal parts
  const [integerPart, decimalPart] = isNegative ? value.slice(1).split('.') : value.split('.');

  /**
   * Formats the integer part of the number by adding the separator.
   *
   * @param {string} part - The integer part of the number to format.
   *
   * @returns {string} The formatted integer part.
   */
  const formatIntegerPart = (part: string): string => {
    let formattedPart = '';
    const length = part.length;
    let groupCounter = 0;

    // Format the integer part from right to left
    for (let i = length - 1; i >= 0; i--) {
      formattedPart = part[i] + formattedPart;
      groupCounter++;
      if (groupCounter % groupSize === 0 && i !== 0) {
        formattedPart = separatorChar + formattedPart;
      }
    }

    return formattedPart;
  };

  // Format the integer part
  const formattedInteger = formatIntegerPart(integerPart);

  // Add the negative sign if applicable and return the formatted value with the unformatted decimal part (if present)
  const sign = isNegative ? '-' : '';
  return decimalPart ? `${sign}${formattedInteger}.${decimalPart}` : `${sign}${formattedInteger}`;
}
