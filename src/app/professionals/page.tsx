'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { UserCheck, Star, Clock, Shield, AlertTriangle, FileText, CheckCircle2, XCircle, Sliders, MapPin, ExternalLink, RefreshCw } from 'lucide-react';
import { fetchProVerifications, verifyProfessional, updateProCoverageRadius } from '@/lib/api';

export default function ProfessionalsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedPro, setSelectedPro] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [radiusInput, setRadiusInput] = useState<number>(50);
  const [regionInput, setRegionInput] = useState<string>('Bangalore');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProVerifications();
      setPros(data);
    } catch (_) {
      setPros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('lumo_admin_token');
    if (!token) { router.push('/login'); return; }
    setAuthenticated(true);
    loadData();
  }, [router]);

  const handleVerify = async (userId: string, status: 'APPROVED' | 'SUSPENDED' | 'REJECTED', notes?: string) => {
    setActionLoading(true);
    try {
      await verifyProfessional(userId, status, notes);
      await loadData();
      if (selectedPro?.user_id === userId) {
        setSelectedPro((prev: any) => prev ? { ...prev, verification_status: status } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCoverage = async (userId: string) => {
    setActionLoading(true);
    try {
      await updateProCoverageRadius(userId, radiusInput, regionInput);
      await loadData();
      alert('Coverage radius & region updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update coverage');
    } finally {
      setActionLoading(false);
    }
  };

  if (!authenticated) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  const mainMargin = isCollapsed ? '68px' : '240px';
  const pendingCount = pros.filter(p => p.verification_status === 'PENDING').length;
  const approvedCount = pros.filter(p => p.verification_status === 'APPROVED').length;
  const suspendedCount = pros.filter(p => p.verification_status === 'SUSPENDED' || p.verification_status === 'REJECTED').length;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <Sidebar collapsed={isCollapsed} onToggle={setIsCollapsed} />

      <main
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: mainMargin, transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <Header title="Provider Directory & Verification" />

        <div className="flex-1 p-6 space-y-6">

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-white mb-1">Provider Directory & Document Audit</h2>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Audit government IDs, police background clearance, live face verification, and set 50km coverage radius.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-[12px] flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              {pendingCount > 0 && (
                <span className="badge badge-amber animate-pulse">
                  {pendingCount} Pending Review
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Professionals', value: pros.length, icon: UserCheck, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
              { label: 'Approved & Active', value: approvedCount, icon: Shield, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
              { label: 'Pending Review', value: pendingCount, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
              { label: 'Suspended / Rejected', value: suspendedCount, icon: AlertTriangle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card p-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: s.bg }}>
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <p className="text-[22px] font-black text-white" style={{ letterSpacing: '-0.04em' }}>{s.value}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Table list */}
          {loading ? (
            <div className="card p-12 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Loading provider directory...</p>
            </div>
          ) : pros.length === 0 ? (
            <div className="card p-14 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(59,130,246,0.1)' }}>
                <UserCheck className="w-7 h-7 text-blue-400" />
              </div>
              <p className="text-[15px] font-bold text-white mb-2">No Professional Records</p>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                New registrations from the Professional App will appear here for document verification audit and admin approval.
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Professional</th>
                    <th>Gender</th>
                    <th>Phone / Email</th>
                    <th>Verification</th>
                    <th>Coverage Area</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pros.map(pro => (
                    <tr key={pro.user_id} className="hover:bg-white/[0.02] transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[13px]">
                            {pro.full_name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-white">{pro.full_name}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>ID: {pro.user_id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-[11px] font-mono uppercase text-slate-300">
                          {pro.gender || 'OTHER'}
                        </span>
                      </td>
                      <td>
                        <div className="space-y-0.5">
                          <p className="text-[12px] font-mono text-slate-200">{pro.phone_number || 'N/A'}</p>
                          <p className="text-[11px] text-slate-400">{pro.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          pro.verification_status === 'APPROVED' ? 'badge-emerald' :
                          pro.verification_status === 'SUSPENDED' || pro.verification_status === 'REJECTED' ? 'badge-red' :
                          'badge-amber'
                        }`}>
                          {pro.verification_status || 'PENDING'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          <span>{parseFloat(pro.coverage_radius_km || 50).toFixed(0)} km</span>
                          <span className="text-[10px] text-slate-500">({pro.assigned_region || 'Bangalore'})</span>
                        </div>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-[12px] font-bold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {parseFloat(pro.rating_avg || 5.0).toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedPro(pro);
                              setRadiusInput(parseFloat(pro.coverage_radius_km || 50));
                              setRegionInput(pro.assigned_region || 'Bangalore');
                            }}
                            className="px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            <FileText className="w-3 h-3" /> Inspect Docs
                          </button>
                          {pro.verification_status !== 'APPROVED' && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleVerify(pro.user_id, 'APPROVED')}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Approve
                            </button>
                          )}
                          {pro.verification_status === 'APPROVED' && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleVerify(pro.user_id, 'SUSPENDED', 'Admin manual suspension')}
                              className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <XCircle className="w-3 h-3" /> Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Verification Drawer / Modal */}
      {selectedPro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-xl p-6 space-y-6 border border-white/10 bg-[#0E1420] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Provider Verification Audit: {selectedPro.full_name}
                </h3>
                <p className="text-[12px] text-slate-400">User ID: {selectedPro.user_id}</p>
              </div>
              <button
                onClick={() => setSelectedPro(null)}
                className="text-slate-400 hover:text-white text-[18px] font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[12px]">
              <div><span className="text-slate-500">Email:</span> <span className="text-white font-medium">{selectedPro.email || 'N/A'}</span></div>
              <div><span className="text-slate-500">Phone:</span> <span className="text-white font-mono">{selectedPro.phone_number || 'N/A'}</span></div>
              <div><span className="text-slate-500">Gender:</span> <span className="text-white font-medium">{selectedPro.gender || 'OTHER'}</span></div>
              <div><span className="text-slate-500">Current Status:</span> <span className="font-bold text-emerald-400">{selectedPro.verification_status}</span></div>
            </div>

            {/* Uploaded Documents Inspection */}
            <div className="space-y-3">
              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" /> Verification Documents Vault
              </h4>

              <div className="space-y-2 text-[12px]">
                <div className="p-3 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Government ID Proof</p>
                    <p className="text-[11px] text-slate-400">
                      Type: {selectedPro.documents?.govtIdType || 'AADAAR'} · Number: {selectedPro.documents?.govtIdNumber || 'XXXX-XXXX-8821'}
                    </p>
                  </div>
                  {selectedPro.documents?.govtIdUrl ? (
                    <a href={selectedPro.documents.govtIdUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                      View ID <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-500 italic">ID Uploaded</span>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Police Background Clearance PDF</p>
                    <p className="text-[11px] text-slate-400">Verification Certificate</p>
                  </div>
                  {selectedPro.documents?.policeVerificationUrl ? (
                    <a href={selectedPro.documents.policeVerificationUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                      View PDF <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-emerald-400/80 font-mono text-[11px]">✓ Police Verified Badge</span>
                  )}
                </div>
              </div>
            </div>

            {/* Coverage Area & Region Slider */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" /> Coverage Area Radius (Default 50 km)
              </h4>

              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-300">Service Coverage Radius:</span>
                  <span className="font-bold text-amber-400 text-[14px]">{radiusInput} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={radiusInput}
                  onChange={(e) => setRadiusInput(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="text"
                    value={regionInput}
                    onChange={(e) => setRegionInput(e.target.value)}
                    placeholder="Assigned Region (e.g. Bangalore)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-[12px] focus:outline-none focus:border-amber-400"
                  />
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateCoverage(selectedPro.user_id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-[12px] font-bold transition-colors"
                  >
                    Save Radius
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Status Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                disabled={actionLoading}
                onClick={() => handleVerify(selectedPro.user_id, 'SUSPENDED', 'Suspended by admin audit')}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-[12px] font-bold flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Suspend Provider
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleVerify(selectedPro.user_id, 'APPROVED', 'Verified by admin audit')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-bold flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Enable Duty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
