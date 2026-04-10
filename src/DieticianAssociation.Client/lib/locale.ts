/**
 * Localization configuration for India
 */

export const LOCALE_CONFIG = {
  // Primary locale
  locale: 'en-IN',
  
  // Currency settings
  currency: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
  },
  
  // Date/time settings
  timezone: 'Asia/Kolkata',
  
  // Number formatting
  numberFormat: {
    locale: 'en-IN',
    options: {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }
  },
  
  // Currency formatting  
  currencyFormat: {
    locale: 'en-IN',
    options: {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  }
} as const;

// Helper functions using the config
export const formatIndianCurrency = (amount: number): string => {
  return new Intl.NumberFormat(
    LOCALE_CONFIG.currencyFormat.locale, 
    LOCALE_CONFIG.currencyFormat.options
  ).format(amount);
};

export const formatIndianNumber = (num: number): string => {
  return new Intl.NumberFormat(
    LOCALE_CONFIG.numberFormat.locale,
    LOCALE_CONFIG.numberFormat.options
  ).format(num);
};

export const formatIndianDate = (date: Date): string => {
  return new Intl.DateTimeFormat(LOCALE_CONFIG.locale, {
    timeZone: LOCALE_CONFIG.timezone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const formatIndianDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat(LOCALE_CONFIG.locale, {
    timeZone: LOCALE_CONFIG.timezone,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};
