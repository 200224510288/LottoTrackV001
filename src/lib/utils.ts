// lib/utils.ts

/**
 * Formats a number as currency in Sri Lankan Rupees
 * @param amount The number to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
    return `Rs. ${amount.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    })}`;
  }
  
  /**
   * Formats a date in a human-readable format
   * @param dateString The date string to format
   * @returns Formatted date string
   */
  export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }