'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { UserCheck, Star, Clock, Shield, AlertTriangle } from 'lucide-react';
import { ProfessionalProfile } from '@/types';

export default function ProfessionalsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [pros, setPros] = useState<ProfessionalProfile[]>([]);
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
        <Header title="Professional Vault" />

        <div className="flex-1 p-6 space-y-6">

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-white mb-1">Provider Directory & Verification</h2>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Multi-tier background verification, police clearance audits, and algorithmic account health tracking.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-blue">0 Registered</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Providers', value: '0', icon: UserCheck, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
              { label: 'Verified', value: '0', icon: Shield, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
              { label: 'Pending Review', value: '0', icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
              { label: 'Blacklisted', value: '0', icon: AlertTriangle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
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

          {/* Empty State */}
          {pros.length === 0 && (
            <div className="card p-14 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(59,130,246,0.1)' }}>
                <UserCheck className="w-7 h-7 text-blue-400" />
              </div>
              <p className="text-[15px] font-bold text-white mb-2">No Provider Registrations</p>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
                Newly onboarding service professionals will appear here for document verification audit and background checks.
              </p>
            </div>
          )}

          {/* Pro List */}
          {pros.length > 0 && (
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Professional</th>
                    <th>Phone</th>
                    <th>Verification</th>
                    <th>Rating</th>
                    <th>Jobs</th>
                    <th>Health</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pros.map(pro => (
                    <tr key={pro.id}>
                      <td className="text-white font-medium">{pro.full_name}</td>
                      <td className="font-mono">{pro.phone_number}</td>
                      <td>
                        <span className={`badge ${pro.verification_status === 'APPROVED' ? 'badge-emerald' : pro.verification_status === 'REJECTED' ? 'badge-red' : 'badge-amber'}`}>
                          {pro.verification_status}
                        </span>
                      </td>
                      <td>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400" />
                          {pro.rating_avg.toFixed(1)}
                        </span>
                      </td>
                      <td>{pro.total_jobs_completed}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden" style={{ minWidth: 60 }}>
                            <div className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${pro.account_health_score}%` }} />
                          </div>
                          <span className="text-[11px]">{pro.account_health_score}%</span>
                        </div>
                      </td>
                      <td>
                        {pro.is_blacklisted
                          ? <span className="badge badge-red">Blacklisted</span>
                          : <span className="badge badge-emerald">Active</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
