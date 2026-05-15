import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Bell, HelpCircle, ChevronRight,
  LogOut, Copy, Star, ShieldCheck, ShieldAlert,
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
      { icon: Star, label: 'Rate VaultBank', desc: "Tell us how we're doing" },
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

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <AppLayout title="Settings">
      <div className="max-w-md mx-auto space-y-5">

        {/* Profile card */}
        <div className="bg-gradient-to-br from-primary to-green-700 rounded-3xl p-6 text-primary-content shadow-lg">
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-primary-content/20 text-primary-content rounded-full w-16">
                <span className="text-2xl font-black">{user ? getInitials(user.firstName, user.lastName) : '?'}</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-bold">{user?.firstName} {user?.lastName}</p>
              <p className="text-primary-content/70 text-sm">{user?.phone}</p>
              <p className="text-primary-content/50 text-xs">{user?.email}</p>
            </div>
          </div>

          <div className="mt-3">
            {user?.kycVerified ? (
              <span className="badge bg-primary-content/20 text-primary-content border-0 gap-1">
                <ShieldCheck size={12} /> KYC Verified
              </span>
            ) : (
              <span className="badge bg-warning/30 text-yellow-100 border-0 gap-1">
                <ShieldAlert size={12} /> KYC Pending
              </span>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-primary-content/20 flex items-center justify-between">
            <div>
              <p className="text-primary-content/60 text-xs">Account Number</p>
              <p className="font-mono font-semibold text-sm mt-0.5">{account?.accountNumber}</p>
            </div>
            <button onClick={copyAccount} className="btn btn-ghost btn-sm text-primary-content/70 gap-1">
              <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-primary-content/20 flex justify-between text-xs text-primary-content/70">
            <span>Balance</span>
            <span className="font-bold text-primary-content">{formatCurrency(account?.balance ?? 0)}</span>
          </div>
        </div>

        {/* Menu sections */}
        {menuSections.map((section) => (
          <div key={section.title} className="card bg-base-100 shadow-sm">
            <div className="card-body p-0">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider px-5 pt-4 pb-2">{section.title}</p>
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => item.to && navigate(item.to)}
                    className={`flex items-center gap-4 px-5 py-4 hover:bg-base-200 transition-colors text-left w-full ${
                      idx < section.items.length - 1 ? 'border-b border-base-200' : ''
                    }`}
                  >
                    <div className="w-9 h-9 bg-base-200 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={17} className="text-base-content/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-base-content/50 mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-base-content/30 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button onClick={handleLogout} className="btn btn-error btn-outline w-full gap-2">
          <LogOut size={16} /> Sign Out
        </button>

        <p className="text-center text-xs text-base-content/30 pb-4">VaultBank v1.0.0 · Made in Nigeria</p>
      </div>
    </AppLayout>
  );
}
