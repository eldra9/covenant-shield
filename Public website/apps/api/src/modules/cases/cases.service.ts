import crypto from 'crypto';
import {
  CaseInput,
  CaseRecord,
  PublicTrackCaseResponse,
  ContactMessageInput,
  StoredAttachment,
} from '../../../../../packages/shared/src/types/index.ts';
import {
  CaseSchema,
  TrackCaseSchema,
  ContactMessageSchema,
} from '../../../../../packages/shared/src/schemas/index.ts';
import { filesService } from '../files/files.service.ts';

const caseStore = new Map<string, CaseRecord>();
const contactMessages: ContactMessageInput[] = [];
const caseIdempotencyStore = new Map<string, { response: unknown; timestamp: number }>();

const TRACKING_SECRET = process.env.TRACKING_SECRET || 'covenant-shield-tracking-secret-key-32b';

function hashVerificationCode(code: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${code.trim()}`).digest('hex');
}

function generateCaseTrackingToken(referenceNumber: string): string {
  const expiresAt = Date.now() + 1000 * 60 * 30; // 30 minutes
  const payload = `${referenceNumber}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', TRACKING_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

// Sanitize user text to prevent stored XSS
function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Seed sample case for demonstration and tracking test
const seedCaseSalt = 'cs-seed-case-salt';
const seedCaseSample: CaseRecord = {
  id: 'cs-sample-1',
  referenceNumber: 'CS-2026-00045',
  category: 'COMPLIMENT',
  contactName: 'Elena Rostova',
  email: 'e.rostova@crestwood-estates.com',
  phone: '+1 555-402-9912',
  relatedSite: 'Crestwood Corporate Executive Campus',
  personnelRef: 'Officer Marcus Vance (ID #CS-881)',
  rating: 5,
  description:
    'Officer Vance demonstrated exemplary vigilance during our late evening executive board gathering. He swiftly intercepted an unauthorized intruder at the perimeter barrier without causing any disruption.',
  privacyConsent: true,
  status: 'RESOLVED',
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
  verificationCodeSalt: seedCaseSalt,
  verificationCodeHash: hashVerificationCode('829143', seedCaseSalt),
  failedVerificationAttempts: 0,
  isLockedOut: false,
  publicNotes: 'Supervisory commendation filed in Officer Vance personal conduct log. Letter of appreciation issued.',
  nextStep: 'Case closed with official administrative commendation.',
  internalStaffNotes: 'RESTRICTED HR LOG: Officer commended by Regional QA Director. Commendation bonus approved.',
  history: [
    {
      id: 'case-hist-1',
      fromState: null,
      toState: 'LOGGED',
      changedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      actor: 'system',
      reason: 'Commendation registered via public oversight portal',
    },
    {
      id: 'case-hist-2',
      fromState: 'LOGGED',
      toState: 'RESOLVED',
      changedAt: new Date(Date.now() - 86400000).toISOString(),
      actor: 'qa_supervisor_elena',
      reason: 'Verified incident with onsite dispatch logs and commendation filed',
    },
  ],
  storedFiles: [],
};

caseStore.set(seedCaseSample.referenceNumber, seedCaseSample);

export class CasesService {
  /**
   * Generates a collision-safe, unpredictable reference number.
   */
  private generateCollisionSafeReference(year: number): string {
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      const randomInt = 10000 + (crypto.randomBytes(4).readUInt32BE(0) % 90000);
      const candidate = `CS-${year}-${randomInt}`;
      if (!caseStore.has(candidate)) {
        return candidate;
      }
    }
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `CS-${year}-${suffix}`;
  }

  public async createCase(input: unknown): Promise<{
    referenceNumber: string;
    verificationCode: string;
    status: string;
    createdAt: string;
    category: string;
    instructions: string;
  }> {
    const validated = CaseSchema.parse(input);

    // Idempotency check
    if (validated.idempotencyKey) {
      const cached = caseIdempotencyStore.get(validated.idempotencyKey);
      if (cached && Date.now() - cached.timestamp < 86400000) {
        return cached.response as {
          referenceNumber: string;
          verificationCode: string;
          status: string;
          createdAt: string;
          category: string;
          instructions: string;
        };
      }
    }

    const currentYear = new Date().getFullYear();
    const referenceNumber = this.generateCollisionSafeReference(currentYear);

    const rawVerificationCode = String(100000 + (crypto.randomBytes(4).readUInt32BE(0) % 900000));
    const salt = crypto.randomBytes(16).toString('hex');
    const verificationCodeHash = hashVerificationCode(rawVerificationCode, salt);

    // Sanitize user description against stored XSS
    const sanitizedDescription = sanitizeText(validated.description);

    const now = new Date().toISOString();

    const record: CaseRecord = {
      ...validated,
      description: sanitizedDescription,
      id: `cs-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      referenceNumber,
      verificationCodeSalt: salt,
      verificationCodeHash,
      failedVerificationAttempts: 0,
      isLockedOut: false,
      status: 'LOGGED',
      createdAt: now,
      updatedAt: now,
      publicNotes: 'Feedback entered into the Covenant Shield Professional Standards Register.',
      nextStep: 'Assigned to the Regional Quality Assurance Director for examination.',
      internalStaffNotes: `INTERNAL CASE LOG: Category=${validated.category}. Rated=${validated.rating || 'N/A'}.`,
      history: [
        {
          id: `chist-${Date.now()}`,
          fromState: null,
          toState: 'LOGGED',
          changedAt: now,
          actor: 'public_portal_client',
          reason: 'Initial case submission',
        },
      ],
      storedFiles: [],
    };

    caseStore.set(referenceNumber, record);

    const response = {
      referenceNumber: record.referenceNumber,
      verificationCode: rawVerificationCode,
      status: record.status,
      category: record.category,
      createdAt: record.createdAt,
      instructions:
        'Please record your Case Reference Number and Verification Code to check progress and supervisory resolution.',
    };

    if (validated.idempotencyKey) {
      caseIdempotencyStore.set(validated.idempotencyKey, {
        response,
        timestamp: Date.now(),
      });
    }

    return response;
  }

  public async trackCase(input: unknown): Promise<PublicTrackCaseResponse> {
    const { referenceNumber, verificationCode, phone } = TrackCaseSchema.parse(input) as {
      referenceNumber: string;
      verificationCode?: string;
      phone?: string;
    };
    const normalizedRef = referenceNumber.toUpperCase().trim();

    const record = caseStore.get(normalizedRef);

    if (!record) {
      if (verificationCode) {
        hashVerificationCode(verificationCode, 'dummy-salt-constant-work');
      }
      throw new Error(
        "No matching case was found. We couldn't find a match. Check the reference and phone number."
      );
    }

    // Check account lockout
    if (record.isLockedOut) {
      if (record.lockoutUntil && new Date() < new Date(record.lockoutUntil)) {
        throw new Error(
          'Security Lockout: Maximum attempts exceeded. Case tracking locked for 15 minutes.'
        );
      } else {
        record.isLockedOut = false;
        record.failedVerificationAttempts = 0;
        record.lockoutUntil = undefined;
      }
    }

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
          'Security Lockout: 5 failed attempts reached. Case tracking suspended for 15 minutes.'
        );
      }

      throw new Error(
        "No matching case was found. We couldn't find a match. Check the reference and phone number."
      );
    }

    record.failedVerificationAttempts = 0;
    const trackingSessionToken = generateCaseTrackingToken(record.referenceNumber);

    // Authorize access to any attachments
    record.storedFiles.forEach((file) => {
      filesService.authorizeAccess(file.id, trackingSessionToken);
    });

    return {
      referenceNumber: record.referenceNumber,
      category: record.category,
      status: record.status,
      submissionDate: record.createdAt,
      latestPublicUpdate: record.publicNotes || 'Case is currently under administrative evaluation.',
      nextAction: record.nextStep || 'Awaiting supervisor findings.',
      trackingSessionToken,
    };
  }

  public async handleContactMessage(input: unknown): Promise<{
    success: boolean;
    ticketId: string;
    message: string;
  }> {
    const validated = ContactMessageSchema.parse(input);
    contactMessages.push(validated);
    const ticketId = `MSG-${Date.now().toString().slice(-6)}`;

    return {
      success: true,
      ticketId,
      message: 'Your inquiry has been routed to our Operations Command desk. We will respond shortly.',
    };
  }

  public getRecord(referenceNumber: string): CaseRecord | undefined {
    return caseStore.get(referenceNumber.toUpperCase().trim());
  }

  public getSampleCase() {
    return {
      referenceNumber: seedCaseSample.referenceNumber,
      verificationCode: '829143',
    };
  }
}

export const casesService = new CasesService();
