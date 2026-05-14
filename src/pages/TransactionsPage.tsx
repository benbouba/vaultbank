import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useBankStore } from '../store/bankStore';
import { formatCurrency, formatDateTime } from '../utils';
import type { Transaction, TransactionType } from '../types';

const TYPE_LABELS: Record<TransactionType, string> = {
  transfer: 'Transfer',
  airtime: 'Airtime',
  data: 'Data',
  electricity: 'Electricity',
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  cable_tv: 'Cable TV',
  education: 'Education',
};

const TYPE_COLORS: Record<TransactionType, string> = {
  transfer: 'bg-blue-100 text-blue-700',
  airtime: 'bg-purple-100 text-purple-700',
  data: 'bg-indigo-100 text-indigo-700',
  electricity: 'bg-yellow-100 text-yellow-700',
  deposit: 'bg-green-100 text-green-700',
  withdrawal: 'bg-red-100 text-red-700',
  cable_tv: 'bg-pink-100 text-pink-700',
  education: 'bg-orange-100 text-orange-700',
};

function StatusBadge({ status }: { status: Transaction['status'] }) {
  if (status === 'success') return <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle size={11} />Success</span>;
  if (status === 'pending') return <span className="flex items-center gap-1 text-xs text-yellow-600"><Clock size={11} />Pending</span>;
  return <span className="flex items-center gap-1 text-xs text-red-500"><XCircle size={11} />Failed</span>;
}

export default function TransactionsPage() {
  const { transactions } = useBankStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      (tx.recipient ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <AppLayout title="Transactions">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm flex items-center gap-3 px-4 py-3">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilterType('all')}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              filterType === 'all' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            All
          </button>
          {(Object.entries(TYPE_LABELS) as [TransactionType, string][]).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                filterType === type ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No transactions found</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((tx) => {
                const isCredit = tx.amount > 0;
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-5 py-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCredit ? 'bg-green-50' : 'bg-gray-50'
                    }`}>
                      {isCredit
                        ? <ArrowDownLeft size={16} className="text-green-600" />
                        : <ArrowUpRight size={16} className="text-gray-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge status={tx.status} />
                        <span className="text-gray-300">·</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${TYPE_COLORS[tx.type]}`}>
                          {TYPE_LABELS[tx.type]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(tx.date)}</p>
                    </div>
                    <p className={`text-sm font-bold tabular-nums shrink-0 ${isCredit ? 'text-green-600' : 'text-gray-900'}`}>
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
