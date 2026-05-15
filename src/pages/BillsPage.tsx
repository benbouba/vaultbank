import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useBankStore } from '../store/bankStore';
import { formatCurrency } from '../utils';

const DISCOS = ['IKEDC (Lagos Island)', 'EKEDC (Lagos Mainland)', 'IBEDC (Ibadan)', 'PHEDC (Port Harcourt)', 'AEDC (Abuja)', 'EEDC (Enugu)', 'KAEDCO (Kano)', 'JED (Jos)'];
const METER_TYPES = ['Prepaid', 'Postpaid'];

export default function BillsPage() {
  const navigate = useNavigate();
  const { payElectricity, account } = useBankStore();
  const [disco, setDisco] = useState('');
  const [meterType, setMeterType] = useState('Prepaid');
  const [meter, setMeter] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!disco) { setError('Please select a DISCO.'); return; }
    if (!meter || meter.length < 10) { setError('Enter a valid meter number.'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt < 500) { setError('Minimum payment is ₦500.'); return; }
    if (account && amt > account.balance) { setError('Insufficient balance.'); return; }
    setLoading(true);
    const ok = await payElectricity(meter, disco, amt);
    setLoading(false);
    if (ok) setSuccess(true); else setError('Transaction failed. Please try again.');
  };

  if (success) return (
    <AppLayout title="Pay Bills">
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-success" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-base-content/60 text-sm mb-2">Your electricity bill has been paid.</p>
        <p className="text-xl font-bold text-success mb-8">{formatCurrency(parseFloat(amount))}</p>
        <div className="flex gap-3 w-full">
          <button onClick={() => { setSuccess(false); setMeter(''); setAmount(''); setDisco(''); }} className="btn btn-outline flex-1">Pay Again</button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary flex-1">Go Home</button>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Pay Bills">
      <div className="max-w-md mx-auto space-y-4">
        <div className="alert bg-primary/10 border-primary/20">
          <span className="text-sm text-base-content/70">Available Balance</span>
          <span className="font-bold text-primary ml-auto">{formatCurrency(account?.balance ?? 0)}</span>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-base-200">
              <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Zap size={16} className="text-yellow-600" />
              </div>
              <span className="font-semibold">Electricity Bill</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && <div role="alert" className="alert alert-error text-sm"><span>{error}</span></div>}

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">Distribution Company (DISCO)</legend>
                <select value={disco} onChange={(e) => setDisco(e.target.value)} className="select select-lg w-full">
                  <option value="">Select DISCO</option>
                  {DISCOS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">Meter Type</legend>
                <div className="join w-full">
                  {METER_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setMeterType(t)}
                      className={`join-item btn flex-1 ${meterType === t ? 'btn-primary' : 'btn-outline'}`}>{t}</button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">Meter Number</legend>
                <input type="tel" value={meter}
                  onChange={(e) => setMeter(e.target.value.replace(/\D/g, '').slice(0, 13))}
                  placeholder="Enter meter number" className="input input-lg w-full" />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">Amount (₦)</legend>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="Minimum ₦500" min="500" className="input input-lg w-full" />
                <div className="flex gap-2 mt-2">
                  {[1000, 2000, 5000, 10000].map((amt) => (
                    <button key={amt} type="button" onClick={() => setAmount(String(amt))}
                      className="btn btn-xs btn-outline">₦{(amt/1000).toFixed(0)}k</button>
                  ))}
                </div>
              </fieldset>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? <span className="loading loading-spinner loading-sm" /> : 'Pay Electricity Bill'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
