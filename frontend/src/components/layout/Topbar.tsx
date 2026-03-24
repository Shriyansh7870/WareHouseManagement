import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useThemeStore } from '../../store/themeStore';
import NotificationDropdown from './NotificationDropdown';
import { useNotificationStore } from '../../store/notificationStore';
import GlobalSearch from '../ui/GlobalSearch';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/inventory': 'Inventory Ledger',
  '/grn': 'Goods Receipt (GRN)',
  '/qa': 'Quality Assurance',
  '/cold-chain': 'Cold Chain Monitoring',
  '/dispatch': 'Dispatch / Delivery Orders',
  '/returns': 'Returns (RMA)',
  '/vendors': 'Vendor Master',
  '/documents': 'Document Management',
  '/cycle-count': 'Cycle Count',
  '/ai-analytics': 'AI Analytics Engine',
  '/reports': 'Reports',
  '/audit': 'Audit Trail',
  '/settings': 'Settings',
};

interface StatusChip {
  label: string;
  color: 'red' | 'orange' | 'green' | 'purple';
  pulse?: boolean;
}

const STATUS_CHIPS: StatusChip[] = [
  { label: '4 Expiry Alerts', color: 'red', pulse: true },
  { label: '2 Open CAPAs', color: 'orange', pulse: true },
  { label: 'GMP Compliant', color: 'green' },
  { label: '3 Pending Dispatch', color: 'purple' },
];

const CHIP_STYLES: Record<string, string> = {
  red: 'bg-red-50 text-red-600 border-red-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

const DOT_COLORS: Record<string, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
};

export default function Topbar() {
  const { pathname } = useLocation();
  const { sidebarCollapsed, toggleMobileSidebar } = useUIStore();
  const { dark, toggle: toggleDark } = useThemeStore();
  const title = PAGE_TITLES[pathname] ?? 'Quantum Invenza';
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = useNotificationStore(s => s.notifications.filter(n => !n.read).length);

  return (
    <header
      className="sidebar-offset fixed top-0 right-0 z-30 flex items-center justify-between px-4 lg:px-5"
      style={{
        left: 0,
        background: 'var(--surface)',
        height: '60px',
        borderBottom: '1px solid var(--border)',
        transition: 'margin-left 0.3s',
        ['--sidebar-offset' as string]: sidebarCollapsed ? '64px' : '264px',
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobileSidebar}
          className="text-gray-400 hover:text-gray-600 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display font-bold text-[16.5px]" style={{ color: 'var(--text)' }}>
          {title}
        </h1>
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2 justify-end">
        <div className="hidden md:flex items-center gap-2 flex-wrap">
        {STATUS_CHIPS.map((chip) => (
          <span
            key={chip.label}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${CHIP_STYLES[chip.color]}`}
          >
            {chip.pulse ? (
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${DOT_COLORS[chip.color]}`}
                />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${DOT_COLORS[chip.color]}`} />
              </span>
            ) : (
              <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[chip.color]}`} />
            )}
            {chip.label}
          </span>
        ))}
        </div>
        <button onClick={toggleDark} className="text-gray-400 hover:text-gray-600 transition-colors" title="Toggle dark mode">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="relative">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="ml-2 text-gray-400 hover:text-gray-600 relative"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          <NotificationDropdown open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
      </div>
    </header>
  );
}
