'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { CalendarCheck, Clock, IndianRupee, User, MapPin } from 'lucide-react';
import { Booking, BookingStatus } from '@/types';

const STATUS_MAP: Record<BookingStatus, { label: string; cls: string }> = {
  REQUESTED: { label: 'Requested', cls: 'badge-blue' },
  ACCEPTED: { label: 'Accepted', cls: 'badge-emerald' },
  NAVIGATING: { label: 'Navigating', cls: 'badge-blue' },
  ARRIVED: { label: 'Arrived', cls: 'badge-blue' },
  IN_PROGRESS: { label: 'In Progress', cls: 'badge-amber' },
  COMPLETED: { label: 'Completed', cls: 'badge-emerald' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-red' },
};

export default function BookingsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('lumo_admin_token');
    if (!token) { router.push('/login'); return; }
    setAuthenticated(true);
  }, [router]);

  if (!authenticated) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  const mainMargin = isCollapsed ? '68px' : '240px';

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <Sidebar collapsed={isCollapsed} onToggle={setIsCollapsed} />

      <main
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: mainMargin, transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <Header title="Booking Operations" />

        <div className="flex-1 p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-white mb-1">Live Job Operations</h2>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Real-time booking FSM: REQUESTED → ACCEPTED → NAVIGATING → IN_PROGRESS → COMPLETED
              </p>
            </div>
            <span className="badge badge-blue">0 Active</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Jobs', value: '0', icon: CalendarCheck, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
              { label: 'Completed Today', value: '0', icon: Clock, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
              { label: 'Total Revenue', value: '₹0', icon: IndianRupee, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
              { label: 'Cancelled', value: '0', icon: CalendarCheck, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card p-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: s.bg }}>
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <p className="text-[22px] font-black text-white" style={{ letterSpacing: '-0.04em' }}>{s.value}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Empty State / Table */}
          {bookings.length === 0 ? (
            <div className="card p-14 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(59,130,246,0.1)' }}>
                <CalendarCheck className="w-7 h-7 text-blue-400" />
              </div>
              <p className="text-[15px] font-bold text-white mb-2">No Bookings Recorded</p>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                Real-time service job orders will appear here when customers request home services through the LUMO app.
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Professional</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Scheduled</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => {
                    const s = STATUS_MAP[b.status];
                    return (
                      <tr key={b.id}>
                        <td className="font-mono text-[11px]">{b.id.slice(0, 16)}…</td>
                        <td>
                          <div>
                            <p className="text-white font-medium text-[12px]">{b.customer_name}</p>
                            <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{b.customer_phone}</p>
                          </div>
                        </td>
                        <td className="font-medium" style={{ color: 'var(--text-secondary)' }}>{b.service_name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{b.pro_name || '—'}</td>
                        <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                        <td className="font-semibold text-white">₹{b.total_amount}</td>
                        <td className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {new Date(b.scheduled_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
