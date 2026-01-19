// src/utils/formatters.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Dubai'
  }).format(d);
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dubai'
  }).format(d);
};

export const formatDateTimeGMT4 = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const gmt4Date = new Date(d.getTime() + (4 * 60 * 60 * 1000));
  
  return `${gmt4Date.getDate().toString().padStart(2, '0')}/${
    (gmt4Date.getMonth() + 1).toString().padStart(2, '0')}/${
    gmt4Date.getFullYear()} ${
    gmt4Date.getHours().toString().padStart(2, '0')}:${
    gmt4Date.getMinutes().toString().padStart(2, '0')}`;
};

export const formatTimeGMT4 = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const gmt4Date = new Date(d.getTime() + (4 * 60 * 60 * 1000));
  
  return `${gmt4Date.getHours().toString().padStart(2, '0')}:${
    gmt4Date.getMinutes().toString().padStart(2, '0')}`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};