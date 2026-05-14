import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useBankStore } from '../store/bankStore';
import { formatCurrency } from '../utils';

const NETWORKS = [
  { name: 'MTN', color: 'bg-yellow-400', textColor: 'text-yellow-900' },
  { name: 'Airtel', color: 'bg-red-500', textColor: 'text-white' },
  { name: 'Glo', color: 'bg-green-600', textColor: 'text-white' },
  { name: '9mobile', color: 'bg-emerald-400', textColor: 'text-white' },
];

const DATA_PLANS: Record<string, { label: string; price: number }[]> = {
  MTN: [
    { label: '1GB – 1 day', price: 300 },
    { label: '2GB – 2 days', price: 500 },
    { label: '5GB – 30 days', price: 1500 },
    { label: '10GB – 30 days', price: 2500 },
    { label: '20GB – 30 days', price: 4500 },
  ],
  Airtel: [
    { label: '1GB – 1 day', price: 350 },
    { label: '2GB – 7 days', price: 600 },
    { label: '5GB – 30 days', price: 1500 },
    { label: '10GB – 30 days', price: 2500 },
  ],
  Glo: [
    { label: '1.5GB – 1 day', price: 300 },
    { label: '5GB – 14 days', price: 1000 },
    { label: '7.7GB – 30 days', price: 2000 },
    { label: '15GB – 30 days', price: 3000 },
  ],
  '9mobile': [
    { label: '1GB – 30 days', price: 500 },
    { label: '2.5GB – 30 days', price: 1000 },
    { label: '5GB – 30 days', price: 2000 },
  ],
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
    e.preventDefault();
    setError('');
    if (!phone || !/^0[789]\d{9}$/.test(phone)) {
      setError('Enter a valid Nigerian phone number.');
      return;
    }
    if (mode === 'airtime') {
      const amt = parseFloat(amount);
      if (!amt || amt < 50) { setError('Minimum airtime is ₦50.'); return; }
      if (account && amt > account.balance) { setError('Insufficient balance.'); return; }
      setLoading(true);
      const ok1 = await buyAirtime(phone, network, amt);
      setLoading(false);
      if (ok1) setSuccess(true);
      else setError('Transaction failed. Please try again.');
    } else {
      if (!selectedPlanObj) { setError('Please select a data plan.'); return; }
      if (account && selectedPlanObj.price > account.balance) { setError('Insufficient balance.'); return; }
      setLoading(true);
      const ok2 = await buyData(phone, network, selectedPlan, selectedPlanObj.price);
      setLoading(false);
      if (ok2) setSuccess(true);
      else setError('Transaction failed. Please try again.');
    }
  };

  if (success) {
    return (
      <AppLayout title="Airtime & Data">
        <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === 'airtime' ? 'Airtime Sent!' : 'Data Purchased!'}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {mode === 'airtime'
              ? `₦${amount} airtime sent to ${phone} (${network})`
              : `${selectedPlan} data sent to ${phone} (${network})`}
          </p>
          <div className="flex gap-3 w-full">
            <button onClick={() => { setSuccess(false); setPhone(''); setAmount(''); setSelectedPlan(''); }} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50">
              Buy Again
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
    <AppLayout title="Airtime & Data">
      <div className="max-w-md mx-auto space-y-4">
        {/* Balance chip */}
        <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">Available Balance</span>
          <span className="font-bold text-green-700">{formatCurrency(account?.balance ?? 0)}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          {/* Mode toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {(['airtime', 'data'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

            {/* Network */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
              <div className="grid grid-cols-4 gap-2">
                {NETWORKS.map((n) => (
                  <button
                    key={n.name}
                    type="button"
                    onClick={() => { setNetwork(n.name); setSelectedPlan(''); }}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${n.color} ${n.textColor} ${
                      network === n.name ? 'ring-2 ring-green-500 scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {n.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="08012345678"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {mode === 'airtime' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₦)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="50"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex gap-2 mt-2">
                  {[100, 200, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(String(amt))}
                      className="text-xs bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-600 px-3 py-1 rounded-full transition-colors"
                    >
                      ₦{amt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
                <div className="space-y-2">
                  {plans.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setSelectedPlan(p.label)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                        selectedPlan === p.label
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{p.label}</span>
                      <span className="font-bold">{formatCurrency(p.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                `Pay ${mode === 'data' && selectedPlanObj ? formatCurrency(selectedPlanObj.price) : mode === 'airtime' && amount ? formatCurrency(parseFloat(amount)) : ''}`
              )}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
