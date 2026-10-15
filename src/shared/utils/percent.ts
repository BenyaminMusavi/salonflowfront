/**
 * «50٪» for RTL text with Latin digits. Left alone, the sign glues to the digits into one
 * left-to-right run and ends up on the wrong side («٪» read before the number). A right-to-left
 * mark between them keeps the Persian order: the sign sits after the number in reading order.
 */
export function formatPercent(value: number | string): string {
  return `${value}‏٪`;
}
