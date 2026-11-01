/**
 * Covenant Shield Security Services - Types & Enums
 * Internal Administration & Operations System
 */

export type Role = 'super_admin' | 'operations_staff' | 'supervisor' | 'field_supervisor' | 'guard' | 'client';

export type Permission =
  | 'dashboard.read'
  | 'requests.read'
  | 'requests.update'
  | 'clients.read'
  | 'clients.create'
  | 'clients.update'
  | 'sites.read'
  | 'sites.manage'
  | 'employees.read'
  | 'employees.manage'
  | 'shifts.read'
  | 'shifts.manage'
  | 'attendance.read'
  | 'attendance.correct'
  | 'cases.read'
  | 'cases.assign'
  | 'cases.resolve'
  | 'reports.read'
  | 'users.manage'
  | 'roles.manage'
  | 'audit.read'
  | 'settings.manage'
  | 'requests.submit'
  | 'cases.submit'
  | 'attendance.checkin';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    'dashboard.read',
    'requests.read',
    'requests.update',
    'requests.submit',
    'clients.read',
    'clients.create',
    'clients.update',
    'sites.read',
    'sites.manage',
    'employees.read',
    'employees.manage',
    'shifts.read',
    'shifts.manage',
    'attendance.read',
    'attendance.correct',
    'cases.read',
    'cases.assign',
    'cases.resolve',
    'cases.submit',
    'reports.read',
    'users.manage',
    'roles.manage',
    'audit.read',
    'settings.manage',
  ],
  operations_staff: [
    'dashboard.read',
    'requests.read',
    'requests.update',
    'requests.submit',
    'clients.read',
    'clients.create',
    'clients.update',
    'sites.read',
    'sites.manage',
    'employees.read',
    'employees.manage',
    'shifts.read',
    'shifts.manage',
    'attendance.read',
    'attendance.correct',
    'cases.read',
    'cases.assign',
    'cases.resolve',
    'cases.submit',
    'reports.read',
    'audit.read',
  ],
  supervisor: [
    'dashboard.read',
    'requests.read',
    'sites.read',
    'employees.read',
    'shifts.read',
    'shifts.manage',
    'attendance.read',
    'attendance.correct',
    'cases.read',
    'cases.assign',
    'reports.read',
  ],
  field_supervisor: [
    'dashboard.read',
    'requests.read',
    'sites.read',
    'employees.read',
    'shifts.read',
    'shifts.manage',
    'attendance.read',
    'attendance.correct',
    'cases.read',
    'cases.assign',
    'reports.read',
  ],
  guard: [
    'shifts.read',
    'attendance.read',
    'attendance.checkin',
  ],
  client: [
    'dashboard.read',
    'requests.read',
    'requests.submit',
    'sites.read',
    'cases.read',
    'cases.submit',
  ],
};

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: Role;
  phone: string;
  avatarUrl?: string;
  assignedSiteIds?: string[]; // Resource scope for supervisors and guards
  clientId?: string; // Scope for clients
  isActive: boolean;
  createdAt: string; // UTC ISO
  lastLoginAt?: string;
  must_change_password?: boolean;
  mustChangePassword?: boolean;
}

export type RequestStatus =
  | 'new'
  | 'under_review'
  | 'site_assessment_scheduled'
  | 'quotation_sent'
  | 'accepted'
  | 'contract_active'
  | 'rejected'
  | 'cancelled';

export interface StatusTransitionHistory {
  id: string;
  fromStatus: string;
  toStatus: string;
  reason: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  timestamp: string; // UTC ISO
}

export interface InternalNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: string; // UTC ISO
}

export interface ClientMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  content: string;
  isClientFacing: true;
  createdAt: string; // UTC ISO
}

export interface ServiceRequest {
  id: string;
  referenceNumber: string; // e.g. "CSR-2026-0042"
  requestCode?: string;
  clientId?: string;
  clientName: string;
  siteName?: string;
  contactName?: string;
  contactEmail: string;
  contactPhone: string;
  serviceType: 'armed_guarding' | 'corporate_patrol' | 'vip_close_protection' | 'cctv_monitoring' | 'event_security';
  siteAddress: string;
  locationAddress?: string;
  city: string;
  requiredGuards: number;
  assignedGuardIds?: string[];
  assignedGuards?: {
    id: string;
    name: string;
    badgeNumber: string;
    phone: string;
    rank?: string;
    avatarUrl?: string;
  }[];
  startDate: string; // YYYY-MM-DD
  status: RequestStatus;
  urgency?: string;
  assignedOwnerId?: string;
  assignedOwnerName?: string;
  assessmentScheduledDate?: string;
  assessmentNotes?: string;
  quotationAmountKES?: number;
  quotationDetails?: string;
  statusHistory: StatusTransitionHistory[];
  internalNotes: InternalNote[];
  clientMessages: ClientMessage[];
  createdAt: string; // UTC ISO
  updatedAt: string; // UTC ISO
}

