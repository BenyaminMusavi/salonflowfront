
import {ICurrencyFormat, ICurrencyFormatter} from '@/shared/utils/currency/Currency';
import {TIconCurrency} from '@/shared/utils/currency/icons/IconCurrencyType';
import {separator} from '@/shared/utils/seperator';

// Custom formatter for the "fa-IR" locale
export default class CurrencyFormatterFAIR implements ICurrencyFormatter {
  public format(amount: number): ICurrencyFormat {
    const numberWithCommas = separator({
      value: amount.toString(),
      separatorChar: ',',
      groupSize: 3,
    });
    return {
      amount: amount,
      formatedAmount: numberWithCommas,
      currencyCode: "IRR",
      symbol: () => {
        return {
          icon: (props: TIconCurrency) => <span>ریال</span>,
          title: "ریال",
        }
      },
    }
  }
}