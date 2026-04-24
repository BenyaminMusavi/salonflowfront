import { TIconCurrency } from "@/shared/utils/currency/icons/IconCurrencyType";
import { ICurrencyFormatter } from "@/shared/utils/currency/Currency";
import { Currency as CurrencyUtil } from "@/shared/utils/currency/Currency";
import { cn } from "@/shared/utils/className";
export interface ICurrencyProps {
  amount: number;
  amountStyle?: string;
  currencyStyle?: TIconCurrency;
  currencyContainerStyle?: string;
  formatter?: ICurrencyFormatter;
  locale?: string;
  currencyCode?: string;
}

const Currency = (props: ICurrencyProps) => {
  const {amount, amountStyle, currencyStyle, currencyContainerStyle, formatter, locale, currencyCode} = props;
  const finalAmount = new CurrencyUtil({
    amount,
    formatter,
    locale,
    currencyCode,
  });
  const IconCurrency = finalAmount.format().symbol().icon;
  return (
    <p className={cn('flex flex-row flex-wrap items-center justify-center gap-1', currencyContainerStyle)}>
      <span className={cn('', amountStyle)}>{finalAmount.format().formatedAmount}</span>
      <IconCurrency {...currencyStyle} />
    </p>
  );
};

export default Currency;
