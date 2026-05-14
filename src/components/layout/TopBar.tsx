import { Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBankStore } from '../../store/bankStore';
import { getInitials } from '../../utils';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { user, notifications } = useBankStore();
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
          <Search size={18} />
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {user && (
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-semibold"
          >
            {getInitials(user.firstName, user.lastName)}
          </button>
        )}
      </div>
    </header>
  );
}
