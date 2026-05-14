import type { Transaction, SavingsGoal, BankBeneficiary, Notification } from '../types';
import { generateReference, generateAccountNumber } from '../utils';

const REF = generateReference;

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    userId: '1',
    type: 'deposit',
    amount: 150000,
    currency: 'NGN',
    status: 'success',
    description: 'Salary Payment',
    recipient: 'John Adeyemi',
    reference: REF(),
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    userId: '1',
    type: 'transfer',
    amount: -25000,
    currency: 'NGN',
    status: 'success',
    description: 'Transfer to Eze Chukwu',
    recipient: 'Eze Chukwu',
    recipientBank: 'GTBank',
    reference: REF(),
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    userId: '1',
    type: 'airtime',
    amount: -1000,
    currency: 'NGN',
    status: 'success',
    description: 'MTN Airtime',
    recipient: '08012345678',
    reference: REF(),
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    userId: '1',
    type: 'electricity',
    amount: -8500,
    currency: 'NGN',
    status: 'success',
    description: 'IKEDC Electricity',
    recipient: '1234567890',
    reference: REF(),
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    userId: '1',
    type: 'data',
    amount: -2500,
    currency: 'NGN',
    status: 'success',
    description: 'Airtel Data — 5GB',
    recipient: '08087654321',
    reference: REF(),
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    userId: '1',
    type: 'transfer',
    amount: -50000,
    currency: 'NGN',
    status: 'pending',
    description: 'Transfer to Blessing Okafor',
    recipient: 'Blessing Okafor',
    recipientBank: 'UBA',
    reference: REF(),
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    userId: '1',
    type: 'cable_tv',
    amount: -4200,
    currency: 'NGN',
    status: 'success',
    description: 'DStv Compact Plus',
    recipient: '2345678901',
    reference: REF(),
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    userId: '1',
    type: 'deposit',
    amount: 30000,
    currency: 'NGN',
    status: 'success',
    description: 'Received from Emeka Nwosu',
    recipient: 'John Adeyemi',
    reference: REF(),
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_SAVINGS_GOALS: SavingsGoal[] = [
  { id: '1', name: 'New iPhone', targetAmount: 500000, savedAmount: 225000, deadline: '2026-09-01', emoji: '📱' },
  { id: '2', name: 'Vacation Fund', targetAmount: 300000, savedAmount: 180000, deadline: '2026-12-01', emoji: '✈️' },
  { id: '3', name: 'Emergency Fund', targetAmount: 200000, savedAmount: 200000, deadline: '2026-01-01', emoji: '🛡️' },
];

export const MOCK_BENEFICIARIES: BankBeneficiary[] = [
  { id: '1', name: 'Eze Chukwu', accountNumber: '0123456789', bankName: 'GTBank', bankCode: '058' },
  { id: '2', name: 'Blessing Okafor', accountNumber: '3456789012', bankName: 'UBA', bankCode: '033' },
  { id: '3', name: 'Emeka Nwosu', accountNumber: '2012345678', bankName: 'Access Bank', bankCode: '044' },
  { id: '4', name: 'Fatima Aliyu', accountNumber: '0098765432', bankName: 'First Bank', bankCode: '011' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Transfer Successful', message: 'You sent ₦25,000 to Eze Chukwu (GTBank)', read: false, date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), type: 'transaction' },
  { id: '2', title: 'Salary Received', message: 'Credit alert: ₦150,000 received in your account', read: false, date: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), type: 'transaction' },
  { id: '3', title: '10% Cashback!', message: 'Get 10% cashback on all airtime purchases this weekend', read: true, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'promo' },
  { id: '4', title: 'New Login Detected', message: 'A new login was detected from Lagos, Nigeria', read: true, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'security' },
];

export const BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank', code: '023' },
  { name: 'Ecobank', code: '050' },
  { name: 'FCMB', code: '214' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank', code: '011' },
  { name: 'GTBank', code: '058' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Opay', code: '999992' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Stanbic IBTC', code: '221' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'UBA', code: '033' },
  { name: 'Union Bank', code: '032' },
  { name: 'Unity Bank', code: '215' },
  { name: 'VFD Microfinance Bank', code: '566' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
];

export const DEFAULT_ACCOUNT_NUMBER = generateAccountNumber();
