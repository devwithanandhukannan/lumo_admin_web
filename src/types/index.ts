export type UserRole = 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN' | 'SUPER_ADMIN';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type BookingStatus = 'REQUESTED' | 'ACCEPTED' | 'NAVIGATING' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SOSAlert {
  id: string;
  booking_id?: string;
  triggered_by_user_id: string;
  user_name: string;
  user_phone: string;
  user_role: UserRole;
  trigger_latitude: number;
  trigger_longitude: number;
  status: 'ACTIVE' | 'RESOLVED' | 'ESCALATED_TO_POLICE';
  notes?: string;
  created_at: string;
}

export interface MisconductIncident {
  id: string;
  booking_id: string;
  reported_by_user_id: string;
  against_user_id: string;
  against_user_name: string;
  severity: IncidentSeverity;
  description: string;
  proof_urls: string[];
  status: 'PENDING_REVIEW' | 'UNDER_INVESTIGATION' | 'RESOLVED';
  created_at: string;
}

export interface ProfessionalProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  verification_status: VerificationStatus;
  documents: {
    govt_id_url?: string;
    police_clearance_url?: string;
  };
  face_verified: boolean;
  rating_avg: number;
  total_jobs_completed: number;
  acceptance_rate: number;
  cancellation_rate: number;
  account_health_score: number;
  is_blacklisted: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  pro_id?: string;
  pro_name?: string;
  service_name: string;
  status: BookingStatus;
  scheduled_at: string;
  address_text: string;
  start_otp: string;
  end_otp: string;
  total_amount: number;
  created_at: string;
}

export interface SystemSetting {
  setting_key: string;
  setting_value: string;
  description: string;
  updated_at: string;
}
