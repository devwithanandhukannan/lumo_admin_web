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

// Professional Verification & Radius Management APIs
export async function fetchProVerifications() {
  try {
    return await fetchApi<any[]>('/api/v1/admin/pro/verifications');
  } catch (err) {
    return [];
  }
}

export async function verifyProfessional(userId: string, status: 'APPROVED' | 'SUSPENDED' | 'REJECTED' | 'PENDING', notes?: string) {
  return fetchApi(`/api/v1/admin/pro/${userId}/verify`, {
    method: 'POST',
    body: JSON.stringify({ status, notes }),
  });
}

export async function updateProCoverageRadius(userId: string, coverageRadiusKm: number, assignedRegion?: string) {
  return fetchApi(`/api/v1/admin/pro/${userId}/coverage`, {
    method: 'PUT',
    body: JSON.stringify({ coverageRadiusKm, assignedRegion }),
  });
}

// Catalog Service & Service Creation APIs
export async function fetchServiceCategories() {
  try {
    return await fetchApi<any[]>('/api/v1/catalog/categories');
  } catch (err) {
    return [];
  }
}

export async function fetchServiceCatalog() {
  try {
    return await fetchApi<any[]>('/api/v1/catalog/services');
  } catch (err) {
    return [];
  }
}

export async function createServiceCatalogItem(data: {
  name: string;
  categoryId: string;
  basePrice: number;
  durationMinutes?: number;
  description?: string;
}) {
  return fetchApi('/api/v1/catalog/services', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteServiceCatalogItem(id: string) {
  return fetchApi(`/api/v1/catalog/services/${id}`, {
    method: 'DELETE',
  });
}

// System Settings APIs
export async function fetchSystemSettings(): Promise<SystemSetting[]> {
  try {
    return await fetchApi<SystemSetting[]>('/api/v1/admin/settings');
  } catch (err) {
    return [];
  }
}

export async function updateSystemSetting(setting_key: string, setting_value: string, description?: string) {
  return fetchApi(`/api/v1/admin/settings/${setting_key}`, {
    method: 'PUT',
    body: JSON.stringify({ value: setting_value, description }),
  });
}
