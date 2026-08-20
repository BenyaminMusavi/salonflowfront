import {cva, VariantProps} from 'class-variance-authority';

export const iconCurrencyVariants = cva('text-foreground-inverse', {
  variants: {
    weight: {
      bold: 'font-bold',
      medium: 'font-medium',
      normal: 'font-normal ',
      semiBold: 'font-semibold',
    },
    size: {
      xs: 'size-3',
      sm: 'size-4',
      md: 'size-5',
      lg: 'size-6',
    },
  },
  defaultVariants: {
    weight: 'medium',
    size: 'md',
  },
});

export type TIconCurrency = VariantProps<typeof iconCurrencyVariants> & {className?: string};
