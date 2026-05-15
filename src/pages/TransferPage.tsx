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
    e.preventDefault(); setError('');
    const amount = parseFloat(form.amount);
    if (!form.accountNumber || !form.bankCode || !amount) { setError('Please fill in all required fields.'); return; }
    if (amount < 100) { setError('Minimum transfer amount is ₦100.'); return; }
    if (account && amount > account.balance) { setError('Insufficient balance.'); return; }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setLoading(true);
    const ok = await sendMoney(parseFloat(form.amount), resolvedName || form.accountNumber, selectedBank?.name || '', form.narration || `Transfer to ${resolvedName}`);
    setLoading(false);
    if (ok) setStep('success');
    else setError('Transaction failed. Please try again.');
  };

  if (step === 'success') return (
    <AppLayout title="Transfer">
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-success" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Transfer Successful!</h2>
        <p className="text-base-content/60 text-sm mb-1">You sent</p>
        <p className="text-3xl font-black text-success mb-2">{formatCurrency(parseFloat(form.amount))}</p>
        <p className="text-base-content/60 text-sm mb-8">to <span className="font-semibold text-base-content">{resolvedName || form.accountNumber}</span> ({selectedBank?.name})</p>
        <div className="flex gap-3 w-full">
          <button onClick={() => { setStep('form'); setForm({ accountNumber: '', bankCode: '', amount: '', narration: '' }); setResolvedName(''); }}
            className="btn btn-outline flex-1">New Transfer</button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary flex-1">Go Home</button>
        </div>
      </div>
    </AppLayout>
  );

  if (step === 'confirm') return (
    <AppLayout title="Transfer">
      <div className="max-w-md mx-auto">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-4">Confirm Transfer</h2>
            <div className="divide-y divide-base-200">
              {[
                { label: 'Recipient', value: resolvedName || form.accountNumber },
                { label: 'Bank', value: selectedBank?.name || '—' },
                { label: 'Account Number', value: form.accountNumber },
                { label: 'Amount', value: formatCurrency(parseFloat(form.amount)) },
                { label: 'Narration', value: form.narration || 'N/A' },
                { label: 'Fee', value: '₦0.00' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-3">
                  <span className="text-sm text-base-content/60">{label}</span>
                  <span className="text-sm font-semibold text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
            {error && <div role="alert" className="alert alert-error mt-4 text-sm"><span>{error}</span></div>}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep('form')} className="btn btn-outline flex-1">Edit</button>
              <button onClick={handleConfirm} disabled={loading} className="btn btn-primary flex-1">
                {loading ? <span className="loading loading-spinner loading-sm" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Transfer Money">
      <div className="max-w-md mx-auto space-y-4">
        <div className="alert bg-primary/10 border-primary/20">
          <span className="text-sm text-base-content/70">Available Balance</span>
          <span className="font-bold text-primary ml-auto">{formatCurrency(account?.balance ?? 0)}</span>
        </div>

        {beneficiaries.length > 0 && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <p className="text-sm font-semibold mb-3">Recent Beneficiaries</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {beneficiaries.map((b) => (
                  <button key={b.id} onClick={() => { setForm((f) => ({ ...f, accountNumber: b.accountNumber, bankCode: b.bankCode })); setResolvedName(b.name); }}
                    className="flex flex-col items-center gap-1.5 min-w-[60px]">
                    <div className="avatar placeholder">
                      <div className="bg-primary/15 text-primary rounded-full w-12">
                        <span className="text-sm font-bold">{b.name.split(' ').map((n) => n[0]).join('')}</span>
                      </div>
                    </div>
                    <span className="text-xs text-base-content/70 text-center leading-tight w-14 truncate">{b.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && <div role="alert" className="alert alert-error text-sm"><span>{error}</span></div>}

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">Bank</legend>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 z-10" />
                  <select value={form.bankCode}
                    onChange={(e) => { setForm((f) => ({ ...f, bankCode: e.target.value })); if (form.accountNumber.length === 10) resolveAccount(); }}
                    className="select select-lg w-full pl-9">
                    <option value="">Select bank</option>
                    {BANKS.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
                  </select>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">Account Number</legend>
                <input type="tel" value={form.accountNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm((f) => ({ ...f, accountNumber: v })); setResolvedName('');
                    if (v.length === 10 && form.bankCode) setTimeout(resolveAccount, 0);
                  }}
                  placeholder="0123456789" className="input input-lg w-full" />
                {resolving && <p className="fieldset-label animate-pulse">Resolving account...</p>}
                {resolvedName && !resolving && (
                  <p className="fieldset-label text-success font-semibold flex items-center gap-1">
                    <CheckCircle size={13} /> {resolvedName}
                  </p>
                )}
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">Amount (₦)</legend>
                <input type="number" value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00" min="100" className="input input-lg w-full" />
                <div className="flex gap-2 mt-2">
                  {[1000, 2000, 5000, 10000].map((amt) => (
                    <button key={amt} type="button" onClick={() => setForm((f) => ({ ...f, amount: String(amt) }))}
                      className="btn btn-xs btn-outline">₦{(amt/1000).toFixed(0)}k</button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">
                  Narration <span className="text-base-content/40 font-normal">(optional)</span>
                </legend>
                <input type="text" value={form.narration}
                  onChange={(e) => setForm((f) => ({ ...f, narration: e.target.value }))}
                  placeholder="What's this for?" maxLength={50} className="input input-lg w-full" />
              </fieldset>

              <button type="submit" className="btn btn-primary btn-lg w-full">Continue</button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
