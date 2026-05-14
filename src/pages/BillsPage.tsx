import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useBankStore } from '../store/bankStore';
import { formatCurrency } from '../utils';

const DISCOS = [
  'IKEDC (Lagos Island)',
  'EKEDC (Lagos Mainland)',
  'IBEDC (Ibadan)',
  'PHEDC (Port Harcourt)',
  'AEDC (Abuja)',
  'EEDC (Enugu)',
  'KAEDCO (Kano)',
  'JED (Jos)',
];

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
    e.preventDefault();
    setError('');
    if (!disco) { setError('Please select a DISCO.'); return; }
    if (!meter || meter.length < 10) { setError('Enter a valid meter number.'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt < 500) { setError('Minimum payment is ₦500.'); return; }
    if (account && amt > account.balance) { setError('Insufficient balance.'); return; }
    setLoading(true);
    const ok = await payElectricity(meter, disco, amt);
    setLoading(false);
    if (ok) setSuccess(true);
    else setError('Transaction failed. Please try again.');
  };

  if (success) {
    return (
      <AppLayout title="Pay Bills">
        <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 text-sm mb-2">Your electricity bill has been paid.</p>
          <p className="text-xl font-bold text-green-600 mb-8">{formatCurrency(parseFloat(amount))}</p>
          <div className="flex gap-3 w-full">
            <button onClick={() => { setSuccess(false); setMeter(''); setAmount(''); setDisco(''); }} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50">
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
    <AppLayout title="Pay Bills">
      <div className="max-w-md mx-auto space-y-5">
        <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">Available Balance</span>
          <span className="font-bold text-green-700">{formatCurrency(account?.balance ?? 0)}</span>
        </div>

        {/* Bill category tabs – just electricity for now */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Zap size={16} className="text-yellow-600" />
            </div>
            <span className="font-semibold text-gray-900">Electricity Bill</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">Distribution Company (DISCO)</label>
              <select
                value={disco}
                onChange={(e) => setDisco(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">Select DISCO</option>
                {DISCOS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meter Type</label>
              <div className="flex gap-3">
                {METER_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMeterType(t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      meterType === t
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">Meter Number</label>
              <input
                type="tel"
                value={meter}
                onChange={(e) => setMeter(e.target.value.replace(/\D/g, '').slice(0, 13))}
                placeholder="Enter meter number"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">Amount (₦)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Minimum ₦500"
                min="500"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex gap-2 mt-2">
                {[1000, 2000, 5000, 10000].map((amt) => (
                  <button key={amt} type="button" onClick={() => setAmount(String(amt))}
                    className="text-xs bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-600 px-3 py-1 rounded-full transition-colors">
                    ₦{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Pay Electricity Bill'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
