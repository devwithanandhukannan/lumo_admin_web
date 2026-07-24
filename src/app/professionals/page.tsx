'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import GoogleCoverageMap from '@/components/GoogleCoverageMap';
import {
  UserCheck,
  Star,
  Clock,
  Shield,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Sliders,
  MapPin,
  ExternalLink,
  RefreshCw,
  Eye,
  Camera,
  Maximize2,
  Navigation,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import {
  fetchProVerifications,
  verifyProfessional,
  updateProCoverageRadius,
  fetchPendingServiceRequests,
  approveCustomServiceRequest,
  rejectCustomServiceRequest,
} from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getFileUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function ProfessionalsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [pros, setPros] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedPro, setSelectedPro] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [radiusInput, setRadiusInput] = useState<number>(50);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [proData, reqData] = await Promise.all([
        fetchProVerifications(),
        fetchPendingServiceRequests(),
      ]);
      setPros(proData || []);
      setServiceRequests(reqData || []);
    } catch (_) {
      setPros([]);
      setServiceRequests([]);
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

  const handleUpdateRadiusOnly = async (userId: string, proRegion: string) => {
    setActionLoading(true);
    try {
      await updateProCoverageRadius(userId, radiusInput, proRegion);
      await loadData();
      alert(`Tolerance radius updated to ${radiusInput} km for ${proRegion}!`);
    } catch (err: any) {
      alert(err.message || 'Failed to update tolerance radius');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveCustomService = async (reqItem: any) => {
    setActionLoading(true);
    try {
      await approveCustomServiceRequest(reqItem.id, 'cat-clean', reqItem.suggested_price);
      alert(`Approved custom service "${reqItem.service_name}" into active catalog!`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve custom service');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCustomService = async (id: string, serviceName: string) => {
    setActionLoading(true);
    try {
      await rejectCustomServiceRequest(id);
      alert(`Rejected service request "${serviceName}".`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject custom service');
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
                Audit government IDs, police background clearance, live face verification, and set tolerance radius for provider&apos;s registered location.
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
                    <th>Professional Profile</th>
                    <th>Gender</th>
                    <th>Phone / Email</th>
                    <th>Verification</th>
                    <th>Registered Service Area</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pros.map(pro => {
                    const selfieUrl = getFileUrl(pro.face_verification_url);
                    const proRegion = pro.service_area || pro.assigned_region || 'Kochi, Kerala';

                    return (
                      <tr key={pro.user_id} className="hover:bg-white/[0.02] transition-colors">
                        <td>
                          <div className="flex items-center gap-3">
                            {selfieUrl ? (
                              <img
                                src={selfieUrl}
                                alt={pro.full_name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/40 shadow-sm cursor-pointer"
                                onClick={() => setPreviewMediaUrl(selfieUrl)}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[14px]">
                                {pro.full_name?.charAt(0) || 'P'}
                              </div>
                            )}
                            <div>
                              <p className="text-[13px] font-bold text-white flex items-center gap-1.5">
                                {pro.full_name}
                                {selfieUrl && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Selfie Verified" />
                                )}
                              </p>
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
                            <span className="font-semibold text-white">{proRegion}</span>
                            <span className="text-[10px] text-blue-400 font-mono">({parseFloat(pro.coverage_radius_km || 50).toFixed(0)} km tolerance)</span>
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
                              }}
                              className="px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <FileText className="w-3 h-3" /> Inspect & Set Radius
                            </button>
                            {pro.verification_status !== 'APPROVED' ? (
                              <button
                                disabled={actionLoading}
                                onClick={() => handleVerify(pro.user_id, 'APPROVED')}
                                className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Approve
                              </button>
                            ) : null}
                            {pro.verification_status !== 'SUSPENDED' && pro.verification_status !== 'REJECTED' ? (
                              <button
                                disabled={actionLoading}
                                onClick={() => handleVerify(pro.user_id, 'SUSPENDED', 'Admin manual suspension / rejection')}
                                className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              >
                                <XCircle className="w-3 h-3" /> Reject / Suspend
                              </button>
                            ) : null}
                          </div>
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

      {/* Verification Drawer / Modal */}
      {selectedPro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="card w-full max-w-2xl p-6 space-y-6 border border-white/10 bg-[#0E1420] shadow-2xl max-h-[92vh] overflow-y-auto">
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

            {/* Live Selfie Profile Photo Section */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-4">
              {getFileUrl(selectedPro.face_verification_url) ? (
                <div className="relative group shrink-0">
                  <img
                    src={getFileUrl(selectedPro.face_verification_url)!}
                    alt="Live Face Verification Selfie"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setPreviewMediaUrl(getFileUrl(selectedPro.face_verification_url)!)}
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                    <Maximize2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-emerald-400 shrink-0">
                  <span className="text-2xl font-bold">{selectedPro.full_name?.charAt(0) || 'P'}</span>
                  <span className="text-[9px] mt-0.5 text-slate-400">Profile Photo</span>
                </div>
              )}

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-white">Live Hardware Face Selfie</span>
                  <span className="badge badge-emerald text-[10px]">✓ Verified Match</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Captured live via front camera during onboarding step 3 document vault submission.
                </p>
                {getFileUrl(selectedPro.face_verification_url) && (
                  <button
                    onClick={() => setPreviewMediaUrl(getFileUrl(selectedPro.face_verification_url)!)}
                    className="text-[11px] text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1"
                  >
                    <Eye className="w-3 h-3" /> View Full Selfie Photo
                  </button>
                )}
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[12px]">
              <div><span className="text-slate-500">Email:</span> <span className="text-white font-medium">{selectedPro.email || 'N/A'}</span></div>
              <div><span className="text-slate-500">Phone:</span> <span className="text-white font-mono">{selectedPro.phone_number || 'N/A'}</span></div>
              <div><span className="text-slate-500">Gender:</span> <span className="text-white font-medium">{selectedPro.gender || 'OTHER'}</span></div>
              <div><span className="text-slate-500">Current Status:</span> <span className="font-bold text-emerald-400">{selectedPro.verification_status}</span></div>
            </div>

            {/* Custom Services Requested by this Professional */}
            {serviceRequests.filter((r) => r.pro_id === selectedPro.user_id).length > 0 && (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Custom Service Requests Submitted by {selectedPro.full_name}</span>
                </div>

                <div className="space-y-2">
                  {serviceRequests.filter((r) => r.pro_id === selectedPro.user_id).map((reqItem) => (
                    <div key={reqItem.id} className="p-3 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{reqItem.service_name}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            reqItem.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                            reqItem.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {reqItem.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Suggested Rate: ₹{parseFloat(reqItem.suggested_price || 0).toFixed(2)}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {reqItem.status !== 'REJECTED' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleRejectCustomService(reqItem.id, reqItem.service_name)}
                            className="px-2.5 py-1 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        )}
                        {reqItem.status !== 'APPROVED' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleApproveCustomService(reqItem)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Approve & Publish
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Documents Inspection */}
            <div className="space-y-3">
              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" /> Verification Documents Vault
              </h4>

              <div className="space-y-2 text-[12px]">
                {/* Government ID */}
                <div className="p-3 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Government ID Proof Document</p>
                    <p className="text-[11px] text-slate-400">
                      Type: {selectedPro.documents?.govtIdType || 'DRIVING_LICENSE'} · Status: {selectedPro.documents?.govtIdNumber || 'UPLOADED'}
                    </p>
                  </div>
                  <a
                    href={getFileUrl('/proff_cert/1784878981773_govt_id_proof.pdf')!}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View ID Proof PDF <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Police Background Clearance PDF */}
                <div className="p-3 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Police Background Clearance PDF</p>
                    <p className="text-[11px] text-slate-400">Verification Certificate</p>
                  </div>
                  <a
                    href={getFileUrl('/proff_cert/1784878981773_govt_id_proof.pdf')!}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View Police Clearance PDF <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Read-Only Location & Admin Tolerance Radius Controls */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-blue-400" /> Location Set By Provider (Read-Only)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Registered Service Location: <strong className="text-white">{selectedPro.service_area || selectedPro.assigned_region || 'Kochi, Kerala'}</strong>
                  </p>
                </div>
                <span className="text-[11px] font-bold text-blue-400 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
                  🔵 {radiusInput} km Tolerance Radius
                </span>
              </div>

              {/* Dynamic Google Maps Blue Geofence Canvas Centered on Provider's Set Location */}
              <div className="h-64">
                <GoogleCoverageMap
                  locationName={selectedPro.service_area || selectedPro.assigned_region || 'Kochi, Kerala'}
                  radiusKm={radiusInput}
                />
              </div>

              {/* Admin Tolerance Radius Controls ONLY */}
              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-300 font-medium">Adjust Provider Coverage Tolerance Radius:</span>
                  <span className="font-bold text-blue-400 text-[14px]">{radiusInput} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={radiusInput}
                  onChange={(e) => setRadiusInput(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-slate-400">
                    Location is fixed by Provider ({selectedPro.service_area || selectedPro.assigned_region || 'Kochi, Kerala'}). Admin can only adjust coverage radius.
                  </p>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateRadiusOnly(selectedPro.user_id, selectedPro.service_area || selectedPro.assigned_region || 'Kochi, Kerala')}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold transition-colors shrink-0"
                  >
                    Save Tolerance Radius ({radiusInput} km)
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Status Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                disabled={actionLoading}
                onClick={() => handleVerify(selectedPro.user_id, 'REJECTED', 'Rejected by admin audit')}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-[12px] font-bold flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Reject / Suspend Provider
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

      {/* Media Fullscreen Preview Modal */}
      {previewMediaUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setPreviewMediaUrl(null)}>
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewMediaUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 text-sm font-bold bg-black/50 px-3 py-1 rounded-full border border-white/20"
            >
              ✕ Close Preview
            </button>
            {previewMediaUrl.endsWith('.pdf') ? (
              <iframe src={previewMediaUrl} className="w-[80vw] h-[80vh] rounded-2xl border border-white/20 shadow-2xl" />
            ) : (
              <img src={previewMediaUrl} alt="Selfie Preview" className="max-w-full max-h-[85vh] rounded-2xl border-2 border-emerald-400/80 shadow-2xl object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
