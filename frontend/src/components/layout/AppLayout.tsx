import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUIStore } from '../../store/uiStore';
import { useExpiryAlerts } from '../../hooks/useExpiryAlerts';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import OnboardingTour, { useOnboardingTour } from '../ui/OnboardingTour';

const SHORTCUTS = [
  { key: 'D', label: 'Dashboard' },
  { key: 'I', label: 'Inventory' },
  { key: 'G', label: 'GRN' },
  { key: 'Q', label: 'Quality Assurance' },
  { key: 'C', label: 'Cold Chain' },
  { key: 'P', label: 'Dispatch' },
  { key: 'V', label: 'Vendors' },
  { key: 'R', label: 'Reports' },
  { key: 'A', label: 'Audit Trail' },
  { key: '?', label: 'Show this help' },
];

function ShortcutsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <h3 className="text-base font-bold text-gray-900 mb-4">Keyboard Shortcuts</h3>
        <div className="space-y-2">
          {SHORTCUTS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{label}</span>
              <kbd className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 font-mono text-xs text-gray-700">{key}</kbd>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">Shortcuts are disabled when typing in inputs.</p>
        <button
          onClick={onClose}
          className="mt-4 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { sidebarCollapsed } = useUIStore();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { show: showTour, dismiss: dismissTour } = useOnboardingTour();
  useExpiryAlerts();
  useKeyboardShortcuts();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '?') { setShowShortcuts(s => !s); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const sidebarOffset = sidebarCollapsed ? '64px' : '264px';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div
        className="sidebar-offset flex flex-col flex-1 min-w-0"
        style={{ ['--sidebar-offset' as string]: sidebarOffset } as React.CSSProperties}
      >
        <Topbar />
        <main
          className="flex-1 overflow-y-auto"
          style={{ marginTop: '60px', padding: '24px' }}
        >
          <Outlet />
        </main>
      </div>
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
      {showTour && <OnboardingTour onDismiss={dismissTour} />}
    </div>
  );
}
