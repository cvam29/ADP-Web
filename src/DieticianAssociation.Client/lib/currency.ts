/**
 * Currency formatting utilities for Indian Rupees (INR)
 */

import { LOCALE_CONFIG, formatIndianCurrency, formatIndianNumber } from './locale';

export const formatCurrency = (amount: number): string => {
  return formatIndianCurrency(amount);
};

export const formatPrice = (amount: number): string => {
  return formatCurrency(amount);
};

export const formatNumber = (num: number): string => {
  return formatIndianNumber(num);
};

export const CURRENCY_SYMBOL = LOCALE_CONFIG.currency.symbol;
export const CURRENCY_CODE = LOCALE_CONFIG.currency.code;
export const LOCALE = LOCALE_CONFIG.locale;