export interface Client {
  id: string;
  companyName: string;
  accountReference: string; // e.g. "CLI-019"
  clientCode?: string;
  tier?: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  billingAddress: string;
  city: string;
  activeContractsCount: number;
  status: 'active' | 'suspended' | 'pending';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: string;
  siteCode: string; // e.g. "NBO-SITE-04"
  name: string;
  clientId: string;
  clientName: string;
  address: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  contactPerson: string;
  contactPhone: string;
  status: 'active' | 'inactive' | 'under_assessment';
  operationalNotes: string;
  assignedSupervisorIds: string[];
  requiredGuardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  employeeNumber: string; // e.g. "CS-EMP-208"
  badgeNumber?: string;
  name: string;
  fullName?: string;
  rank?: string;
  assignedSiteName?: string;
  email: string;
  phone: string;
  nationalIdMasked: string; // Masked for privacy e.g. "•••• 4892"
  role: 'guard' | 'supervisor' | 'k9_specialist' | 'cctv_operator' | 'close_protection';
  employmentStatus: 'active' | 'on_leave' | 'suspended' | 'terminated';
  qualifications: string[]; // e.g. "Armed Escort", "PSRA Certified", "First Aid L2", "Fire Safety"
  assignedSiteIds: string[];
  isAvailable?: boolean;
  currentAssignment?: string;
  dateHired: string;
  emergencyContact: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ShiftStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Shift {
  id: string;
  shiftCode: string; // e.g. "SH-8491"
  siteId: string;
  siteName: string;
  guardId: string;
  guardName: string;
  supervisorId?: string;
  supervisorName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (e.g. "06:00")
  endTime: string; // HH:mm (e.g. "18:00")
  shiftType: 'day_shift' | 'night_shift' | 'custom';
  status: ShiftStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus =
  | 'on_time'
  | 'late'
  | 'absent'
  | 'incomplete'
  | 'corrected';

export interface AttendanceCorrection {
  id: string;
  attendanceId: string;
  correctedByUserId: string;
  correctedByUserName: string;
  correctedByUserRole: Role;
  reason: string;
  priorStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  priorCheckIn?: string;
  newCheckIn?: string;
  priorCheckOut?: string;
  newCheckOut?: string;
  timestamp: string; // UTC ISO
}

export interface AttendanceRecord {
  id: string;
  shiftId: string;
  siteId: string;
  siteName: string;
  guardId: string;
  guardName: string;
  supervisorId?: string;
  supervisorName?: string;
  date: string; // YYYY-MM-DD
  scheduledStart: string; // UTC ISO
  scheduledEnd: string; // UTC ISO
  actualCheckIn?: string; // UTC ISO
  actualCheckOut?: string; // UTC ISO
  originalStatus: AttendanceStatus;
  currentStatus: AttendanceStatus;
  isException: boolean;
  exceptionType?: 'late_arrival' | 'unconfirmed_absence' | 'early_departure' | 'missing_checkout';
  exceptionNotes?: string;
  correctionHistory: AttendanceCorrection[];
  createdAt: string;
  updatedAt: string;
}

export type CaseStatus =
  | 'submitted'
  | 'assigned'
  | 'in_progress'
  | 'resolution_proposed'
  | 'closed'
  | 'reopened';

export type CaseSeverity = 'low' | 'medium' | 'high' | 'critical';

export type CaseType =
  | 'security_incident'
  | 'perimeter_breach'
  | 'patrol_dispute'
  | 'client_complaint'
  | 'equipment_failure'
  | 'guard_conduct';

export interface Case {
  id: string;
  caseNumber: string; // e.g. "CAS-2026-104"
  caseCode?: string;
  title: string;
  type: CaseType;
  severity: CaseSeverity;
  status: CaseStatus;
  siteId: string;
  siteName: string;
  clientId: string;
  clientName: string;
  reportedBy: string;
  assignedOwnerId?: string;
  assignedOwnerName?: string;
  dueDate: string; // YYYY-MM-DD
  resolutionDeadline?: string;
  description: string;
  proposedResolution?: string;
  closureReason?: string;
  internalNotes: InternalNote[];
  clientMessages: ClientMessage[];
  statusHistory: StatusTransitionHistory[];
  createdAt: string; // UTC ISO
  updatedAt: string; // UTC ISO
}

export interface AuditLog {
  id: string;
  timestamp: string; // UTC ISO
  actorId: string;
  actorName: string;
  actorRole: Role;
  action:
    | 'USER_CREATE'
    | 'USER_UPDATE'
    | 'ROLE_CHANGE'
    | 'REQUEST_STATUS_CHANGE'
    | 'ATTENDANCE_CORRECTION'
    | 'SHIFT_CREATE'
    | 'SHIFT_UPDATE'
    | 'CASE_ASSIGN'
    | 'CASE_STATUS_CHANGE'
    | 'SITE_CREATE'
    | 'SITE_UPDATE'
    | 'EMPLOYEE_CREATE'
    | 'EMPLOYEE_UPDATE'
    | 'REPORT_EXPORT_CSV'
    | 'GUARD_ASSIGNMENT'
    | 'REQUEST_OWNER_ASSIGNED'
    | 'NEW_SERVICE_REQUEST';
  entityType: string;
  entityId: string;
  summary: string;
  metadata?: Record<string, any>;
}

export interface ActiveGuardWithGPS {
  id: string;
  guardId: string;
  guardName: string;
  siteId: string;
  siteName: string;
  badgeNumber: string;
  phone: string;
  avatarUrl?: string;
  checkInTime: string; // ISO or formatted EAT
  lat: number;
  lng: number;
  accuracyMeters: number;
  batteryLevel: number;
  appSignedIn: boolean;
  gpsEnabled: boolean;
  status: 'on_time' | 'late' | 'offline';
}
