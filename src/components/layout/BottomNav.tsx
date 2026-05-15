import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Smartphone, PiggyBank, ReceiptText } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/transfer',  icon: ArrowLeftRight,  label: 'Transfer' },
  { to: '/airtime',   icon: Smartphone,      label: 'Airtime' },
  { to: '/savings',   icon: PiggyBank,       label: 'Savings' },
  { to: '/transactions', icon: ReceiptText,  label: 'History' },
];

export default function BottomNav() {
  return (
    <nav className="btm-nav btm-nav-sm lg:hidden z-20 border-t border-base-200">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to}>
          {({ isActive }) => (
            <button className={`flex flex-col items-center gap-0.5 ${isActive ? 'active text-primary' : 'text-base-content/50'}`}>
              <Icon size={20} />
              <span className="btm-nav-label text-[10px] font-medium">{label}</span>
            </button>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
