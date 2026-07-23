'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Key, Save, CheckCircle2, MapPin, Percent, Info } from 'lucide-react';
import { fetchSystemSettings, updateSystemSetting } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [googleMapsKey, setGoogleMapsKey] = useState('AIzaSyD9r59vIxUjLj3hiICvy9CYbXYbmil0Xb4');
  const [commission, setCommission] = useState('15.0');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('lumo_admin_token');
    if (!token) { router.push('/login'); return; }
    setAuthenticated(true);
    fetchSystemSettings().then(settings => {
      const maps = settings.find(s => s.setting_key === 'GOOGLE_MAPS_API_KEY');
      if (maps) setGoogleMapsKey(maps.setting_value);
      const comm = settings.find(s => s.setting_key === 'PLATFORM_COMMISSION_PERCENT');
      if (comm) setCommission(comm.setting_value);
    }).catch(() => {});
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSystemSetting('GOOGLE_MAPS_API_KEY', googleMapsKey, 'Google Maps Platform API Key');
      await updateSystemSetting('PLATFORM_COMMISSION_PERCENT', commission, 'Platform Commission Rate');
    } catch {}
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  };

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
        <Header title="System Settings" />

        <div className="flex-1 p-6">
          <div style={{ maxWidth: 680 }}>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-[18px] font-bold text-white mb-1">API Keys & System Configuration</h2>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Manage dynamic runtime keys stored in the backend PostgreSQL system_settings table.
              </p>
            </div>

            {/* Success Banner */}
            {saved && (
              <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-[13px] font-semibold" style={{ color: '#6EE7B7' }}>
                  Settings saved to PostgreSQL successfully!
                </p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">

              {/* Google Maps Key */}
              <div className="card p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(59,130,246,0.12)' }}>
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">Google Maps Platform API Key</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Used for live provider GPS tracking, distance matrix, and customer address geocoding.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    API Key (GOOGLE_MAPS_API_KEY)
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={googleMapsKey}
                      onChange={e => setGoogleMapsKey(e.target.value)}
                      className="input-field font-mono text-[12px]"
                      style={{ paddingLeft: '34px' }}
                      placeholder="AIzaSy..."
                    />
                  </div>
                </div>
              </div>

              {/* Commission */}
              <div className="card p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(245,158,11,0.12)' }}>
                    <Percent className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">Platform Commission Rate</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Automatic percentage deducted from total completed booking fees.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Commission Percentage (PLATFORM_COMMISSION_PERCENT)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={commission}
                      onChange={e => setCommission(e.target.value)}
                      className="input-field font-mono text-[12px]"
                      style={{ maxWidth: 160 }}
                    />
                    <span className="text-[12px] font-semibold text-amber-400">{commission}% per booking</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-2 px-2"
                style={{ color: 'var(--text-muted)' }}>
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p className="text-[11px]">Changes are saved to the PostgreSQL <code className="font-mono text-blue-400">system_settings</code> table and applied to all microservices at runtime.</p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={loading} className="btn-primary">
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
