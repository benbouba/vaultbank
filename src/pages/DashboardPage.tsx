import {
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Smartphone,
  Zap,
  ArrowLeftRight,
  PiggyBank,
  Tv,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useBankStore } from '../store/bankStore';
import { formatCurrency, formatDateTime, maskAccountNumber } from '../utils';
import type { Transaction } from '../types';
import { useState } from 'react';

const quickActions = [
  { icon: ArrowLeftRight, label: 'Transfer', to: '/transfer', color: 'bg-blue-50 text-blue-600' },
  { icon: Smartphone, label: 'Airtime', to: '/airtime', color: 'bg-purple-50 text-purple-600' },
  { icon: Zap, label: 'Bills', to: '/bills', color: 'bg-yellow-50 text-yellow-600' },
  { icon: Tv, label: 'Cable TV', to: '/cable-tv', color: 'bg-pink-50 text-pink-600' },
  { icon: PiggyBank, label: 'Savings', to: '/savings', color: 'bg-green-50 text-green-600' },
  { icon: GraduationCap, label: 'Education', to: '/bills', color: 'bg-orange-50 text-orange-600' },
];

function StatusIcon({ status }: { status: Transaction['status'] }) {
  if (status === 'success') return <CheckCircle size={14} className="text-green-500" />;
  if (status === 'pending') return <Clock size={14} className="text-yellow-500" />;
  return <XCircle size={14} className="text-red-500" />;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, account, transactions, showBalance, toggleBalanceVisibility } = useBankStore();
  const [copied, setCopied] = useState(false);

  const recentTx = transactions.slice(0, 5);
  const totalIn = transactions.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const totalOut = transactions.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);

  const copyAccountNumber = () => {
    if (account) {
      navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppLayout title="Dashboard">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Balance Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-7 text-white shadow-xl">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Balance</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-black tracking-tight">
                    {showBalance ? formatCurrency(account?.balance ?? 0) : '••••••'}
                  </span>
                  <button onClick={toggleBalanceVisibility} className="text-green-200 hover:text-white transition-colors">
                    {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-200 text-xs">Savings Account</p>
                <div className="flex items-center gap-1 mt-1">
                  <p className="text-sm font-mono font-medium">
                    {account ? maskAccountNumber(account.accountNumber) : '—'}
                  </p>
                  <button onClick={copyAccountNumber} className="text-green-200 hover:text-white">
                    <Copy size={13} />
                  </button>
                </div>
                {copied && <p className="text-xs text-green-300 mt-0.5">Copied!</p>}
              </div>
            </div>

            {/* In/Out stats */}
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-green-400/30 rounded-full flex items-center justify-center">
                    <ArrowDownLeft size={12} />
                  </div>
                  <span className="text-xs text-green-100">Total In</span>
                </div>
                <p className="font-bold text-sm">{showBalance ? formatCurrency(totalIn) : '••••'}</p>
              </div>
              <div className="bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-red-400/30 rounded-full flex items-center justify-center">
                    <ArrowUpRight size={12} />
                  </div>
                  <span className="text-xs text-green-100">Total Out</span>
                </div>
                <p className="font-bold text-sm">{showBalance ? formatCurrency(totalOut) : '••••'}</p>
              </div>
            </div>

            {/* Account name */}
            <p className="text-xs text-green-200 mt-3 font-medium uppercase tracking-wider">
              {user?.firstName} {user?.lastName} · VaultBank
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-5 text-sm">Quick Actions</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {quickActions.map(({ icon: Icon, label, to, color }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} group-hover:scale-105 transition-transform`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs text-gray-600 font-medium text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-5 text-white relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
          <TrendingUp size={20} className="mb-2 text-purple-200" />
          <p className="font-bold text-base">Earn up to 12% p.a.</p>
          <p className="text-purple-100 text-xs mt-1">Lock your money in VaultSave and grow your wealth</p>
          <button className="mt-3 bg-white text-purple-700 text-xs font-bold px-4 py-2 rounded-full hover:bg-purple-50 transition-colors">
            Start Saving
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 text-sm">Recent Transactions</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-green-600 text-xs font-semibold hover:underline"
            >
              See all
            </button>
          </div>

          {recentTx.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No transactions yet</div>
          ) : (
            <div className="space-y-4">
              {recentTx.map((tx) => {
                const isCredit = tx.amount > 0;
                return (
                  <div key={tx.id} className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCredit ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      {isCredit
                        ? <ArrowDownLeft size={16} className="text-green-600" />
                        : <ArrowUpRight size={16} className="text-red-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <StatusIcon status={tx.status} />
                        <p className="text-xs text-gray-500">{formatDateTime(tx.date)}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold tabular-nums ${isCredit ? 'text-green-600' : 'text-gray-900'}`}>
                      {isCredit ? '+' : ''}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
