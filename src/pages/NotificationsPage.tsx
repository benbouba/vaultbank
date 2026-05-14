import { Bell, CheckCheck } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useBankStore } from '../store/bankStore';
import { formatDateTime } from '../utils';
import type { Notification } from '../types';

const TYPE_CONFIG: Record<Notification['type'], { color: string; bg: string }> = {
  transaction: { color: 'text-green-600', bg: 'bg-green-50' },
  promo: { color: 'text-purple-600', bg: 'bg-purple-50' },
  security: { color: 'text-red-600', bg: 'bg-red-50' },
  system: { color: 'text-blue-600', bg: 'bg-blue-50' },
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useBankStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout title="Notifications">
      <div className="max-w-2xl mx-auto space-y-4">
        {unread > 0 && (
          <div className="flex justify-end">
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1.5 text-xs text-green-600 font-semibold hover:underline"
            >
              <CheckCheck size={14} /> Mark all as read
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type];
                return (
                  <button
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`w-full flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50 ${!n.read ? 'bg-green-50/40' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <Bell size={14} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.date)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
