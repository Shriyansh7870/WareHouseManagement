import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, AlertTriangle, Info, Package, Thermometer, FileText, Rocket } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { formatDateTime } from '../../utils/formatters';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  expiry: <Package size={13} className="text-red-500" />,
  capa: <AlertTriangle size={13} className="text-orange-500" />,
  excursion: <Thermometer size={13} className="text-teal-500" />,
  grn: <FileText size={13} className="text-blue-500" />,
  dispatch: <Rocket size={13} className="text-purple-500" />,
  system: <Info size={13} className="text-gray-400" />,
};

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-orange-500',
  info: 'bg-blue-400',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { notifications, markRead, markAllRead, clearAll } = useNotificationStore();
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
      style={{ boxShadow: 'var(--shadow-lg)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-gray-600" />
          <span className="font-semibold text-sm text-gray-800">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-[#D4A847] text-white px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-[#D4A847] hover:underline flex items-center gap-1">
              <Check size={11} /> Mark all read
            </button>
          )}
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">No notifications</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => { markRead(n.id); if (n.link) { navigate(n.link); onClose(); } }}
              className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-purple-50/40' : ''}`}
            >
              <div className="flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-800">{n.title}</span>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${SEVERITY_DOT[n.severity]}`} />
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#D4A847] flex-shrink-0 ml-auto" />}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
