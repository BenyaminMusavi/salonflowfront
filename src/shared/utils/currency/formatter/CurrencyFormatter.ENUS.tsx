
import {ICurrencyFormat, ICurrencyFormatter} from '@/shared/utils/currency/Currency';
import {TIconCurrency} from '@/shared/utils/currency/icons/IconCurrencyType';
import {separator} from '@/shared/utils/seperator';

// Concrete currency formatter for the 'en-US' locale
export default class CurrencyFormatterENUS implements ICurrencyFormatter {
  public format(amount: number): ICurrencyFormat {
    const numberWithCommas = separator({
      value: amount.toString(),
      separatorChar: ',',
      groupSize: 3,
    });
    return {
      amount: amount,
      formatedAmount: numberWithCommas,
      currencyCode: "USD",
      symbol: () => {
        return {
          icon: (props: TIconCurrency) => <span>$</span>,
          title: "Dollar",
        }
      },
    }
  }
}