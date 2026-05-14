import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useBankStore } from '../store/bankStore';
import { formatCurrency } from '../utils';

const PROVIDERS = ['DStv', 'GOtv', 'Startimes'];

const PLANS: Record<string, { label: string; price: number }[]> = {
  DStv: [
    { label: 'Padi (N1,850/month)', price: 1850 },
    { label: 'Yanga (N2,565/month)', price: 2565 },
    { label: 'Confam (N4,615/month)', price: 4615 },
    { label: 'Compact (N9,000/month)', price: 9000 },
    { label: 'Compact Plus (N14,250/month)', price: 14250 },
    { label: 'Premium (N24,500/month)', price: 24500 },
  ],
  GOtv: [
    { label: 'Smallie (N900/month)', price: 900 },
    { label: 'Jinja (N1,640/month)', price: 1640 },
    { label: 'Jolli (N2,460/month)', price: 2460 },
    { label: 'Max (N4,150/month)', price: 4150 },
    { label: 'Supa (N6,400/month)', price: 6400 },
  ],
  Startimes: [
    { label: 'Basic (N900/month)', price: 900 },
    { label: 'Smart (N1,300/month)', price: 1300 },
    { label: 'Classic (N1,700/month)', price: 1700 },
    { label: 'Super (N2,600/month)', price: 2600 },
  ],
};

export default function CableTvPage() {
  const navigate = useNavigate();
  const { payCableTv, account } = useBankStore();
  const [provider, setProvider] = useState('DStv');
  const [cardNumber, setCardNumber] = useState('');
  const [plan, setPlan] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const plans = PLANS[provider] || [];
  const selectedPlan = plans.find((p) => p.label === plan);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!cardNumber || cardNumber.length < 10) { setError('Enter a valid smart card/IUC number.'); return; }
    if (!selectedPlan) { setError('Please select a plan.'); return; }
    if (account && selectedPlan.price > account.balance) { setError('Insufficient balance.'); return; }
    setLoading(true);
    const ok = await payCableTv(cardNumber, provider, plan, selectedPlan.price);
    setLoading(false);
    if (ok) setSuccess(true);
    else setError('Transaction failed. Please try again.');
  };

  if (success) {
    return (
      <AppLayout title="Cable TV">
        <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Renewed!</h2>
          <p className="text-gray-500 text-sm mb-2">{provider} – {plan}</p>
          <p className="text-xl font-bold text-green-600 mb-8">{selectedPlan && formatCurrency(selectedPlan.price)}</p>
          <div className="flex gap-3 w-full">
            <button onClick={() => { setSuccess(false); setCardNumber(''); setPlan(''); }} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50">
              Pay Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700">
              Go Home
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Cable TV">
      <div className="max-w-md mx-auto space-y-5">
        <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">Available Balance</span>
          <span className="font-bold text-green-700">{formatCurrency(account?.balance ?? 0)}</span>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-7">
            {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <div className="grid grid-cols-3 gap-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setProvider(p); setPlan(''); }}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                      provider === p
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Smart Card / IUC Number</label>
              <input
                type="tel"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 13))}
                placeholder="Enter card number"
                className="w-full px-4 py-5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Plan</label>
              <div className="space-y-2">
                {plans.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPlan(p.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                      plan === p.label
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="font-medium text-left">{p.label}</span>
                    <span className="font-bold shrink-0 ml-2">{formatCurrency(p.price)}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-5 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : `Pay ${selectedPlan ? formatCurrency(selectedPlan.price) : ''}`}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
