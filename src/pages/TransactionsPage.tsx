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
  if (status === 'success') return <span className="badge badge-success badge-sm gap-1"><CheckCircle size={10} />Success</span>;
  if (status === 'pending') return <span className="badge badge-warning badge-sm gap-1"><Clock size={10} />Pending</span>;
  return <span className="badge badge-error badge-sm gap-1"><XCircle size={10} />Failed</span>;
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

        <label className="input input-lg w-full flex items-center gap-2">
          <Search size={16} className="text-base-content/40 shrink-0" />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..." className="grow"
          />
        </label>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={`shrink-0 btn btn-xs rounded-full ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >All</button>
          {(Object.entries(TYPE_LABELS) as [TransactionType, string][]).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`shrink-0 btn btn-xs rounded-full ${filterType === type ? 'btn-primary' : 'btn-outline'}`}
            >{label}</button>
          ))}
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-base-content/40 text-sm">No transactions found</div>
            ) : (
              <div className="space-y-4">
                {filtered.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <div key={tx.id} className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-success/10' : 'bg-error/10'}`}>
                        {isCredit
                          ? <ArrowDownLeft size={16} className="text-success" />
                          : <ArrowUpRight size={16} className="text-error" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">{tx.description}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TYPE_COLORS[tx.type]}`}>
                            {TYPE_LABELS[tx.type]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StatusBadge status={tx.status} />
                          <p className="text-xs text-base-content/50">{formatDateTime(tx.date)}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-bold tabular-nums shrink-0 ${isCredit ? 'text-success' : 'text-base-content'}`}>
                        {isCredit ? '+' : ''}{formatCurrency(tx.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
