import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Account, Transaction, Notification, SavingsGoal, BankBeneficiary } from '../types';
import {
  MOCK_SAVINGS_GOALS,
  MOCK_BENEFICIARIES,
  MOCK_NOTIFICATIONS,
} from '../data/mockData';
import { generateReference } from '../utils';
import { api } from '../api/client';

interface BankState {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  account: Account | null;
  accessToken: string | null;
  refreshToken: string | null;
  // Data
  transactions: Transaction[];
  notifications: Notification[];
  savingsGoals: SavingsGoal[];
  beneficiaries: BankBeneficiary[];
  // UI
  showBalance: boolean;

  // Auth actions (async — call real API)
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    pin: string;
    bvn?: string;
  }) => Promise<void>;
  login: (phone: string, pin: string) => Promise<boolean>;
  loginWithBiometric: (refreshToken: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Account actions
  toggleBalanceVisibility: () => void;
  sendMoney: (amount: number, recipient: string, bank: string, narration: string) => Promise<boolean>;
  buyAirtime: (phone: string, network: string, amount: number) => Promise<boolean>;
  buyData: (phone: string, network: string, plan: string, amount: number) => Promise<boolean>;
  payElectricity: (meter: string, disco: string, amount: number) => Promise<boolean>;
  payCableTv: (cardNumber: string, provider: string, plan: string, amount: number) => Promise<boolean>;

  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Savings actions
  addToSavingsGoal: (goalId: string, amount: number) => void;
}

function mapUser(u: {
  id: string; firstName: string; lastName: string; email: string;
  phone: string; kycVerified: boolean; accountNumber: string; createdAt: string;
}): User {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    kycVerified: u.kycVerified,
    accountNumber: u.accountNumber,
    createdAt: u.createdAt,
  };
}

function mapAccount(u: { id: string; accountNumber: string; balance: number }): Account {
  return {
    id: u.id,
    userId: u.id,
    balance: u.balance,
    currency: 'NGN',
    accountNumber: u.accountNumber,
    accountType: 'savings',
  };
}

