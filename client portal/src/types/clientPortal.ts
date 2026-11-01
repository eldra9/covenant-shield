/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Covenant Shield Security Services - Client Portal Data Types
 */

export type ContractTier = 'Tier-1 Enterprise' | 'Tier-2 Commercial' | 'Standard Managed';
export type AccountStatus = 'Active' | 'Review' | 'Suspended';
export type ClientUserRole = 'client_admin' | 'client_viewer' | 'client_billing';

export interface ClientOrganization {
  id: string;
  name: string;
  legalName: string;
  kraPin: string;
  registrationNumber: string;
  industry: string;
  contractTier: ContractTier;
  primaryPhone: string;
  emergencyEscalationLine: string;
  accountStatus: AccountStatus;
  operationsManager: {
    name: string;
    phone: string;
    email: string;
  };
  contractStartDate: string;
  contractRenewalDate: string;
}

export interface ClientUser {
  id: string;
  clientId: string;
  email: string;
  fullName: string;
  jobTitle: string;
  directPhone: string;
  alertPhone: string;
  preferredChannel: 'Email' | 'SMS' | 'Both';
  emergencyPriority: 1 | 2 | 3;
  role: ClientUserRole;
  mfaEnabled: boolean;
  lastLoginAt: string;
}

export type SiteOperationalStatus = 'Active Guarded' | '24/7 Monitored' | 'Access Control Only' | 'Patrol Managed';

export interface ClientSafeSiteLog {
  id: string;
  timestamp: string;
  title: string;
  category: 'Shift Handover' | 'Perimeter Sweep' | 'Access Audit' | 'Escalation Resolved';
  description: string;
}

export interface AssignedGuard {
  id: string;
  badgeNumber: string;
  name: string;
  rank: string;
  phone: string;
  shift: string;
  photoUrl?: string;
  status: 'On Duty' | 'Off Duty' | 'Standby';
  psraNumber?: string;
  bloodGroup?: string;
  stationPost?: string;
}

export interface Site {
  id: string;
  clientId: string;
  name: string;
  code: string;
  address: string;
  locality: string;
  county: string;
  operationalStatus: SiteOperationalStatus;
  guardPostsApprovedCount: number;
  supervisorOnDuty: string;
  escalationContact: string;
  controlRoomHotline: string;
  serviceType: string;
  siteCoordinates: string;
  clientSafeLogs: ClientSafeSiteLog[];
  assignedGuards?: AssignedGuard[];
  imageUrl?: string;
  status?: string;
  assignedGuardsCount?: number;
  supervisorName?: string;
  supervisorPhone?: string;
  coverageHours?: string;
  type?: string;
  lastShiftHandover?: string;
  city?: string;
}

export type RequestStatus =
  | 'Submitted'
  | 'Under Assessment'
  | 'Quotation Issued'
  | 'Approved'
  | 'Mobilizing'
  | 'Active'
  | 'Completed'
  | 'Cancelled';

export type RequestPriority = 'Standard' | 'Urgent' | 'Emergency Priority';

export interface QuotationLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rateKes: number;
  amountKes: number;
}

export interface Quotation {
  quoteNumber: string;
  amountKes: number;
  issuedAt: string;
  status: 'Pending Review' | 'Accepted' | 'Declined';
  validUntil: string;
  lineItems: QuotationLineItem[];
  notes?: string;
}

export interface RequestTimelineEvent {
  id: string;
  timestamp: string;
  status: RequestStatus;
  title: string;
  clientVisibleNotes: string;
  actorRole: 'Operations Dispatch' | 'Security Assessor' | 'Client Authorized Representative' | 'System';
}

export interface ServiceRequest {
  id: string;
  reference: string;
  clientId: string;
  siteId: string;
  siteName: string;
  serviceType: string;
  priority: RequestPriority;
  status: RequestStatus;
  requestedStartDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  requiresClientAction: boolean;
  outstandingActionMessage?: string;
  quotation?: Quotation;
  timeline: RequestTimelineEvent[];
}

export type CaseCategory =
  | 'Incident Inquiry'
  | 'Guard Conduct'
  | 'Patrol Schedule'
  | 'Billing & Invoice'
  | 'Equipment & Access'
  | 'General Feedback';

export type CasePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type CaseStatus = 'Open' | 'In Review' | 'Escalated' | 'Resolved' | 'Closed';

export interface CaseAttachment {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  downloadUrl: string;
  uploadedAt: string;
}

export interface CaseMessage {
  id: string;
  caseId: string;
  senderType: 'client' | 'operations';
  senderName: string;
  senderRole?: string;
  timestamp: string;
  content: string;
  attachments?: CaseAttachment[];
}

export interface CaseTimelineItem {
  id: string;
  timestamp: string;
  status: CaseStatus;
  title: string;
  note: string;
}

export interface ClientCase {
  id: string;
  reference: string;
  clientId: string;
  siteId?: string;
  siteName?: string;
  subject: string;
  category: CaseCategory;
  priority: CasePriority;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  messages: CaseMessage[];
  timeline: CaseTimelineItem[];
}

export interface PortalNotification {
  id: string;
  clientId: string;
  title: string;
  message: string;
  category: 'request' | 'quotation' | 'case' | 'security' | 'site';
  referenceId?: string;
  read: boolean;
  createdAt: string;
}

export interface SecuritySession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  isCurrent: boolean;
  lastActive: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: string;
  ipAddress: string;
  status: 'Success' | 'Denied' | 'Warning';
  details: string;
}

export interface DashboardMetrics {
  clientName: string;
  contractTier: ContractTier;
  activeSitesCount: number;
  openRequestsCount: number;
  requestsAwaitingActionCount: number;
  openCasesCount: number;
  unreadNotificationsCount: number;
}
