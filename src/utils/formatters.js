// src/utils/formatters.js

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} locale - The locale to use (default: 'en-US')
 * @param {string} currency - The currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, locale = 'en-US', currency = 'USD') => {
    if (amount === null || amount === undefined) return '-';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  /**
   * Format a date string
   * @param {string|Date} dateString - Date string or Date object to format
   * @param {object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted date string
   */
  export const formatDate = (dateString, options = {}) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '-';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return new Intl.DateTimeFormat('en-US', mergedOptions).format(date);
  };
  
  /**
   * Format a date and time string
   * @param {string|Date} dateString - Date string or Date object to format
   * @returns {string} Formatted date and time string
   */
  export const formatDateTime = (dateString)