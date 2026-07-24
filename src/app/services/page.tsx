'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import {
  Layers,
  Plus,
  IndianRupee,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Search,
  Sparkles,
  Check,
  X,
  User,
} from 'lucide-react';
import {
  fetchServiceCatalog,
  fetchServiceCategories,
  createServiceCatalogItem,
  deleteServiceCatalogItem,
  fetchPendingServiceRequests,
  approveCustomServiceRequest,
  rejectCustomServiceRequest,
} from '@/lib/api';

export default function ServicesCatalogPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [description, setDescription] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [svcData, catData, reqData] = await Promise.all([
        fetchServiceCatalog(),
        fetchServiceCategories(),
        fetchPendingServiceRequests(),
      ]);
      setServices(svcData || []);
      setCategories(catData || []);
      setPendingRequests(reqData || []);
      if (catData && catData.length > 0 && !categoryId) {
        setCategoryId(catData[0].id);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load catalog data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('lumo_admin_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setAuthenticated(true);
    loadData();
  }, [router]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !basePrice) {
      setMessage({ type: 'error', text: 'Please fill in Service Name, Category, and Base Price.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await createServiceCatalogItem({
        name: name.trim(),
        categoryId,
        basePrice: parseFloat(basePrice),
        durationMinutes: parseInt(durationMinutes || '60', 10),
        description: description.trim(),
      });

      setMessage({ type: 'success', text: `Service "${name}" added to catalog! Listed for all professionals.` });
      setName('');
      setBasePrice('');
      setDescription('');
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create service' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveRequest = async (reqItem: any) => {
    setActionLoading(true);
    try {
      const cat = categories[0]?.id || 'cat-clean';
      await approveCustomServiceRequest(reqItem.id, cat, reqItem.suggested_price);
      setMessage({ type: 'success', text: `Approved "${reqItem.service_name}" into active service catalog!` });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to approve request' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (id: string, serviceName: string) => {
    setActionLoading(true);
    try {
      await rejectCustomServiceRequest(id);
      setMessage({ type: 'success', text: `Request "${serviceName}" rejected.` });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to reject request' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteService = async (id: string, serviceName: string) => {
    if (!confirm(`Are you sure you want to remove "${serviceName}" from the service catalog?`)) return;

    try {
      await deleteServiceCatalogItem(id);
      setMessage({ type: 'success', text: `Service "${serviceName}" removed.` });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to remove service' });
    }
  };

  if (!authenticated) return null;

  const filteredServices = services.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  const activePendingReqs = pendingRequests.filter((r) => r.status === 'PENDING_ADMIN_APPROVAL');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Service Catalog & Pricing" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20 border-blue-500/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="w-6 h-6 text-blue-400" />
                <h1 className="text-xl font-bold text-white tracking-tight">Services & Pricing Catalog</h1>
              </div>
              <p className="text-xs text-gray-400">
                Add, manage, and price services offered on LUMO. Created services instantly sync to the professional service selection panel in the app.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add New Service
            </button>
          </div>

          {/* Feedback Message */}
          {message && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span className="flex-1">{message.text}</span>
              <button onClick={() => setMessage(null)} className="text-xs underline opacity-80 hover:opacity-100">Dismiss</button>
            </div>
          )}

          {/* Professional Custom Service Requests Section */}
          {activePendingReqs.length > 0 && (
            <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Pending Custom Service Requests from Professionals ({activePendingReqs.length})</span>
                </div>
                <span className="text-xs text-amber-400/80">Approve to publish directly into service catalog</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePendingReqs.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl border border-gray-800 bg-gray-900/60 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{req.service_name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          <User className="w-3 h-3 text-blue-400" />
                          <span>Requested by: <strong className="text-gray-200">{req.pro_name}</strong></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400">₹{parseFloat(req.suggested_price || 0).toFixed(2)}</span>
                        <span className="block text-[10px] text-gray-500">Suggested Price</span>
                      </div>
                    </div>

                    {req.description && (
                      <p className="text-xs text-gray-400 bg-gray-950 p-2 rounded-lg border border-gray-800/60">
                        {req.description}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        disabled={actionLoading}
                        onClick={() => handleRejectRequest(req.id, req.service_name)}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleApproveRequest(req)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg shadow-emerald-500/20"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve & Publish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search services by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="text-xs text-gray-400 px-2">
              Total Services: <strong className="text-white">{filteredServices.length}</strong>
            </div>
          </div>

          {/* Services Grid / Table */}
          {loading ? (
            <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <p className="text-sm">Loading service catalog...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-gray-800 rounded-2xl">
              <p className="text-gray-400 font-medium">No services found in catalog</p>
              <p className="text-xs text-gray-600 mt-1">Click "Add New Service" to create one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((svc) => (
                <div
                  key={svc.id}
                  className="p-5 rounded-2xl border border-gray-800 bg-gray-900/40 hover:border-gray-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {svc.category_name || 'General'}
                      </span>
                      <button
                        onClick={() => handleDeleteService(svc.id, svc.name)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-white">{svc.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{svc.description || 'No description provided.'}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-lg">
                      <IndianRupee className="w-4 h-4" />
                      <span>{parseFloat(svc.base_price).toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>{svc.duration_minutes || 60} mins</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add New Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Add New Service to Catalog</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CCTV Camera Installation & Repair"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 699.00"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Estimated Duration (Minutes)
                </label>
                <input
                  type="number"
                  placeholder="60"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what is included in this service..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create & Publish Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
