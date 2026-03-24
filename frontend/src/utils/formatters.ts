import { format, parseISO, differenceInDays } from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy, HH:mm');
}

export function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export function formatNumber(value: number): string {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString('en-IN');
}

export function daysToExpiry(expiryDate: string): number {
  return differenceInDays(parseISO(expiryDate), new Date());
}

export function expiryStatus(days: number): 'critical' | 'warning' | 'ok' {
  if (days <= 30) return 'critical';
  if (days <= 60) return 'warning';
  return 'ok';
}
