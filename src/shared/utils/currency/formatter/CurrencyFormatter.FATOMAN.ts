import IconCurrencyToman from '@/shared/utils/currency/icons/toman/IconCurrency.toman';
import {ICurrencyFormat, ICurrencyFormatter} from '@/shared/utils/currency/Currency';
import {separator} from '@/shared/utils/seperator';
import {TIconCurrency} from '@/shared/utils/currency/icons/IconCurrencyType';

export default class CurrencyFormatterFATOMAN implements ICurrencyFormatter {
  public format(amount: number): ICurrencyFormat {
    const tomanAmount = Math.ceil(amount / 10); // Convert Rial to Toman
    const numberWithCommas = separator({
      value: tomanAmount.toString(),
      separatorChar: ',',
      groupSize: 3,
    });
    return {
      amount: tomanAmount,
      formatedAmount: numberWithCommas,
      currencyCode: 'TOMAN',
      symbol: () => {
        return {
          icon: (props: TIconCurrency) => IconCurrencyToman({...props}),
          title: 'تومان',
        };
      },
    };
  }
}
