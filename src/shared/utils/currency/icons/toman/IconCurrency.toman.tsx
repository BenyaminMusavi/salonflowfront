import IconTomanMedium from './IconCurrency.tomanMedium.svg';
import IconTomanBold from './IconCurrency.tomanBold.svg';
import React from 'react';
import {iconCurrencyVariants, TIconCurrency} from '../IconCurrencyType';
import { cn } from "@/shared/utils/className";

const IconCurrencyToman = ({weight, size, className}: TIconCurrency) => {
  if (weight === 'bold') return <IconTomanBold className={cn(iconCurrencyVariants({weight, size}), className)} />;
  return <IconTomanMedium className={cn(iconCurrencyVariants({weight, size}), className)} />;
};

export default IconCurrencyToman;
