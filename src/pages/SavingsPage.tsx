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
    if (!amt || amt < 100) { setError('Minimum top-up is \u20a6100.'); return; }
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

        <div className="alert bg-primary/10 border-primary/20">
          <span className="text-sm text-base-content/70">Available Balance</span>
          <span className="font-bold text-primary ml-auto">{formatCurrency(account?.balance ?? 0)}</span>
        </div>

        <div className="bg-gradient-to-r from-primary to-green-700 rounded-3xl p-5 text-primary-content shadow-md">
          <Target size={20} className="mb-2 text-primary-content/60" />
          <p className="font-bold text-lg">Your Savings Goals</p>
          <p className="text-primary-content/70 text-xs mt-1">Stay consistent, reach your goals faster</p>
        </div>

        {success && (
          <div role="alert" className="alert alert-success">
            <span className="text-sm font-semibold">Top-up successful!</span>
          </div>
        )}

        {savingsGoals.map((goal) => {
          const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
          const isComplete = goal.savedAmount >= goal.targetAmount;
          const isActive = activeGoal === goal.id;

          return (
            <div key={goal.id} className="card bg-base-100 shadow-sm">
              <div className="card-body p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <p className="font-semibold">{goal.name}</p>
                      <p className="text-xs text-base-content/50">Target: {formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>
                  {isComplete ? (
                    <span className="badge badge-success">Completed</span>
                  ) : (
                    <button
                      onClick={() => { setActiveGoal(isActive ? null : goal.id); setError(''); setTopUpAmount(''); }}
                      className="btn btn-primary btn-xs gap-1"
                    >
                      <Plus size={12} /> Top Up
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-base-content/60 mb-1.5">
                    <span>{formatCurrency(goal.savedAmount)} saved</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <progress
                    className={`progress w-full ${isComplete ? 'progress-success' : 'progress-primary'}`}
                    value={progress} max="100"
                  />
                </div>

                <p className="text-xs text-base-content/50">
                  {isComplete ? 'Goal reached!' : `\u20a6${formatCurrency(goal.targetAmount - goal.savedAmount)} remaining`}
                </p>

                {isActive && !isComplete && (
                  <div className="mt-4 pt-4 border-t border-base-200">
                    {error && <div role="alert" className="alert alert-error alert-sm mb-3 text-xs"><span>{error}</span></div>}
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend text-sm font-semibold">Amount to add (\u20a6)</legend>
                      <input
                        type="number" value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        placeholder="Min \u20a6100" min="100"
                        className="input input-lg w-full"
                      />
                      <div className="flex gap-2 mt-2">
                        {[500, 1000, 2000, 5000].map((amt) => (
                          <button key={amt} type="button" onClick={() => setTopUpAmount(String(amt))} className="btn btn-xs btn-outline">
                            \u20a6{(amt / 1000).toFixed(amt < 1000 ? 1 : 0)}{amt >= 1000 ? 'k' : ''}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <button onClick={() => handleTopUp(goal.id)} className="btn btn-primary w-full mt-3">
                      Add to Goal
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {savingsGoals.length === 0 && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center py-12">
              <Target size={40} className="text-base-content/20 mb-3" />
              <p className="text-base-content/50 text-sm">No savings goals yet</p>
              <p className="text-xs text-base-content/40 mt-1">Goals will appear here once set up</p>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
