export type ServiceType =
  | 'STATIC_GUARDING'
  | 'EVENT_SECURITY'
  | 'VIP_ESCORT'
  | 'PATROL_SERVICES'
  | 'CCTV_MONITORING'
  | 'OTHER_SECURITY';

export type CoverageOption = 'DAY' | 'NIGHT' | 'TWENTY_FOUR_HOUR';

export type ArmedPreference = 'UNARMED' | 'ARMED_IF_PERMITTED';

export type DurationOption =
  | 'ONE_OFF'
  | 'ONE_MONTH'
  | 'THREE_MONTHS'
  | 'SIX_MONTHS'
  | 'TWELVE_MONTHS';

export type ContactMethod = 'PHONE' | 'EMAIL' | 'WHATSAPP';

export type RequestStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'SITE_ASSESSMENT_SCHEDULED'
  | 'QUOTATION_SENT'
  | 'ACCEPTED'
  | 'CONTRACT_ACTIVE'
  | 'AMENDMENT_REQUESTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CLOSED';

export interface StatusHistoryEntry {
  id: string;
  fromState: string | null;
  toState: string;
  changedAt: string;
  actor: string;
  reason: string;
  metadata?: Record<string, unknown>;
}

export interface AuditEventRecord {
  id: string;
  entityType: 'SERVICE_REQUEST' | 'CASE' | 'FILE';
  entityId: string;
  eventType: string;
  timestamp: string;
  actor: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
}

export interface ServiceRequestInput {
  contactName: string;
  organizationName?: string;
  phone: string;
  email: string;
  serviceType: ServiceType;
  siteAddress: string;
  city: string;
  coordinates?: string;
  guardCount: number;
  coverage: CoverageOption;
  armedPreference: ArmedPreference;
  startDate: string;
  duration: DurationOption;
  additionalRequirements?: string;
  preferredContactMethod: ContactMethod;
  privacyConsent: boolean;
  idempotencyKey?: string;
}

export interface ServiceRequestRecord extends ServiceRequestInput {
  id: string;
  referenceNumber: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  publicNotes?: string;
  nextStep?: string;
  verificationCodeHash: string; // SHA-256 with salt
  verificationCodeSalt: string;
  failedVerificationAttempts: number;
  isLockedOut: boolean;
  lockoutUntil?: string;
  requiresManualRiskReview: boolean;
  history: StatusHistoryEntry[];
  internalStaffNotes?: string; // Stored securely on server, never returned in public DTOs
  riskAssessmentScore?: number;
}

export interface PublicTrackRequestResponse {
  referenceNumber: string;
  status: RequestStatus;
  submissionDate: string;
  serviceType: ServiceType;
  city: string;
  latestPublicUpdate: string;
  nextAction: string;
  trackingSessionToken?: string;
  historySummary?: { toState: string; timestamp: string }[];
}

export type CaseCategory =
  | 'COMPLAINT'
  | 'COMPLIMENT'
  | 'SUGGESTION'
  | 'GENERAL_FEEDBACK';

export type CaseStatus =
  | 'LOGGED'
  | 'INVESTIGATING'
  | 'ACTION_PENDING'
  | 'RESOLVED'
  | 'CLOSED';

export type QuarantineStatus = 'PENDING' | 'CLEARED' | 'FLAGGED';

export interface StoredAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  quarantineStatus: QuarantineStatus;
  uploadedAt: string;
  checksumSha256: string;
}

export interface CaseAttachmentMeta {
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  fileId?: string;
  downloadUrl?: string;
}

export interface CaseInput {
  category: CaseCategory;
  contactName: string;
  email: string;
  phone?: string;
  relatedSite?: string;
  personnelRef?: string;
  rating?: number;
  description: string;
  attachments?: CaseAttachmentMeta[];
  privacyConsent: boolean;
  idempotencyKey?: string;
}

export interface CaseRecord extends CaseInput {
  id: string;
  referenceNumber: string;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  publicNotes?: string;
  nextStep?: string;
  verificationCodeHash: string;
  verificationCodeSalt: string;
  failedVerificationAttempts: number;
  isLockedOut: boolean;
  lockoutUntil?: string;
  history: StatusHistoryEntry[];
  internalStaffNotes?: string;
  storedFiles: StoredAttachment[];
}

export interface PublicTrackCaseResponse {
  referenceNumber: string;
  category: CaseCategory;
  status: CaseStatus;
  submissionDate: string;
  latestPublicUpdate: string;
  nextAction: string;
  trackingSessionToken?: string;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  privacyConsent: boolean;
  idempotencyKey?: string;
}
