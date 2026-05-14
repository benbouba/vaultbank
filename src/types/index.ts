export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  accountNumber: string;
  bvn?: string;
  kycVerified: boolean;
  createdAt: string;
}

export interface Account {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  accountNumber: string;
  accountType: 'savings' | 'current';
}

export type TransactionType =
  | 'transfer'
  | 'airtime'
  | 'data'
  | 'electricity'
  | 'deposit'
  | 'withdrawal'
  | 'cable_tv'
  | 'education';

export type TransactionStatus = 'success' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  recipient?: string;
  recipientBank?: string;
  reference: string;
  date: string;
  icon?: string;
}

export interface BankBeneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
  type: 'transaction' | 'promo' | 'security' | 'system';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  emoji: string;
}
