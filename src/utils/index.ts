import { format } from 'date-fns';

export const formatCurrency = (amount: number, currency = 'NGN'): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  return format(new Date(dateStr), 'MMM d, yyyy');
};

export const formatDateTime = (dateStr: string): string => {
  return format(new Date(dateStr), 'MMM d, yyyy · h:mm a');
};

export const generateReference = (): string => {
  return 'VB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
};

export const generateAccountNumber = (): string => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

export const maskAccountNumber = (accountNumber: string): string => {
  return '••••' + accountNumber.slice(-4);
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
