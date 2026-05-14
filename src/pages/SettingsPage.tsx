import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Bell,
  HelpCircle,
  ChevronRight,
  LogOut,
  Copy,
  Star,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useBankStore } from '../store/bankStore';
import { formatCurrency, getInitials } from '../utils';
import { useState } from 'react';

const menuSections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Personal Information', desc: 'Update your profile details' },
      { icon: Shield, label: 'Security', desc: 'PIN, biometrics, 2FA' },
      { icon: Bell, label: 'Notifications', desc: 'Manage notification preferences', to: '/notifications' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & Support', desc: 'FAQs and customer care' },
      { icon: Star, label: 'Rate VaultBank', desc: 'Tell us how we\'re doing' },
    ],
  },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, account, logout } = useBankStore();
  const [copied, setCopied] = useState(false);

  const copyAccount = () => {
    if (account) {
      navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppLayout title="Settings">
      <div className="max-w-md mx-auto space-y-5">
        {/* Profile card */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-black">
              {user ? getInitials(user.firstName, user.lastName) : '?'}
            </div>
            <div>
              <p className="text-lg font-bold">{user?.firstName} {user?.lastName}</p>
              <p className="text-green-100 text-sm">{user?.phone}</p>
              <p className="text-green-200 text-xs">{user?.email}</p>
            </div>
          </div>
          {/* KYC badge */}
          <div className="mt-3 flex items-center gap-2">
            {user?.kycVerified ? (
              <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                <ShieldCheck size={12} /> KYC Verified
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-yellow-400/30 text-yellow-100 px-3 py-1 rounded-full text-xs font-semibold">
                <ShieldAlert size={12} /> KYC Pending
              </span>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <div>
              <p className="text-green-200 text-xs">Account Number</p>
              <p className="font-mono font-semibold text-sm mt-0.5">{account?.accountNumber}</p>
            </div>
            <button onClick={copyAccount} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-xs font-medium transition-colors">
              <Copy size={12} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* BVN & KYC */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Identity Verification</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                user?.kycVerified ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                {user?.kycVerified
                  ? <ShieldCheck size={16} className="text-green-600" />
                  : <ShieldAlert size={16} className="text-yellow-600" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">BVN Verification</p>
                <p className="text-xs text-gray-500">
                  {user?.bvn
                    ? `BVN: ****${user.bvn.slice(-3)}`
                    : 'Not yet verified'}
                </p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              user?.kycVerified
                ? 'bg-green-50 text-green-700'
                : 'bg-yellow-50 text-yellow-700'
            }`}>
              {user?.kycVerified ? 'Verified' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Balance summary */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Available Balance</p>
          <p className="text-2xl font-black text-gray-900">{formatCurrency(account?.balance ?? 0)}</p>
        </div>

        {/* Menu sections */}
        {menuSections.map((section) => (
          <div key={section.title} className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-5 pt-4 pb-2">{section.title}</p>
            <div className="divide-y divide-gray-50">
              {section.items.map(({ icon: Icon, label, desc, to }) => (
                <button
                  key={label}
                  onClick={() => to && navigate(to)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-gray-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={() => logout().then(() => navigate('/login'))}
          className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-4 rounded-3xl transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>

        <p className="text-center text-xs text-gray-400 pb-2">VaultBank v1.0.0 · Made with ❤️</p>
      </div>
    </AppLayout>
  );
}
