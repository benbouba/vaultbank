import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useBankStore } from '../store/bankStore';
import { formatCurrency } from '../utils';
import { BANKS } from '../data/mockData';

export default function TransferPage() {
  const navigate = useNavigate();
  const { sendMoney, account, beneficiaries } = useBankStore();
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [form, setForm] = useState({ accountNumber: '', bankCode: '', amount: '', narration: '' });
  const [resolvedName, setResolvedName] = useState('');
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedBank = BANKS.find((b) => b.code === form.bankCode);

  const resolveAccount = () => {
    if (form.accountNumber.length === 10 && form.bankCode) {
      setResolving(true);
      setTimeout(() => {
        const names = ['Emeka Okafor', 'Fatima Bello', 'Chidi Eze', 'Aisha Lawal', 'Tunde Adeyemi'];
        setResolvedName(names[Math.floor(Math.random() * names.length)]);
        setResolving(false);
      }, 800);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const amount = parseFloat(form.amount);
    if (!form.accountNumber || !form.bankCode || !amount) {
      setError('Please fill in all required fields.');
      return;
    }
    if (amount < 100) {
      setError('Minimum transfer amount is ₦100.');
      return;
    }
    if (account && amount > account.balance) {
      setError('Insufficient balance.');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setLoading(true);
    const ok = await sendMoney(
      parseFloat(form.amount),
      resolvedName || form.accountNumber,
      selectedBank?.name || '',
      form.narration || `Transfer to ${resolvedName}`
    );
    setLoading(false);
    if (ok) setStep('success');
    else setError('Transaction failed. Please try again.');
  };

  if (step === 'success') {
    return (
      <AppLayout title="Transfer">
        <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful!</h2>
          <p className="text-gray-500 text-sm mb-1">You sent</p>
          <p className="text-3xl font-black text-green-600 mb-2">{formatCurrency(parseFloat(form.amount))}</p>
          <p className="text-gray-500 text-sm mb-8">to <span className="font-semibold text-gray-700">{resolvedName || form.accountNumber}</span> ({selectedBank?.name})</p>
          <div className="flex gap-3 w-full">
            <button onClick={() => { setStep('form'); setForm({ accountNumber: '', bankCode: '', amount: '', narration: '' }); setResolvedName(''); }} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50">
              New Transfer
            </button>
            <button onClick={() => navigate('/dashboard')} className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700">
              Go Home
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (step === 'confirm') {
    return (
      <AppLayout title="Transfer">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Confirm Transfer</h2>
            <div className="space-y-3 mb-6">
              {[
                { label: 'Recipient', value: resolvedName || form.accountNumber },
                { label: 'Bank', value: selectedBank?.name || '—' },
                { label: 'Account Number', value: form.accountNumber },
                { label: 'Amount', value: formatCurrency(parseFloat(form.amount)) },
                { label: 'Narration', value: form.narration || 'N/A' },
                { label: 'Fee', value: '₦0.00' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50">
                Edit
              </button>
              <button onClick={handleConfirm} disabled={loading} className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Transfer Money">
      <div className="max-w-md mx-auto space-y-5">
        {/* Balance chip */}
        <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">Available Balance</span>
          <span className="font-bold text-green-700">{formatCurrency(account?.balance ?? 0)}</span>
        </div>

        {/* Beneficiaries */}
        {beneficiaries.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">Recent Beneficiaries</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {beneficiaries.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setForm((f) => ({ ...f, accountNumber: b.accountNumber, bankCode: b.bankCode }));
                    setResolvedName(b.name);
                  }}
                  className="flex flex-col items-center gap-1.5 min-w-[60px]"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center">
                    {b.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <span className="text-xs text-gray-600 text-center leading-tight w-14 truncate">{b.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">Bank</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={form.bankCode}
                  onChange={(e) => { setForm((f) => ({ ...f, bankCode: e.target.value })); if (form.accountNumber.length === 10) resolveAccount(); }}
                  className="w-full pl-9 pr-4 py-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="">Select bank</option>
                  {BANKS.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">Account Number</label>
              <input
                type="tel"
                value={form.accountNumber}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm((f) => ({ ...f, accountNumber: v }));
                  setResolvedName('');
                  if (v.length === 10 && form.bankCode) {
                    setForm((f) => ({ ...f, accountNumber: v }));
                    setTimeout(resolveAccount, 0);
                  }
                }}
                placeholder="0123456789"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {resolving && <p className="text-xs text-gray-400 mt-1.5 animate-pulse">Resolving account...</p>}
              {resolvedName && !resolving && (
                <div className="flex items-center gap-2 mt-1.5">
                  <CheckCircle size={13} className="text-green-500" />
                  <p className="text-xs font-semibold text-green-700">{resolvedName}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">Amount (₦)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                min="100"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {/* Quick amount chips */}
              <div className="flex gap-2 mt-2">
                {[1000, 2000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, amount: String(amt) }))}
                    className="text-xs bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-600 px-3 py-1 rounded-full transition-colors"
                  >
                    ₦{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">Narration <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={form.narration}
                onChange={(e) => setForm((f) => ({ ...f, narration: e.target.value }))}
                placeholder="What's this for?"
                maxLength={50}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-colors"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
