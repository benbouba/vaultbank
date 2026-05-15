import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useBankStore } from '../store/bankStore';
import { formatCurrency } from '../utils';

const PROVIDERS = ['DStv', 'GOtv', 'Startimes'];
const PLANS: Record<string, { label: string; price: number }[]> = {
  DStv:     [{ label: 'Padi (N1,850/month)', price: 1850 }, { label: 'Yanga (N2,565/month)', price: 2565 }, { label: 'Confam (N4,615/month)', price: 4615 }, { label: 'Compact (N9,000/month)', price: 9000 }, { label: 'Compact Plus (N14,250/month)', price: 14250 }, { label: 'Premium (N24,500/month)', price: 24500 }],
  GOtv:     [{ label: 'Smallie (N900/month)', price: 900 }, { label: 'Jinja (N1,640/month)', price: 1640 }, { label: 'Jolli (N2,460/month)', price: 2460 }, { label: 'Max (N4,150/month)', price: 4150 }, { label: 'Supa (N6,400/month)', price: 6400 }],
  Startimes:[{ label: 'Basic (N900/month)', price: 900 }, { label: 'Smart (N1,300/month)', price: 1300 }, { label: 'Classic (N1,700/month)', price: 1700 }, { label: 'Super (N2,600/month)', price: 2600 }],
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
    e.preventDefault(); setError('');
    if (!cardNumber || cardNumber.length < 10) { setError('Enter a valid smart card/IUC number.'); return; }
    if (!selectedPlan) { setError('Please select a plan.'); return; }
    if (account && selectedPlan.price > account.balance) { setError('Insufficient balance.'); return; }
    setLoading(true);
    const ok = await payCableTv(cardNumber, provider, plan, selectedPlan.price);
    setLoading(false);
    if (ok) setSuccess(true); else setError('Transaction failed. Please try again.');
  };

  if (success) return (
    <AppLayout title="Cable TV">
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-success" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Subscription Renewed!</h2>
        <p className="text-base-content/60 text-sm mb-2">{provider} – {plan}</p>
        <p className="text-xl font-bold text-success mb-8">{selectedPlan && formatCurrency(selectedPlan.price)}</p>
        <div className="flex gap-3 w-full">
          <button onClick={() => { setSuccess(false); setCardNumber(''); setPlan(''); }} className="btn btn-outline flex-1">Pay Again</button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary flex-1">Go Home</button>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Cable TV">
      <div className="max-w-md mx-auto space-y-4">
        <div className="alert bg-primary/10 border-primary/20">
          <span className="text-sm text-base-content/70">Available Balance</span>
          <span className="font-bold text-primary ml-auto">{formatCurrency(account?.balance ?? 0)}</span>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && <div role="alert" className="alert alert-error text-sm"><span>{error}</span></div>}

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">Provider</legend>
                <div className="join w-full">
                  {PROVIDERS.map((p) => (
                    <button key={p} type="button" onClick={() => { setProvider(p); setPlan(''); }}
                      className={`join-item btn flex-1 ${provider === p ? 'btn-primary' : 'btn-outline'}`}>{p}</button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">Smart Card / IUC Number</legend>
                <input type="tel" value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 13))}
                  placeholder="Enter card number" className="input input-lg w-full" />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">Subscription Plan</legend>
                <div className="flex flex-col gap-2">
                  {plans.map((p) => (
                    <button key={p.label} type="button" onClick={() => setPlan(p.label)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                        plan === p.label ? 'border-primary bg-primary/10 text-primary' : 'border-base-300 hover:border-base-content/30'
                      }`}>
                      <span className="font-medium text-left">{p.label}</span>
                      <span className="font-bold shrink-0 ml-2">{formatCurrency(p.price)}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? <span className="loading loading-spinner loading-sm" /> : `Pay ${selectedPlan ? formatCurrency(selectedPlan.price) : ''}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
