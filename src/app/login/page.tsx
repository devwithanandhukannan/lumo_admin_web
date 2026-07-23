'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, PhoneCall, Key, ArrowRight, AlertCircle, Terminal } from 'lucide-react';
import { sendAdminOtp, verifyAdminOtp } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('+919999999999');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendAdminOtp(phoneNumber);
      setOtpSent(true);
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res: any = await verifyAdminOtp(phoneNumber, otp);
      const accessToken = res?.tokens?.accessToken || res?.accessToken;
      if (!accessToken) throw new Error('Authentication failed: Missing access token');
      localStorage.setItem('lumo_admin_token', accessToken);
      if (res?.user) localStorage.setItem('lumo_admin_user', JSON.stringify(res.user));
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Check the backend terminal console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient glows */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

      <div
        className="relative z-10 w-full"
        style={{ maxWidth: 420 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
              boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
            }}>
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[24px] font-extrabold text-white tracking-tight mb-1.5">LUMO Admin</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Super Admin Authentication Gate
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7 space-y-5"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={step === 'PHONE'
                  ? { background: 'var(--blue-primary)', color: '#fff' }
                  : { background: 'var(--bg-hover)', color: 'var(--text-muted)', textDecoration: 'line-through' }
                }
              >1</span>
              <span className="text-[11px] font-medium" style={{ color: step === 'PHONE' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                Phone
              </span>
            </div>
            <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={step === 'OTP'
                  ? { background: 'var(--blue-primary)', color: '#fff' }
                  : { background: 'var(--bg-hover)', color: 'var(--text-muted)' }
                }
              >2</span>
              <span className="text-[11px] font-medium" style={{ color: step === 'OTP' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                Verify OTP
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl flex items-start gap-2.5"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle className="w-4 h-4 text-red-400 mt-px shrink-0" />
              <span className="text-[12px]" style={{ color: '#FCA5A5' }}>{error}</span>
            </div>
          )}

          {/* OTP Sent Notice */}
          {otpSent && step === 'OTP' && (
            <div className="p-3.5 rounded-xl flex items-start gap-2.5"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <Terminal className="w-4 h-4 text-blue-400 mt-px shrink-0" />
              <span className="text-[12px]" style={{ color: '#93C5FD' }}>
                OTP generated! Check your <strong>backend server terminal console</strong> for the 6-digit verification code.
              </span>
            </div>
          )}

          {/* PHONE STEP */}
          {step === 'PHONE' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}>
                  Super Admin Phone Number
                </label>
                <div className="relative">
                  <PhoneCall className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="input-field font-mono pl-10"
                    placeholder="+919999999999"
                  />
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Default seed: +919999999999
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3"
              >
                {loading ? 'Sending...' : 'Request Verification OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* OTP STEP */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}>
                  6-Digit OTP Code (from backend console)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="input-field font-mono tracking-[0.3em] text-[16px] pl-10"
                    placeholder="• • • • • •"
                    maxLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all"
                style={{
                  background: loading ? 'var(--bg-hover)' : 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#fff',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(16,185,129,0.3)',
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Enter Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => { setStep('PHONE'); setError(null); setOtp(''); }}
                className="w-full text-center text-[12px] transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
              >
                ← Back to phone number
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] mt-5" style={{ color: 'var(--text-muted)' }}>
          LUMO Safety-First Home Services · Restricted Admin Access Only
        </p>
      </div>
    </div>
  );
}
