'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import {
  ShieldAlert,
  MapPin,
  PhoneCall,
  CheckCircle2,
  Clock,
  User,
  Radio,
} from 'lucide-react';
import { fetchSosAlerts, resolveSosAlert } from '@/lib/api';
import { SOSAlert } from '@/types';

export default function SafetyControlCenterPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('lumo_admin_token');
    if (!token) { router.push('/login'); return; }
    setAuthenticated(true);
    fetchSosAlerts()
      .then(data => { setSosAlerts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const handleResolve = async (id: string) => {
    try { await resolveSosAlert(id); } catch {}
    setSosAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a));
  };

  if (!authenticated) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  const mainMargin = isCollapsed ? '68px' : '240px';
  const active = sosAlerts.filter(a => a.status === 'ACTIVE');
  const resolved = sosAlerts.filter(a => a.status !== 'ACTIVE');

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <Sidebar collapsed={isCollapsed} onToggle={setIsCollapsed} />

      <main
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: mainMargin, transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <Header title="Safety Control Center" />

        <div className="flex-1 p-6 space-y-6">

          {/* ── Top Hero Banner ── */}
          <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(20,27,45,0.95) 100%)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)' }}>
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-[16px] font-extrabold text-white mb-0.5">Safety Control Center</p>
                <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                  Live emergency SOS command hub · Real-time GPS tracking · Misconduct triage pipeline
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="badge badge-red live">
                <Radio className="w-3 h-3" />
                LIVE STREAM
              </span>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active Emergencies', value: active.length, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
              { label: 'Resolved Today', value: resolved.length, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
              { label: 'Total Incidents', value: sosAlerts.length, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
            ].map(s => (
              <div key={s.label} className="card p-4">
                <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                <p className="text-[28px] font-black" style={{ color: s.value > 0 && s.label === 'Active Emergencies' ? '#EF4444' : 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Alert Feed ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                Active Emergency Alerts
              </p>
              {active.length > 0 && (
                <span className="badge badge-red live text-[10px]">{active.length} Active</span>
              )}
            </div>

            {sosAlerts.length === 0 ? (
              <div className="card p-12 text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: '#10B981' }} />
                <p className="text-[14px] font-bold text-white mb-1">All Systems Nominal</p>
                <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>No active emergency SOS alerts in the pipeline.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sosAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`rounded-2xl p-5 ${alert.status === 'ACTIVE' ? 'sos-pulse' : ''}`}
                    style={{
                      background: alert.status === 'ACTIVE'
                        ? 'linear-gradient(135deg, rgba(45,10,15,0.95) 0%, rgba(25,8,10,0.98) 100%)'
                        : 'var(--bg-elevated)',
                      border: `1px solid ${alert.status === 'ACTIVE' ? 'rgba(239,68,68,0.35)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${alert.status === 'ACTIVE' ? 'badge-red live' : 'badge-blue'}`}>
                          {alert.status}
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {alert.id.slice(0, 20)}...
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="w-3 h-3" />
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                        <span className="text-[13px] font-bold text-white">{alert.user_name || 'Unknown User'}</span>
                        <span className="badge badge-blue text-[9px]">{alert.user_role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-3.5 h-3.5 shrink-0" style={{ color: '#3B82F6' }} />
                        <span className="text-[12px] font-mono" style={{ color: 'var(--text-secondary)' }}>{alert.user_phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#EF4444' }} />
                        <span className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {alert.trigger_latitude}, {alert.trigger_longitude}
                        </span>
                      </div>
                      {alert.notes && (
                        <p className="text-[11px] mt-1 pl-5" style={{ color: 'var(--text-muted)' }}>"{alert.notes}"</p>
                      )}
                    </div>

                    {/* Action */}
                    {alert.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="w-full py-2.5 rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: 'rgba(16,185,129,0.15)',
                          border: '1px solid rgba(16,185,129,0.35)',
                          color: '#6EE7B7',
                        }}
                        onMouseEnter={e => {
                          const t = e.currentTarget;
                          t.style.background = 'rgba(16,185,129,0.25)';
                        }}
                        onMouseLeave={e => {
                          const t = e.currentTarget;
                          t.style.background = 'rgba(16,185,129,0.15)';
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
