import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Smartphone,
  PiggyBank,
  ReceiptText,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/transfer', icon: ArrowLeftRight, label: 'Transfer' },
  { to: '/airtime', icon: Smartphone, label: 'Airtime' },
  { to: '/savings', icon: PiggyBank, label: 'Savings' },
  { to: '/transactions', icon: ReceiptText, label: 'History' },
];

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors text-xs font-medium ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-green-50' : ''
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
