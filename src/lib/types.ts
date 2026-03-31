export type UserRole = 'victim' | 'volunteer' | 'ngo' | 'government';

export interface Location {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  name: string;
  location: Location;
  created_at?: string;
  updated_at?: string;
}

export interface Volunteer extends User {
  skills: string[];
  availability: number;
  languages: string[];
  vehicle_access: boolean;
  vehicle_type?: string;
  tasks_completed: number;
  people_helped: number;
  rating: number;
  online: boolean;
}

export interface NGO extends User {
  org_name: string;
  hq_location: Location;
  staff_count: number;
}

export type NeedType = 'food' | 'water' | 'medical' | 'shelter' | 'rescue' | 'other';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type NeedStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'closed';

export interface Need {
  id: string;
  reported_by: string; // User ID
  need_type: NeedType;
  urgency_level: number; // 0-100
  urgency_label: UrgencyLevel;
  people_affected: number;
  description?: string;
  location: Location;
  triage_score?: number;
  assigned_to?: string; // Volunteer ID
  status: NeedStatus;
  created_at: string;
  completed_at?: string;
}

export interface ResourceInventory {
  id: string;
  ngo_id: string;
  resource_type: 'food' | 'medicine' | 'vehicle' | 'shelter' | 'water' | 'clothing';
  item_name: string;
  quantity: number;
  unit: string;
  expiry_date?: string;
  location: Location;
  available: boolean;
}

export interface TaskAssignment {
  id: string;
  need_id: string;
  volunteer_id: string;
  assigned_at: string;
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  notes?: string;
}

export interface Announcement {
  id: string;
  created_by: string;
  message: string;
  urgency: 'info' | 'warning' | 'critical';
  target_audience: 'all' | 'region' | 'role';
  target_region?: string;
  target_role?: string;
  created_at: string;
  expires_at?: string;
}

export interface RiskZone {
  id: string;
  region: string;
  risk_score: number;
  risk_level: 'green' | 'orange' | 'red';
  polygon: Location[];
  forecast_time: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  disasterType: string;
  severity: string;
  affectedPeople: number;
  location: { lat: number; lng: number; radius: number };
  weatherCondition: { rainfall: number; windSpeed: number; temperature: number };
  timeline: { minute: number; event: string; requestCount: number }[];
  requestTemplates: any[];
  availableResources: any;
}
