'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  UserCheck, 
  CalendarCheck, 
  Settings, 
  LogOut, 
  Layers,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  Radio
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, short: 'Dash' },
  { name: 'Safety Control', href: '/safety-control-center', icon: ShieldAlert, badge: 'LIVE', short: 'SCC' },
  { name: 'Professional Vault', href: '/professionals', icon: UserCheck, short: 'Pros' },
  { name: 'Service Catalog', href: '/services', icon: Layers, short: 'Svc' },
  { name: 'Booking Ops', href: '/bookings', icon: CalendarCheck, short: 'Jobs' },
  { name: 'Settings', href: '/settings', icon: Settings, short: 'Cfg' },
];

export default function Sidebar({ 
  collapsed, 
  onToggle 
}: { 
  collapsed?: boolean; 
  onToggle?: (collapsed: boolean) => void 
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lumo_sidebar_collapsed');
      const parsed = saved !== null ? JSON.parse(saved) : false;
      setIsCollapsed(parsed);
      if (onToggle) onToggle(parsed);
    }
  }, []);

  const toggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (onToggle) onToggle(next);
    localStorage.setItem('lumo_sidebar_collapsed', JSON.stringify(next));
  };

  return (
    <aside
      style={{
        width: isCollapsed ? '68px' : '240px',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      className="sidebar"
    >
      {/* ── Brand ── */}
      <div className="flex items-center h-[60px] px-4 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}>
        {/* Logo Icon */}
        <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)', boxShadow: '0 4px 12px rgba(59,130,246,0.4)' }}>
          <Zap className="w-4 h-4 text-white" />
        </div>

        {/* Brand Text */}
        {!isCollapsed && (
          <div className="ml-2.5 overflow-hidden">
            <p className="text-[14px] font-extrabold text-white tracking-tight leading-none">LUMO</p>
            <p className="text-[10px] mt-0.5 font-semibold tracking-widest uppercase"
              style={{ color: 'var(--text-muted)' }}>Admin Portal</p>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={toggle}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          className="ml-auto p-1.5 rounded-lg transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => {
            (e.target as HTMLElement).style.background = 'var(--bg-hover)';
            (e.target as HTMLElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.background = 'transparent';
            (e.target as HTMLElement).style.color = 'var(--text-muted)';
          }}
        >
          {isCollapsed 
            ? <PanelLeftOpen className="w-4 h-4" />
            : <PanelLeftClose className="w-4 h-4" />
          }
        </button>
      </div>

      {/* ── Nav Label ── */}
      {!isCollapsed && (
        <div className="px-4 pt-5 pb-1.5">
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
            Navigation
          </p>
        </div>
      )}

      {/* ── Navigation Items ── */}
      <nav className="flex-1 px-3 pt-2 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              style={{ padding: isCollapsed ? '10px 0' : undefined }}
            >
              <Icon className="shrink-0 w-[18px] h-[18px]" />
              
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge && (
                    <span className="badge badge-red live text-[9px] px-1.5 py-px">
                      <Radio className="w-2 h-2" />
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {isCollapsed && item.badge && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 dot-pulse"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 pb-4 pt-3 mt-auto border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        {/* System Status */}
        {!isCollapsed && (
          <div className="mb-3 px-3 py-2.5 rounded-xl"
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse" />
              <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>All Systems Operational</span>
            </div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Gateway: Port 8000 · 10 services</p>
          </div>
        )}

        {/* User Row */}
        <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #334155, #1E293B)', border: '1px solid var(--border-default)' }}>
            SA
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <p className="text-[12px] font-semibold text-white truncate">Super Admin</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>+919999999999</p>
              </div>
              <Link
                href="/login"
                title="Sign Out"
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { (e.target as HTMLElement).closest('a')!.style.color = '#F87171'; (e.target as HTMLElement).closest('a')!.style.background = 'rgba(239,68,68,0.08)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).closest('a')!.style.color = 'var(--text-muted)'; (e.target as HTMLElement).closest('a')!.style.background = 'transparent'; }}
              >
                <LogOut className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
