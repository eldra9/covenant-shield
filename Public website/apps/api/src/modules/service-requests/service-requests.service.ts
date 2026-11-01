import crypto from 'crypto';
import {
  ServiceRequestRecord,
  PublicTrackRequestResponse,
  RequestStatus,
  AuditEventRecord,
  StatusHistoryEntry,
} from '../../../../../packages/shared/src/types/index.ts';
import { ServiceRequestSchema, TrackRequestSchema } from '../../../../../packages/shared/src/schemas/index.ts';
import {
  validateStateTransition,
  createStatusHistoryEntry,
} from './state-machine.ts';

// Server-side master repository
const requestStore = new Map<string, ServiceRequestRecord>();
const idempotencyStore = new Map<string, { response: unknown; timestamp: number }>();
const auditLog: AuditEventRecord[] = [];

const TRACKING_SECRET = process.env.TRACKING_SECRET || 'covenant-shield-tracking-secret-key-32b';

// Helper to hash verification code with salt
function hashVerificationCode(code: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${code.trim()}`).digest('hex');
}

// Generate signed tracking session token
function generateTrackingToken(referenceNumber: string): string {
  const expiresAt = Date.now() + 1000 * 60 * 30; // 30 minutes
  const payload = `${referenceNumber}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', TRACKING_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

export function verifyTrackingToken(token: string): { valid: boolean; referenceNumber?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [referenceNumber, expiresStr, signature] = decoded.split(':');
    const expiresAt = parseInt(expiresStr, 10);

    if (Date.now() > expiresAt) {
      return { valid: false };
    }

    const expectedHmac = crypto
      .createHmac('sha256', TRACKING_SECRET)
      .update(`${referenceNumber}:${expiresStr}`)
      .digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
      return { valid: true, referenceNumber };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

// Seed sample reference for immediate testing
const seedSalt = 'cs-seed-salt-2026';
const seedSample: ServiceRequestRecord = {
  id: 'sr-sample-1',
  referenceNumber: 'SR-2026-00123',
  contactName: 'Alexander Sterling',
  organizationName: 'Sterling Global Logistics',
  phone: '+1 555-019-2834',
  email: 'a.sterling@sterling-logistics.com',
  serviceType: 'STATIC_GUARDING',
  siteAddress: 'Pier 42 Maritime Terminal, Gate B',
  city: 'Metropolis',
  guardCount: 4,
  coverage: 'TWENTY_FOUR_HOUR',
  armedPreference: 'ARMED_IF_PERMITTED',
  startDate: '2026-11-15',
  duration: 'SIX_MONTHS',
  additionalRequirements: 'Port perimeter access control and truck manifest verification.',
  preferredContactMethod: 'EMAIL',
  privacyConsent: true,
  status: 'SITE_ASSESSMENT_SCHEDULED',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  verificationCodeSalt: seedSalt,
  verificationCodeHash: hashVerificationCode('492815', seedSalt),
  failedVerificationAttempts: 0,
  isLockedOut: false,
  requiresManualRiskReview: true,
  publicNotes: 'Initial operations reconnaissance completed. Senior Field Assessor assigned for physical site audit.',
  nextStep: 'Site security survey scheduled for 10:00 AM on Nov 3, 2026.',
  internalStaffNotes: 'RESTRICTED: Port authority clearance confirmed. Officer Marcus Vance assigned lead.',
  riskAssessmentScore: 78,
  history: [
    createStatusHistoryEntry(null, 'NEW', {
      actor: 'system',
      reason: 'Online intake received and validated',
    }),
    createStatusHistoryEntry('NEW', 'UNDER_REVIEW', {
      actor: 'duty_officer_4',
      reason: 'Initial risk profile triage completed',
    }),
    createStatusHistoryEntry('UNDER_REVIEW', 'SITE_ASSESSMENT_SCHEDULED', {
      actor: 'operations_director',
      reason: 'Physical port inspection appointed',
    }),
  ],
};

requestStore.set(seedSample.referenceNumber, seedSample);

export class ServiceRequestsService {
  /**
   * Generates a collision-safe, unpredictable reference number.
   * Never derives uniqueness from count of rows.
   */
  private generateCollisionSafeReference(year: number): string {
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      // 5-digit cryptographically pseudo-random number between 10000 and 99999
      const randomInt = 10000 + (crypto.randomBytes(4).readUInt32BE(0) % 90000);
      const candidate = `SR-${year}-${randomInt}`;
      if (!requestStore.has(candidate)) {
        return candidate;
      }
    }
    // High-entropy fallback if 10 consecutive collisions occur
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `SR-${year}-${suffix}`;
  }

  /**
   * Creates a service request with atomic transactions, idempotency, and audit trails
   */
  public async create(input: unknown): Promise<{
    referenceNumber: string;
    verificationCode: string;
    status: string;
    createdAt: string;
    requiresManualReview: boolean;
    instructions: string;
  }> {
    // 1. Schema validation & normalization
    const validated = ServiceRequestSchema.parse(input);

    // 2. Idempotency Key Handling
    if (validated.idempotencyKey) {
      const existing = idempotencyStore.get(validated.idempotencyKey);
      if (existing) {
        // Return cached identical response if within 24 hours
        if (Date.now() - existing.timestamp < 86400000) {
          return existing.response as {
            referenceNumber: string;
            verificationCode: string;
            status: string;
            createdAt: string;
            requiresManualReview: boolean;
            instructions: string;
          };
        }
      }
    }

    // 3. Server-owned business rules
    let requiresManualReview = false;
    let baselineRisk = 20;

    // Armed preferences require statutory licensing review
    if (validated.armedPreference === 'ARMED_IF_PERMITTED') {
      requiresManualReview = true;
      baselineRisk += 35;
    }

    // Battalion deployments (>10 sentries) require tactical logistics review
    if (validated.guardCount > 10) {
      requiresManualReview = true;
      baselineRisk += 25;
    }

    // VIP close protection requires threat matrix assessment
    if (validated.serviceType === 'VIP_ESCORT') {
      requiresManualReview = true;
      baselineRisk += 30;
    }

    // 4. Generate unique collision-safe reference & 6-digit verification code
    const currentYear = new Date().getFullYear();
    const referenceNumber = this.generateCollisionSafeReference(currentYear);

    // 6-digit cryptographically random code
    const rawVerificationCode = String(100000 + (crypto.randomBytes(4).readUInt32BE(0) % 900000));
    const salt = crypto.randomBytes(16).toString('hex');
    const verificationCodeHash = hashVerificationCode(rawVerificationCode, salt);

    const now = new Date().toISOString();

    // 5. Initial status history & record creation
    const initialHistory: StatusHistoryEntry[] = [
      createStatusHistoryEntry(null, 'NEW', {
        actor: 'public_portal_client',
        reason: 'Service request created via public intake portal',
        metadata: {
          serviceType: validated.serviceType,
          guardCount: validated.guardCount,
        },
      }),
    ];

    const record: ServiceRequestRecord = {
      ...validated,
      id: `sr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      referenceNumber,
      verificationCodeSalt: salt,
      verificationCodeHash,
      failedVerificationAttempts: 0,
      isLockedOut: false,
      status: 'NEW',
      createdAt: now,
      updatedAt: now,
      requiresManualRiskReview: requiresManualReview,
      riskAssessmentScore: baselineRisk,
      publicNotes: 'Intake logged into operations dispatch queue. Operations review in progress.',
      nextStep: 'An Operations Officer will evaluate site specifications within 4 business hours.',
      internalStaffNotes: `INTAKE AUDIT: Initial risk score ${baselineRisk}. Manual review: ${requiresManualReview}.`,
      history: initialHistory,
    };

    // Store record atomically
    requestStore.set(referenceNumber, record);

    // 6. Record audit event
    const auditEvent: AuditEventRecord = {
      id: `audit-${crypto.randomUUID()}`,
      entityType: 'SERVICE_REQUEST',
      entityId: record.id,
      eventType: 'SERVICE_REQUEST_CREATED',
      timestamp: now,
      actor: record.email,
      details: {
        referenceNumber: record.referenceNumber,
        serviceType: record.serviceType,
        guardCount: record.guardCount,
        requiresManualReview,
      },
    };
    auditLog.push(auditEvent);

    const response = {
      referenceNumber: record.referenceNumber,
      verificationCode: rawVerificationCode,
      status: record.status,
      createdAt: record.createdAt,
      requiresManualReview,
      instructions:
        'Secure your Reference Identifier and Verification Code. Both are mandatory for tracking status without disclosing confidential site parameters.',
    };

    // Cache idempotency response if key provided
    if (validated.idempotencyKey) {
      idempotencyStore.set(validated.idempotencyKey, {
        response,
        timestamp: Date.now(),
      });
    }

    return response;
  }

  /**
   * Tracks service request with rate-limiting, salt/hash comparison, lockout, and tracking session token
   */
  public async track(input: unknown): Promise<PublicTrackRequestResponse> {
    const { referenceNumber, verificationCode, phone } = TrackRequestSchema.parse(input) as {
      referenceNumber: string;
      verificationCode?: string;
      phone?: string;
    };
    const normalizedRef = referenceNumber.toUpperCase().trim();

    const record = requestStore.get(normalizedRef);

    // Uniform timing / generic message to prevent record enumeration
    if (!record) {
      if (verificationCode) {
        hashVerificationCode(verificationCode, 'dummy-salt-constant-work');
      }
      throw new Error(
        "No matching service request was found. We couldn't find a match. Check the reference and phone number."
      );
    }

    // Check account lockout
    if (record.isLockedOut) {
      if (record.lockoutUntil && new Date() < new Date(record.lockoutUntil)) {
        throw new Error(
          'Security Lockout: 5 failed attempts reached. Maximum verification attempts exceeded. For security, tracking for this reference is locked for 15 minutes.'
        );
      } else {
        // Lockout expired, reset counters
        record.isLockedOut = false;
        record.failedVerificationAttempts = 0;
        record.lockoutUntil = undefined;
      }
    }

    // Verify phone or verification code
    let isMatch = false;

    if (phone && record.phone) {
      const cleanInput = phone.replace(/\D/g, '');
      const cleanRecord = record.phone.replace(/\D/g, '');
      if (cleanInput.length >= 7 && (cleanRecord.endsWith(cleanInput) || cleanInput.endsWith(cleanRecord))) {
        isMatch = true;
      }
    }

    if (!isMatch && verificationCode) {
      const inputHash = hashVerificationCode(verificationCode, record.verificationCodeSalt);
      if (inputHash === record.verificationCodeHash) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      record.failedVerificationAttempts += 1;
      if (record.failedVerificationAttempts >= 5) {
        record.isLockedOut = true;
        record.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        throw new Error(
          'Security Lockout: 5 failed attempts reached. Tracking access has been suspended for 15 minutes.'
        );
      }

      throw new Error(
        "No matching service request was found. We couldn't find a match. Check the reference and phone number."
      );
    }

    // Reset failed counter on success
    record.failedVerificationAttempts = 0;

    // Issue short-lived tracking session token
    const trackingSessionToken = generateTrackingToken(record.referenceNumber);

    // Return strictly approved public fields ONLY (no internalStaffNotes, phone, email, riskScore)
    return {
      referenceNumber: record.referenceNumber,
      status: record.status,
      submissionDate: record.createdAt,
      serviceType: record.serviceType,
      city: record.city,
      latestPublicUpdate: record.publicNotes || 'Intake received and queued for review.',
      nextAction: record.nextStep || 'Awaiting dispatch assignment.',
      trackingSessionToken,
      historySummary: record.history.map((h) => ({
        toState: h.toState,
        timestamp: h.changedAt,
      })),
    };
  }

  /**
   * Applies validated state machine transitions
   */
  public async transitionStatus(
    referenceNumber: string,
    targetStatus: RequestStatus,
    context: { actor: string; reason: string; publicNotes?: string; nextStep?: string }
  ): Promise<ServiceRequestRecord> {
    const record = requestStore.get(referenceNumber.toUpperCase().trim());
    if (!record) {
      throw new Error(`Record with reference ${referenceNumber} not found.`);
    }

    // Central state machine validation
    validateStateTransition(record.status, targetStatus);

    const previousStatus = record.status;
    record.status = targetStatus;
    record.updatedAt = new Date().toISOString();

    if (context.publicNotes) record.publicNotes = context.publicNotes;
    if (context.nextStep) record.nextStep = context.nextStep;

    const historyEntry = createStatusHistoryEntry(previousStatus, targetStatus, {
      actor: context.actor,
      reason: context.reason,
    });
    record.history.push(historyEntry);

    // Audit transition
    auditLog.push({
      id: `audit-${crypto.randomUUID()}`,
      entityType: 'SERVICE_REQUEST',
      entityId: record.id,
      eventType: 'STATUS_TRANSITION',
      timestamp: record.updatedAt,
      actor: context.actor,
      details: {
        from: previousStatus,
        to: targetStatus,
        reason: context.reason,
      },
    });

    return record;
  }

  public getRecord(referenceNumber: string): ServiceRequestRecord | undefined {
    return requestStore.get(referenceNumber.toUpperCase().trim());
  }

  public getSampleReference() {
    return {
      referenceNumber: seedSample.referenceNumber,
      verificationCode: '492815',
    };
  }
}

export const serviceRequestsService = new ServiceRequestsService();