export const useBankStore = create<BankState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      account: null,
      accessToken: null,
      refreshToken: null,
      transactions: [],
      notifications: MOCK_NOTIFICATIONS,
      savingsGoals: MOCK_SAVINGS_GOALS,
      beneficiaries: MOCK_BENEFICIARIES,
      showBalance: true,

      register: async (data) => {
        const res = await api.auth.register(data);
        set({
          isAuthenticated: true,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          user: mapUser(res.user),
          account: mapAccount(res.user),
          transactions: [],
        });
      },

      login: async (phone, pin) => {
        try {
          const res = await api.auth.login(phone, pin);
          set({
            isAuthenticated: true,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            user: mapUser(res.user),
            account: mapAccount(res.user),
          });
          return true;
        } catch {
          return false;
        }
      },

      loginWithBiometric: async (refreshToken) => {
        try {
          const res = await api.auth.refresh(refreshToken);
          set({
            isAuthenticated: true,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            user: mapUser(res.user),
            account: mapAccount(res.user),
          });
          return true;
        } catch {
          return false;
        }
      },

      logout: async () => {
        const { accessToken } = get();
        if (accessToken) {
          try { await api.auth.logout(accessToken); } catch { /* ignore network errors */ }
        }
        set({
          isAuthenticated: false,
          user: null,
          account: null,
          accessToken: null,
          refreshToken: null,
          transactions: [],
        });
      },

      toggleBalanceVisibility: () => set((s) => ({ showBalance: !s.showBalance })),

      sendMoney: async (amount, recipient, bank, narration) => {
        const { account, transactions, accessToken } = get();
        if (!account || account.balance < amount || !accessToken) return false;
        try {
          const res = await api.transactions.transfer(accessToken, {
            recipientAccountNumber: recipient,
            recipientBank: bank,
            amount,
            narration,
          });
          const tx: Transaction = {
            id: generateReference(),
            userId: account.userId,
            type: 'transfer',
            amount: -amount,
            currency: 'NGN',
            status: 'success',
            description: narration || `Transfer to ${recipient}`,
            recipient,
            recipientBank: bank,
            reference: res.reference,
            date: new Date().toISOString(),
          };
          set({ account: { ...account, balance: res.newBalance }, transactions: [tx, ...transactions] });
          return true;
        } catch { return false; }
      },

      buyAirtime: async (phone, network, amount) => {
        const { account, transactions, accessToken } = get();
        if (!account || account.balance < amount || !accessToken) return false;
        try {
          const res = await api.transactions.airtime(accessToken, { phone, network, amount });
          const tx: Transaction = {
            id: generateReference(),
            userId: account.userId,
            type: 'airtime',
            amount: -amount,
            currency: 'NGN',
            status: 'success',
            description: `${network} Airtime`,
            recipient: phone,
            reference: res.reference,
            date: new Date().toISOString(),
          };
          set({ account: { ...account, balance: res.newBalance }, transactions: [tx, ...transactions] });
          return true;
        } catch { return false; }
      },

      buyData: async (phone, network, plan, amount) => {
        const { account, transactions, accessToken } = get();
        if (!account || account.balance < amount || !accessToken) return false;
        try {
          const res = await api.transactions.bill(accessToken, {
            provider: network, plan, customerId: phone, amount, type: 'data',
          });
          const tx: Transaction = {
            id: generateReference(),
            userId: account.userId,
            type: 'data',
            amount: -amount,
            currency: 'NGN',
            status: 'success',
            description: `${network} Data — ${plan}`,
            recipient: phone,
            reference: res.reference,
            date: new Date().toISOString(),
          };
          set({ account: { ...account, balance: res.newBalance }, transactions: [tx, ...transactions] });
          return true;
        } catch { return false; }
      },

      payElectricity: async (meter, disco, amount) => {
        const { account, transactions, accessToken } = get();
        if (!account || account.balance < amount || !accessToken) return false;
        try {
          const res = await api.transactions.bill(accessToken, {
            provider: disco, customerId: meter, amount, type: 'electricity',
          });
          const tx: Transaction = {
            id: generateReference(),
            userId: account.userId,
            type: 'electricity',
            amount: -amount,
            currency: 'NGN',
            status: 'success',
            description: `${disco} Electricity`,
            recipient: meter,
            reference: res.reference,
            date: new Date().toISOString(),
          };
          set({ account: { ...account, balance: res.newBalance }, transactions: [tx, ...transactions] });
          return true;
        } catch { return false; }
      },

      payCableTv: async (cardNumber, provider, plan, amount) => {
        const { account, transactions, accessToken } = get();
        if (!account || account.balance < amount || !accessToken) return false;
        try {
          const res = await api.transactions.bill(accessToken, {
            provider, plan, customerId: cardNumber, amount, type: 'cable_tv',
          });
          const tx: Transaction = {
            id: generateReference(),
            userId: account.userId,
            type: 'cable_tv',
            amount: -amount,
            currency: 'NGN',
            status: 'success',
            description: `${provider} — ${plan}`,
            recipient: cardNumber,
            reference: res.reference,
            date: new Date().toISOString(),
          };
          set({ account: { ...account, balance: res.newBalance }, transactions: [tx, ...transactions] });
          return true;
        } catch { return false; }
      },

      markNotificationRead: (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
      },

      markAllNotificationsRead: () => {
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
      },

      addToSavingsGoal: (goalId, amount) => {
        const { account, savingsGoals } = get();
        if (!account || account.balance < amount) return;
        set({
          account: { ...account, balance: account.balance - amount },
          savingsGoals: savingsGoals.map((g) =>
            g.id === goalId
              ? { ...g, savedAmount: Math.min(g.savedAmount + amount, g.targetAmount) }
              : g,
          ),
        });
      },
    }),
    {
      name: 'virtualbank-storage',
      partialize: (state) => ({
        user: state.user,
        account: state.account,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        transactions: state.transactions,
        notifications: state.notifications,
        savingsGoals: state.savingsGoals,
        beneficiaries: state.beneficiaries,
        showBalance: state.showBalance,
      }),
    },
  ),
);
