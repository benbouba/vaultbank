import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useBankStore } from '../store/bankStore';
import { formatCurrency } from '../utils';

export default function SavingsPage() {
  const { savingsGoals, addToSavingsGoal, account } = useBankStore();
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const handleTopUp = (goalId: string) => {
    setError('');
    const amt = parseFloat(topUpAmount);
    if (!amt || amt < 100) { setError('Minimum top-up is ₦100.'); return; }
    if (account && amt > account.balance) { setError('Insufficient balance.'); return; }
    addToSavingsGoal(goalId, amt);
    setSuccess(goalId);
    setTopUpAmount('');
    setActiveGoal(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <AppLayout title="Savings">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Balance chip */}
        <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">Available Balance</span>
          <span className="font-bold text-green-700">{formatCurrency(account?.balance ?? 0)}</span>
        </div>

        {/* Promo */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-5 text-white">
          <Target size={20} className="mb-2 text-green-200" />
          <p className="font-bold text-lg">Your Savings Goals</p>
          <p className="text-green-100 text-xs mt-1">Stay consistent, reach your goals faster</p>
        </div>

        {/* Goals */}
        {savingsGoals.map((goal) => {
          const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
          const isComplete = goal.savedAmount >= goal.targetAmount;
          const isActive = activeGoal === goal.id;

          return (
            <div key={goal.id} className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{goal.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{goal.name}</p>
                    <p className="text-xs text-gray-500">Target: {formatCurrency(goal.targetAmount)}</p>
                  </div>
                </div>
                {isComplete ? (
                  <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">Completed ✓</span>
                ) : (
                  <button
                    onClick={() => { setActiveGoal(isActive ? null : goal.id); setError(''); setTopUpAmount(''); }}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <Plus size={12} /> Top Up
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>{formatCurrency(goal.savedAmount)} saved</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {success === goal.id && (
                <p className="text-xs text-green-600 font-semibold mt-2">Top-up successful! 🎉</p>
              )}

              {/* Top-up form */}
              {isActive && !isComplete && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="Amount (₦)"
                      min="100"
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={() => handleTopUp(goal.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[1000, 5000, 10000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(String(amt))}
                        className="text-xs bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-600 px-3 py-1 rounded-full transition-colors"
                      >
                        ₦{(amt / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
