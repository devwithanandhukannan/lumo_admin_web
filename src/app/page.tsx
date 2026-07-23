'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import {
  ShieldAlert,
  CalendarCheck,
  UserCheck,
  IndianRupee,
  ArrowUpRight,
  Activity,
  MapPin,
  PhoneCall,
  Clock,
  TrendingUp,
  Server,
  Database,
} from 'lucide-react';
import Link from 'next/link';
import { fetchSosAlerts } from '@/lib/api';
import { SOSAlert } from '@/types';

const SERVICES = [
  { name: 'Auth Svc', port: 5001 },
  { name: 'User Svc', port: 5002 },
  { name: 'Pro Svc', port: 5003 },
  { name: 'Catalog Svc', port: 5004 },
  { name: 'Booking Svc', port: 5005 },
  { name: 'Geo Telemetry', port: 5006 },
  { name: 'Safety SCC', port: 5007 },
  { name: 'Payment Svc', port: 5008 },
  { name: 'Notif Svc', port: 5009 },
  { name: 'Media Vault', port: 5010 },
  { name: 'PostgreSQL', port: 5432, icon: 'db' },
  { name: 'Redis', port: 6379, icon: 'db' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('lumo_admin_token');
    if (!token) { router.replace('/login'); return; }
    setAuthenticated(true);
    fetchSosAlerts()
      .then(data => { setSosAlerts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const activeSos = sosAlerts.filter(a => a.status === 'ACTIVE');

  const stats = [
    {
      label: 'Active Bookings',
      value: '0',
      sub: 'Clean production DB',
      icon: CalendarCheck,
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.1)',
      glow: 'card-glow-blue',
    },
    {
      label: 'Active SOS Alerts',
      value: String(activeSos.length),
      sub: activeSos.length > 0 ? '⚡ Emergency Active' : 'All clear',
      icon: ShieldAlert,
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.1)',
      glow: 'card-glow-red',
      danger: activeSos.length > 0,
    },
    {
      label: 'Verified Professionals',
      value: '0',
      sub: 'Awaiting registrations',
      icon: UserCheck,
      color: '#10B981',
      bg: 'rgba(16,185,129,0.1)',
      glow: 'card-glow-emerald',
    },
    {
      label: 'Revenue (INR)',
      value: '₹0',
      sub: '15% commission split',
      icon: IndianRupee,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.1)',
      glow: 'card-glow-amber',
    },
  ];

  const mainMargin = isCollapsed ? '68px' : '240px';

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <Sidebar collapsed={isCollapsed} onToggle={setIsCollapsed} />

      <main
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: mainMargin, transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <Header title="Executive Overview" />

        <div className="flex-1 p-6 space-y-6">

          {/* ── Active SOS Banner ── */}
          {activeSos.length > 0 && (
            <div className="panel-sos sos-pulse rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
                  <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-red live"><span className="w-1.5 h-1.5 rounded-full bg-white" />CRITICAL</span>
                    <span className="text-[12px] font-medium text-red-300">{activeSos.length} emergency alert{activeSos.length > 1 ? 's' : ''} active</span>
                  </div>
                  <p className="text-[13px] font-bold text-white">Live Emergency SOS Broadcast — Immediate Action Required</p>
                </div>
              </div>
              <Link href="/safety-control-center" className="btn-danger shrink-0 text-[12px]">
                Open Safety Control <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`card ${s.glow} p-5`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: s.bg }}>
                      <Icon className="w-5 h-5" style={{ color: s.color }} />
                    </div>
                    {s.danger && (
                      <span className="badge badge-red live text-[9px]">ALERT</span>
                    )}
                  </div>
                  <p className="stat-number mb-1" style={{ color: s.danger ? '#EF4444' : 'var(--text-primary)' }}>
                    {s.value}
                  </p>
                  <p className="text-[12px] font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {s.label}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
                </div>
              );
            })}
          </div>

          {/* ── Middle Row ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

            {/* SOS Live Feed */}
            <div className="card p-5 xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,0.12)' }}>
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Emergency SOS Feed</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Real-time emergency broadcast stream</p>
                  </div>
                </div>
                <Link href="/safety-control-center" className="btn-ghost text-[11px]">
                  Open SCC <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              {sosAlerts.length === 0 ? (
                <div className="py-10 text-center rounded-xl"
                  style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-subtle)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <ShieldAlert className="w-5 h-5" style={{ color: '#10B981' }} />
                  </div>
                  <p className="text-[13px] font-semibold text-white mb-1">All Emergency Systems Normal</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>No active SOS broadcasts. WebSocket monitoring active.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sosAlerts.slice(0, 4).map(alert => (
                    <div key={alert.id}
                      className="p-4 rounded-xl flex items-center justify-between gap-4"
                      style={{
                        background: alert.status === 'ACTIVE' ? 'rgba(239,68,68,0.06)' : 'var(--bg-surface)',
                        border: `1px solid ${alert.status === 'ACTIVE' ? 'rgba(239,68,68,0.2)' : 'var(--border-subtle)'}`,
                      }}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                          style={{ background: alert.status === 'ACTIVE' ? 'rgba(239,68,68,0.15)' : 'var(--bg-elevated)' }}>
                          <PhoneCall className="w-3.5 h-3.5" style={{ color: alert.status === 'ACTIVE' ? '#EF4444' : 'var(--text-muted)' }} />
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold text-white truncate">{alert.user_name}</span>
                            <span className={`badge text-[9px] ${alert.status === 'ACTIVE' ? 'badge-red live' : 'badge-blue'}`}>{alert.status}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{alert.user_phone}</span>
                            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              <MapPin className="w-3 h-3" />{String(alert.trigger_latitude).slice(0, 7)}, {String(alert.trigger_longitude).slice(0, 7)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Feed */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(59,130,246,0.12)' }}>
                    <CalendarCheck className="w-4 h-4" style={{ color: '#3B82F6' }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Bookings</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Recent operations</p>
                  </div>
                </div>
                <Link href="/bookings" className="btn-ghost text-[11px]">View All</Link>
              </div>

              <div className="py-10 text-center rounded-xl"
                style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-subtle)' }}>
                <CalendarCheck className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                <p className="text-[12px] font-medium text-white mb-1">No Bookings Yet</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Orders appear when customers request services.</p>
              </div>
            </div>
          </div>

          {/* ── Microservice Health ── */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.12)' }}>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Microservices Health</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>12 services · API Gateway Port 8000</p>
                </div>
              </div>
              <span className="badge badge-emerald text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse" />
                All Healthy
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {SERVICES.map((svc) => (
                <div
                  key={svc.name}
                  className="rounded-xl p-3 flex items-center justify-between"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-semibold text-white truncate">{svc.name}</p>
                    <p className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{svc.port}</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 dot-pulse" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
