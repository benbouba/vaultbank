import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useBankStore } from '../store/bankStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useBankStore((s) => s.login);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone || !pin) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    const success = await login(phone, pin);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid phone number or PIN. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-6 pt-8 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-green-600 font-black text-base">VB</span>
          </div>
          <span className="text-white font-black text-xl tracking-tight">VaultBank</span>
        </div>
        <h1 className="text-2xl font-black text-white leading-tight">Welcome back</h1>
        <p className="text-green-200 text-sm mt-2">Sign in to access your account</p>
      </div>

      <div className="flex-1 bg-white px-6 pt-6 pb-10">
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, '').slice(0, 11));
                setError('');
              }}
              placeholder="08012345678"
              maxLength={11}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              PIN
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                placeholder="Enter your PIN"
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <a href="#" className="text-xs text-green-600 font-semibold hover:underline">
                Forgot PIN?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors mt-2 text-base shadow-lg shadow-green-200 disabled:opacity-60"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-8">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-gray-100 text-gray-600 font-semibold text-sm hover:border-green-200 hover:text-green-700 transition-all">
          Use Biometrics / Face ID
        </button>

        <p className="text-center text-sm text-gray-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-600 font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
