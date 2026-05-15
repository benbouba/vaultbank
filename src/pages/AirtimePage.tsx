import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useBankStore } from '../store/bankStore';
import { formatCurrency } from '../utils';

const NETWORKS = [
  { name: 'MTN',    color: 'bg-yellow-400 text-yellow-900' },
  { name: 'Airtel', color: 'bg-red-500 text-white' },
  { name: 'Glo',    color: 'bg-green-600 text-white' },
  { name: '9mobile',color: 'bg-emerald-400 text-white' },
];

const DATA_PLANS: Record<string, { label: string; price: number }[]> = {
  MTN:     [{ label: '1GB – 1 day', price: 300 }, { label: '2GB – 2 days', price: 500 }, { label: '5GB – 30 days', price: 1500 }, { label: '10GB – 30 days', price: 2500 }, { label: '20GB – 30 days', price: 4500 }],
  Airtel:  [{ label: '1GB – 1 day', price: 350 }, { label: '2GB – 7 days', price: 600 }, { label: '5GB – 30 days', price: 1500 }, { label: '10GB – 30 days', price: 2500 }],
  Glo:     [{ label: '1.5GB – 1 day', price: 300 }, { label: '5GB – 14 days', price: 1000 }, { label: '7.7GB – 30 days', price: 2000 }, { label: '15GB – 30 days', price: 3000 }],
  '9mobile':[{ label: '1GB – 30 days', price: 500 }, { label: '2.5GB – 30 days', price: 1000 }, { label: '5GB – 30 days', price: 2000 }],
};

type Mode = 'airtime' | 'data';

export default function AirtimePage() {
  const navigate = useNavigate();
  const { buyAirtime, buyData, account } = useBankStore();
  const [mode, setMode] = useState<Mode>('airtime');
  const [network, setNetwork] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const plans = DATA_PLANS[network] || [];
  const selectedPlanObj = plans.find((p) => p.label === selectedPlan);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!phone || !/^0[789]\d{9}$/.test(phone)) { setError('Enter a valid Nigerian phone number.'); return; }
    if (mode === 'airtime') {
      const amt = parseFloat(amount);
      if (!amt || amt < 50) { setError('Minimum airtime is ₦50.'); return; }
      if (account && amt > account.balance) { setError('Insufficient balance.'); return; }
      setLoading(true);
      const ok = await buyAirtime(phone, network, amt);
      setLoading(false);
      if (ok) setSuccess(true); else setError('Transaction failed. Please try again.');
    } else {
      if (!selectedPlanObj) { setError('Please select a data plan.'); return; }
      if (account && selectedPlanObj.price > account.balance) { setError('Insufficient balance.'); return; }
      setLoading(true);
      const ok = await buyData(phone, network, selectedPlan, selectedPlanObj.price);
      setLoading(false);
      if (ok) setSuccess(true); else setError('Transaction failed. Please try again.');
    }
  };

  if (success) return (
    <AppLayout title="Airtime & Data">
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-success" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{mode === 'airtime' ? 'Airtime Sent!' : 'Data Purchased!'}</h2>
        <p className="text-base-content/60 text-sm mb-8">
          {mode === 'airtime' ? `₦${amount} airtime sent to ${phone} (${network})` : `${selectedPlan} data sent to ${phone} (${network})`}
        </p>
        <div className="flex gap-3 w-full">
          <button onClick={() => { setSuccess(false); setPhone(''); setAmount(''); setSelectedPlan(''); }} className="btn btn-outline flex-1">Buy Again</button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary flex-1">Go Home</button>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Airtime & Data">
      <div className="max-w-md mx-auto space-y-4">
        <div className="alert bg-primary/10 border-primary/20">
          <span className="text-sm text-base-content/70">Available Balance</span>
          <span className="font-bold text-primary ml-auto">{formatCurrency(account?.balance ?? 0)}</span>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="tabs tabs-boxed bg-base-200 mb-5">
              {(['airtime', 'data'] as Mode[]).map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(''); }}
                  className={`tab capitalize flex-1 ${mode === m ? 'tab-active' : ''}`}>{m}</button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && <div role="alert" className="alert alert-error text-sm"><span>{error}</span></div>}

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">Network</legend>
                <div className="grid grid-cols-4 gap-2">
                  {NETWORKS.map((n) => (
                    <button key={n.name} type="button" onClick={() => { setNetwork(n.name); setSelectedPlan(''); }}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${n.color} ${network === n.name ? 'ring-2 ring-primary scale-105' : 'opacity-70 hover:opacity-100'}`}>
                      {n.name}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">Phone Number</legend>
                <input type="tel" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="08012345678" className="input input-lg w-full" />
              </fieldset>

              {mode === 'airtime' ? (
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-sm font-semibold">Amount (₦)</legend>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" min="50" className="input input-lg w-full" />
                  <div className="flex gap-2 mt-2">
                    {[100, 200, 500, 1000].map((amt) => (
                      <button key={amt} type="button" onClick={() => setAmount(String(amt))}
                        className="btn btn-xs btn-outline">₦{amt}</button>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-sm font-semibold">Select Plan</legend>
                  <div className="flex flex-col gap-2">
                    {plans.map((p) => (
                      <button key={p.label} type="button" onClick={() => setSelectedPlan(p.label)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                          selectedPlan === p.label ? 'border-primary bg-primary/10 text-primary' : 'border-base-300 hover:border-base-content/30'
                        }`}>
                        <span className="font-medium">{p.label}</span>
                        <span className="font-bold">{formatCurrency(p.price)}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? <span className="loading loading-spinner loading-sm" />
                  : `Pay ${mode === 'data' && selectedPlanObj ? formatCurrency(selectedPlanObj.price) : mode === 'airtime' && amount ? formatCurrency(parseFloat(amount)) : ''}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
