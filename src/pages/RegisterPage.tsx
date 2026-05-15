import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useBankStore } from '../store/bankStore';

function InputField({
  label, type = 'text', value, onChange, placeholder, maxLength, suffix,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  maxLength?: number; suffix?: React.ReactNode;
}) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend text-sm font-semibold">{label}</legend>
      <div className="relative">
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} maxLength={maxLength}
          className="input input-lg w-full"
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
    </fieldset>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useBankStore((s) => s.register);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', bvn: '', pin: '', confirmPin: '' });
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bvnVerifying, setBvnVerifying] = useState(false);
  const [bvnVerified, setBvnVerified] = useState(false);
  const [bvnAutoFilled, setBvnAutoFilled] = useState(false);

  const update = (field: string, value: string) => { setForm((f) => ({ ...f, [field]: value })); setError(''); };

  const simulateBvnFill = (bvn: string) => {
    // Mirror of backend SANDBOX_BVNS — same records, works offline
    const SANDBOX: Record<string, { firstName: string; lastName: string }> = {
      '22191234560': { firstName: 'Chukwuemeka', lastName: 'Okonkwo'  },
      '22192345671': { firstName: 'Fatima',       lastName: 'Abubakar' },
      '22193456782': { firstName: 'Adebayo',      lastName: 'Adeleke'  },
      '22194567893': { firstName: 'Ngozi',         lastName: 'Eze'      },
      '22195678904': { firstName: 'Tunde',         lastName: 'Balogun'  },
      '22196789015': { firstName: 'Amaka',         lastName: 'Nwosu'    },
      '22197890126': { firstName: 'Ibrahim',       lastName: 'Musa'     },
      '22198901237': { firstName: 'Chidinma',      lastName: 'Obi'      },
      '22199012348': { firstName: 'Oluwaseun',     lastName: 'Adeyemi'  },
      '22100123459': { firstName: 'Hauwa',         lastName: 'Yakubu'   },
      '22101234560': { firstName: 'Emeka',         lastName: 'Nwankwo'  },
      '22102345671': { firstName: 'Yetunde',       lastName: 'Ogunleye' },
      '22103456782': { firstName: 'Usman',         lastName: 'Danjuma'  },
      '22104567893': { firstName: 'Blessing',      lastName: 'Onyeka'   },
      '22105678904': { firstName: 'Rotimi',        lastName: 'Fashola'  },
      '22106789015': { firstName: 'Aisha',         lastName: 'Garba'    },
      '22107890126': { firstName: 'Kelechi',       lastName: 'Uchenna'  },
      '22108901237': { firstName: 'Folake',        lastName: 'Salami'   },
      '22109012348': { firstName: 'Musa',          lastName: 'Aliyu'    },
      '22110123459': { firstName: 'Adaeze',        lastName: 'Okafor'   },
    };
    const record = SANDBOX[bvn];
    if (record) {
      update('firstName', record.firstName);
      update('lastName', record.lastName);
    } else {
      // Deterministic fallback for any other 11-digit BVN
      const firstNames = ['Emeka','Fatima','Chidi','Amaka','Tunde','Ngozi','Bola','Yemi',
                          'Kunle','Ada','Seun','Halima','Gbenga','Ifeoma','Bashir','Sola'];
      const lastNames  = ['Okafor','Adeleke','Ibrahim','Nwosu','Balogun','Eze','Abubakar',
                          'Adeyemi','Musa','Obi','Lawal','Dankwa','Fashola','Ogbu','Yakubu'];
      update('firstName', firstNames[parseInt(bvn[4], 10) % firstNames.length]);
      update('lastName',  lastNames[parseInt(bvn[7],  10) % lastNames.length]);
    }
    setBvnAutoFilled(true);
  };

  const handleVerifyBvn = async () => {
    if (!/^\d{11}$/.test(form.bvn)) { setError('BVN must be exactly 11 digits.'); return; }
    setError(''); setBvnVerifying(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/kyc/verify-bvn-pre`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bvn: form.bvn }),
      });
      if (res.ok) {
        const data = await res.json();
        setBvnVerified(true);
        if (data.firstName) update('firstName', data.firstName);
        if (data.lastName) update('lastName', data.lastName);
        if (data.firstName || data.lastName) setBvnAutoFilled(true);
      } else {
        const data = await res.json();
        setError(data.error ?? 'BVN verification failed.');
      }
    } catch {
      // Backend not running — simulate locally (same algorithm as bvnService)
      setBvnVerified(true);
      simulateBvnFill(form.bvn);
    } finally { setBvnVerifying(false); }
  };

  const handleStep1 = () => {
    if (!form.firstName || !form.lastName || !form.phone || !form.email) { setError('All fields are required.'); return; }
    if (!/^0[789]\d{9}$/.test(form.phone)) { setError('Enter a valid Nigerian phone number (e.g. 08012345678).'); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Enter a valid email address.'); return; }
    if (!bvnVerified) { setError('Please verify your BVN to continue.'); return; }
    setStep(2); setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pin.length < 4) { setError('PIN must be at least 4 digits.'); return; }
    if (form.pin !== form.confirmPin) { setError('PINs do not match.'); return; }
    setLoading(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, bvn: form.bvn, pin: form.pin });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      setLoading(false);
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
          <h1 className="text-3xl font-black leading-tight">
            {step === 1 ? 'Create your\naccount' : 'Secure your\naccount'}
          </h1>
          <p className="text-primary-content/70 text-sm mt-2">
            {step === 1 ? 'BVN-verified Nigerian banking' : 'Set a PIN to protect your money'}
          </p>
          <div className="flex items-center gap-2 mt-8">
            {[1, 2].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-primary-content' : s < step ? 'w-4 bg-primary-content/60' : 'w-4 bg-primary-content/30'
              }`} />
            ))}
            <span className="text-primary-content/60 text-xs ml-1">Step {step} of 2</span>
          </div>
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

          {step === 1 ? (
            <div className="flex flex-col gap-5">
              <InputField label="First Name" value={form.firstName} onChange={(v) => update('firstName', v)} placeholder="John" />
              <InputField label="Last Name" value={form.lastName} onChange={(v) => update('lastName', v)} placeholder="Doe" />
              <InputField label="Phone Number" type="tel" value={form.phone}
                onChange={(v) => update('phone', v.replace(/\D/g, '').slice(0, 11))} placeholder="08012345678" maxLength={11} />
              <InputField label="Email Address" type="email" value={form.email}
                onChange={(v) => update('email', v)} placeholder="john@example.com" />

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-semibold">BVN (Bank Verification Number)</legend>
                <div className="relative">
                  <input
                    type="tel" value={form.bvn}
                    onChange={(e) => { update('bvn', e.target.value.replace(/\D/g, '').slice(0, 11)); setBvnVerified(false); setBvnAutoFilled(false); }}
                    placeholder="Enter 11-digit BVN" maxLength={11} disabled={bvnVerified}
                    className={`input input-lg w-full pr-24 ${bvnVerified ? 'border-success' : ''}`}
                  />
                  {bvnVerified ? (
                    <ShieldCheck size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-success" />
                  ) : (
                    <button type="button" onClick={handleVerifyBvn}
                      disabled={bvnVerifying || form.bvn.length !== 11}
                      className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary btn-sm">
                      {bvnVerifying ? <span className="loading loading-spinner loading-xs" /> : 'Verify'}
                    </button>
                  )}
                </div>
                {bvnVerified && (
                  <p className="fieldset-label text-success font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 size={12} /> BVN verified successfully
                  </p>
                )}
                {bvnAutoFilled && (
                  <p className="fieldset-label text-info font-medium mt-1 flex items-center gap-1">
                    <ShieldCheck size={12} /> Name auto-filled from your BVN record
                  </p>
                )}
                <p className="fieldset-label mt-1">Dial *565*0# on your registered line to get your BVN.</p>
              </fieldset>

              <button type="button" onClick={handleStep1} className="btn btn-primary btn-lg w-full mt-2">
                Continue <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <button type="button" onClick={() => { setStep(1); setError(''); }}
                className="btn btn-ghost btn-sm self-start gap-1 -ml-2">
                <ArrowLeft size={16} /> Back
              </button>

              <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-2xl px-4 py-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-9">
                    <span className="text-sm font-bold">{form.firstName.charAt(0)}{form.lastName.charAt(0)}</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{form.firstName} {form.lastName}</p>
                  <p className="text-xs text-base-content/60 truncate">{form.phone}</p>
                </div>
                <CheckCircle2 size={18} className="text-success shrink-0" />
              </div>

              <InputField label="Create PIN (4–6 digits)" type={showPin ? 'text' : 'password'}
                value={form.pin} onChange={(v) => update('pin', v.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                suffix={
                  <button type="button" onClick={() => setShowPin(!showPin)} className="btn btn-ghost btn-sm btn-circle">
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <InputField label="Confirm PIN" type={showPin ? 'text' : 'password'}
                value={form.confirmPin} onChange={(v) => update('confirmPin', v.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
              />
              <p className="text-xs text-base-content/50 px-1">Your PIN authorises all transactions. Keep it secret.</p>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
                {loading ? <span className="loading loading-spinner loading-sm" /> : <>Create Account <ArrowRight size={18} /></>}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-base-content/60 mt-8">
            {'Already have an account? '}
            <Link to="/login" className="link link-primary font-semibold">Sign In</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
