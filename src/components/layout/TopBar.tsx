import { Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBankStore } from '../../store/bankStore';
import { getInitials } from '../../utils';

export default function TopBar({ title }: { title: string }) {
  const { user, notifications } = useBankStore();
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="navbar bg-base-100 border-b border-base-200 px-4 lg:px-6 sticky top-0 z-10 min-h-14 shadow-sm">
      <div className="navbar-start">
        <h1 className="text-base font-bold">{title}</h1>
      </div>
      <div className="navbar-end gap-1">
        <button className="btn btn-ghost btn-circle btn-sm">
          <Search size={18} />
        </button>
        <button onClick={() => navigate('/notifications')} className="btn btn-ghost btn-circle btn-sm relative">
          <Bell size={18} />
          {unread > 0 && (
            <span className="badge badge-error badge-xs absolute top-0.5 right-0.5 min-w-[14px] h-[14px] p-0 text-[9px]">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        {user && (
          <button onClick={() => navigate('/profile')} className="avatar placeholder ml-1">
            <div className="bg-primary text-primary-content rounded-full w-8">
              <span className="text-xs font-semibold">{getInitials(user.firstName, user.lastName)}</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
