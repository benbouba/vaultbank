import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Fingerprint } from 'lucide-react';
import { useBankStore } from '../store/bankStore';
import {
  isPlatformAuthenticatorAvailable,
  hasBiometricEnrolled,
  enrollBiometric,
  authenticateBiometric,
  updateBiometricRefreshToken,
} from '../utils/biometric';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useBankStore((s) => s.login);
  const loginWithBiometric = useBankStore((s) => s.loginWithBiometric);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricReady, setBiometricReady] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then((available) => {
      setBiometricReady(available && hasBiometricEnrolled());
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone || !pin) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const success = await login(phone, pin);
    setLoading(false);
    if (success) {
      // Enroll or refresh biometric credential in the background
      const storedToken = useBankStore.getState().refreshToken;
      if (storedToken) {
        void isPlatformAuthenticatorAvailable().then((available) => {
          if (!available) return;
          if (hasBiometricEnrolled()) {
            updateBiometricRefreshToken(storedToken);
          } else {
            void enrollBiometric(phone, storedToken);
          }
        });
      }
      navigate('/dashboard');
    } else {
      setError('Invalid phone number or PIN. Please try again.');
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricReady) {
      setError('Sign in with your PIN first to enable Face ID / Fingerprint.');
      return;
    }
    setBiometricLoading(true);
    setError('');
    const result = await authenticateBiometric();
    if (!result) {
      setBiometricLoading(false);
      setError('Biometric authentication was cancelled or failed. Use your PIN.');
      return;
    }
    const success = await loginWithBiometric(result.refreshToken);
    setBiometricLoading(false);
    if (success) {
      const newToken = useBankStore.getState().refreshToken;
      if (newToken) updateBiometricRefreshToken(newToken);
      navigate('/dashboard');
    } else {
      setError('Session expired. Please sign in with your PIN.');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex justify-center">
      <div className="w-full max-w-sm min-h-screen bg-base-100 flex flex-col">

        <div className="bg-primary text-primary-content px-7 pt-16 pb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-content rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-primary font-black text-base">VB</span>
            </div>
            <span className="font-black text-xl tracking-tight">VaultBank</span>
          </div>
          <h1 className="text-3xl font-black leading-tight">Welcome back</h1>
          <p className="text-primary-content/70 text-sm mt-2">Sign in to access your account</p>
        </div>

        <div
          className="flex-1 bg-base-100 overflow-y-auto"
          style={{ borderRadius: '28px 28px 0 0', marginTop: '-28px', padding: '40px 28px 64px', boxShadow: '0 -8px 32px rgba(0,0,0,0.08)' }}
        >
          {error && (
            <div role="alert" className="alert alert-error mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-sm font-semibold">Phone Number</legend>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 11)); setError(''); }}
                placeholder="08012345678"
                maxLength={11}
                className="input input-lg w-full"
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend text-sm font-semibold">PIN</legend>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                  placeholder="Enter your PIN"
                  className="input input-lg w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="fieldset-label justify-end mt-1">
                <a href="#" className="link link-primary text-xs font-semibold">Forgot PIN?</a>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full mt-2"
            >
              {loading
                ? <span className="loading loading-spinner loading-sm" />
                : <><span>Sign In</span><ArrowRight size={18} /></>
              }
            </button>
          </form>

          <div className="divider my-8 text-xs text-base-content/50">or</div>

          <button
            type="button"
            onClick={handleBiometricLogin}
            disabled={biometricLoading}
            className={`btn w-full btn-lg gap-3 ${biometricReady ? 'btn-outline' : 'btn-ghost text-base-content/40'}`}
          >
            {biometricLoading
              ? <span className="loading loading-spinner loading-sm" />
              : <><Fingerprint size={20} />{biometricReady ? 'Use Face ID / Fingerprint' : 'Face ID / Fingerprint'}</>
            }
          </button>

          <p className="text-center text-sm text-base-content/60 mt-8">
            {"Don't have an account? "}
            <Link to="/register" className="link link-primary font-semibold">Create Account</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
