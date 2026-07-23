import { SOSAlert, MisconductIncident, ProfessionalProfile, Booking, SystemSetting } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('lumo_admin_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `API Error ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  return data.data || data;
}

// -------------------------------------------------------------
// Real API Endpoint Handlers connected to Microservices Gateway
// -------------------------------------------------------------

// Auth APIs
export async function sendAdminOtp(phoneNumber: string) {
  return fetchApi<{ success: boolean; message: string; debugOtp?: string }>('/api/v1/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  });
}

export async function verifyAdminOtp(phoneNumber: string, otp: string) {
  return fetchApi<{ success: boolean; accessToken: string; refreshToken: string; user: any }>('/api/v1/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({
      phoneNumber,
      otp,
      role: 'SUPER_ADMIN',
      fullName: 'Super Admin',
    }),
  });
}

// Safety & Emergency SOS APIs
export async function fetchSosAlerts(): Promise<SOSAlert[]> {
  try {
    return await fetchApi<SOSAlert[]>('/api/v1/admin/safety/sos');
  } catch (err) {
    return [];
  }
}

export async function resolveSosAlert(sosId: string) {
  return fetchApi(`/api/v1/admin/safety/sos/${sosId}/resolve`, {
    method: 'PATCH',
  });
}

// System Settings APIs
export async function fetchSystemSettings(): Promise<SystemSetting[]> {
  try {
    return await fetchApi<SystemSetting[]>('/api/v1/safety/settings');
  } catch (err) {
    return [];
  }
}

export async function updateSystemSetting(setting_key: string, setting_value: string, description?: string) {
  return fetchApi('/api/v1/admin/settings', {
    method: 'POST',
    body: JSON.stringify({ setting_key, setting_value, description }),
  });
}
