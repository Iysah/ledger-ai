import { useSettingsStore } from '../store/settingsStore';


/**
 * Format currency amount
 * Uses manual formatting to ensure the symbol is always used instead of the ISO code
 */
export const formatCurrency = (amount: number): string => {
  const { currency } = useSettingsStore.getState();
  
  // Format the number part first
  const numberPart = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  // Combine symbol and formatted number
  // e.g., "₦ 1,234.56"
  return `${currency.symbol} ${numberPart}`;
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export const formatDateISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
