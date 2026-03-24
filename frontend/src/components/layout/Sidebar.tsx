import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Truck, CheckCircle, Thermometer,
  Rocket, RefreshCw, Factory, FileText, Hash, Bot, BarChart2,
  Search, Settings, LogOut, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { NAV_ITEMS } from '../../utils/constants';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, Package, Truck, CheckCircle, Thermometer,
  Rocket, RefreshCw, Factory, FileText, Hash, Bot, BarChart2,
  Search, Settings,
};

const BADGE_COLORS: Record<string, string> = {
  purple: 'bg-[rgba(212,168,71,0.18)] text-[#D4A847] border border-[rgba(212,168,71,0.3)]',
  orange: 'bg-[rgba(249,115,22,0.15)] text-[#f97316] border border-[rgba(249,115,22,0.3)]',
  red: 'bg-[rgba(239,68,68,0.15)] text-[#ef4444] border border-[rgba(239,68,68,0.3)]',
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'RM';

  const NavContent = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(212,168,71,0.1)' }}>
        <img
          src="/golden_blue_logo.png"
          alt="Logo"
          className="w-12 h-12 rounded-lg flex-shrink-0 object-contain bg-white/90 p-0.5"
        />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="font-display font-700 text-base leading-tight">
              <span className="text-white">Quantum</span>{' '}
              <span style={{ color: 'var(--accent-gold)' }}>Invenza</span>
            </div>
          </div>
        )}
        {/* Mobile close button */}
        <button
          onClick={closeMobileSidebar}
          className="ml-auto text-white/40 hover:text-white transition-colors lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin">
        {NAV_ITEMS.map((section) => (
          <div key={section.section} className="mb-1">
            {!collapsed && (
              <div className="px-4 py-2 text-[10px] font-semibold tracking-widest text-white/25 uppercase">
                {section.section}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = ICON_MAP[item.icon];
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 mx-2 mb-0.5 rounded-md transition-all relative group ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-white/50 hover:text-white/80'
                    } ${collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2'}`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { background: 'var(--sidebar-active)', borderLeft: '2.5px solid var(--sidebar-active-bar)' }
                      : { borderLeft: '2.5px solid transparent' }
                  }
                >
                  {({ isActive }) => (
                    <>
                      {Icon && (
                        <Icon
                          size={16}
                          className={isActive ? 'text-[#D4A847]' : 'text-white/40 group-hover:text-white/60'}
                        />
                      )}
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-sm truncate">{item.label}</span>
                          {item.badge && item.badgeColor && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${BADGE_COLORS[item.badgeColor]}`}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4" style={{ borderTop: '1px solid rgba(212,168,71,0.1)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #D4A847, #f97316)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{user?.name ?? 'Rahul Mehta'}</div>
              <div className="text-white/35 text-[10px] truncate">{user?.role?.replace('_', ' ') ?? 'QA Manager'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/30 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen flex-col transition-all duration-300 z-40 hidden lg:flex"
        style={{
          width: sidebarCollapsed ? '64px' : '264px',
          background: 'linear-gradient(180deg, #112D4E 0%, #0A1F38 100%)',
          borderRight: '1px solid rgba(212,168,71,0.12)',
        }}
      >
        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-14 w-6 h-6 rounded-full flex items-center justify-center border border-[rgba(212,168,71,0.2)] bg-[#0A1628] text-[#D4A847]/60 hover:text-[#D4A847] z-50"
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
        <NavContent collapsed={sidebarCollapsed} />
      </aside>

      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className="fixed left-0 top-0 h-screen flex flex-col z-50 transition-transform duration-300 lg:hidden"
        style={{
          width: '264px',
          background: 'linear-gradient(180deg, #112D4E 0%, #0A1F38 100%)',
          borderRight: '1px solid rgba(212,168,71,0.12)',
          transform: mobileSidebarOpen ? 'translateX(0)' : 'translateX(-264px)',
        }}
      >
        <NavContent collapsed={false} />
      </aside>
    </>
  );
}
