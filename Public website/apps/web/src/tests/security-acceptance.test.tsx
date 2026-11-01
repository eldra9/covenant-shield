import { describe, it } from 'node:test';
import assert from 'node:assert';
import { serviceRequestsService } from '../../../api/src/modules/service-requests/service-requests.service.ts';
import { validateStateTransition, InvalidStateTransitionError } from '../../../api/src/modules/service-requests/state-machine.ts';
import { casesService } from '../../../api/src/modules/cases/cases.service.ts';
import { filesService } from '../../../api/src/modules/files/files.service.ts';
import { checkRateLimit } from '../../../api/src/common/guards/rate-limit.guard.ts';
import { sanitizeError } from '../../../api/src/common/filters/http-exception.filter.ts';

describe('Security Acceptance & Data Integrity Matrix', () => {
  // 1. Rate limiting & enumeration prevention
  it('enforces rate limits on public query IP keys', () => {
    const testIp = `rate-test-ip-${Date.now()}`;
    // Limit to 5 for test key
    let passed = 0;
    for (let i = 0; i < 7; i++) {
      if (checkRateLimit(testIp, 5, 60000)) {
        passed++;
      }
    }
    assert.strictEqual(passed, 5, 'Must permit exactly 5 requests within the limit');
    assert.strictEqual(checkRateLimit(testIp, 5, 60000), false, '6th request must be rate limited');
  });

  // 2. Reference-only tracking reveals no private information / rejects without code
  it('rejects tracking queries without a valid verification code', async () => {
    await assert.rejects(
      async () => {
        await serviceRequestsService.track({
          referenceNumber: 'SR-2026-00123',
          verificationCode: '000000', // Invalid code
        });
      },
      (err: Error) => {
        assert.ok(err.message.includes('No matching service request was found'));
        return true;
      }
    );
  });

  // 3. Brute force protection & account lockout after 5 failed attempts
  it('locks tracking access after 5 failed verification attempts', async () => {
    // Create dedicated record for lockout test
    const record = await serviceRequestsService.create({
      contactName: 'Lockout Test Subject',
      phone: '+1 555-111-2222',
      email: 'lockout@test.com',
      serviceType: 'STATIC_GUARDING',
      siteAddress: '100 Security Gate',
      city: 'Metropolis',
      guardCount: 1,
      coverage: 'DAY',
      armedPreference: 'UNARMED',
      startDate: '2026-11-20',
      duration: 'ONE_MONTH',
      preferredContactMethod: 'EMAIL',
      privacyConsent: true,
    });

    // Attempt 4 failed codes
    for (let i = 1; i <= 4; i++) {
      try {
        await serviceRequestsService.track({
          referenceNumber: record.referenceNumber,
          verificationCode: '999999',
        });
      } catch (err: unknown) {
        assert.ok((err as Error).message.includes('No matching'));
      }
    }

    // 5th failed attempt must trigger security lockout
    await assert.rejects(
      async () => {
        await serviceRequestsService.track({
          referenceNumber: record.referenceNumber,
          verificationCode: '999999',
        });
      },
      (err: Error) => {
        assert.ok(err.message.includes('Security Lockout: 5 failed attempts reached'));
        return true;
      }
    );
  });

  // 4. Idempotency prevents duplicate submissions on retry
  it('preserves idempotency and prevents duplicate database records', async () => {
    const key = `idemp-key-${Date.now()}`;
    const payload = {
      contactName: 'Duplication Sentinel',
      phone: '+1 555-444-5555',
      email: 'sentinel@test.com',
      serviceType: 'PATROL_SERVICES' as const,
      siteAddress: 'Industrial Zone Perimeter',
      city: 'Metropolis',
      guardCount: 2,
      coverage: 'NIGHT' as const,
      armedPreference: 'UNARMED' as const,
      startDate: '2026-11-25',
      duration: 'ONE_MONTH' as const,
      preferredContactMethod: 'PHONE' as const,
      privacyConsent: true,
      idempotencyKey: key,
    };

    const first = await serviceRequestsService.create(payload);
    const second = await serviceRequestsService.create(payload);

    assert.strictEqual(
      first.referenceNumber,
      second.referenceNumber,
      'Idempotent call must return identical reference number'
    );
    assert.strictEqual(first.createdAt, second.createdAt, 'Timestamps must match cached record');
  });

  // 5. Concurrent requests collision safety: generates collision-free references
  it('generates unique collision-safe references under high volume', async () => {
    const requests = Array.from({ length: 25 }, (_, idx) =>
      serviceRequestsService.create({
        contactName: `Concurrent User ${idx}`,
        phone: '+1 555-777-8888',
        email: `concurrent${idx}@test.com`,
        serviceType: 'STATIC_GUARDING',
        siteAddress: `Site ${idx}`,
        city: 'Metropolis',
        guardCount: 1,
        coverage: 'DAY',
        armedPreference: 'UNARMED',
        startDate: '2026-12-01',
        duration: 'ONE_MONTH',
        preferredContactMethod: 'EMAIL',
        privacyConsent: true,
      })
    );

    const results = await Promise.all(requests);
    const references = results.map((r) => r.referenceNumber);
    const uniqueReferences = new Set(references);

    assert.strictEqual(
      references.length,
      uniqueReferences.size,
      'All concurrent reference numbers must be distinct'
    );
  });

  // 6. Centralized state machine transition validation
  it('rejects invalid workflow state transitions with stable error code', () => {
    // Valid transitions
    assert.doesNotThrow(() => validateStateTransition('NEW', 'UNDER_REVIEW'));
    assert.doesNotThrow(() => validateStateTransition('UNDER_REVIEW', 'SITE_ASSESSMENT_SCHEDULED'));
    assert.doesNotThrow(() => validateStateTransition('QUOTATION_SENT', 'ACCEPTED'));
    assert.doesNotThrow(() => validateStateTransition('ACCEPTED', 'CONTRACT_ACTIVE'));

    // Invalid transition: NEW directly to CONTRACT_ACTIVE
    assert.throws(
      () => validateStateTransition('NEW', 'CONTRACT_ACTIVE'),
      (err: InvalidStateTransitionError) => {
        assert.strictEqual(err.code, 'INVALID_STATE_TRANSITION');
        assert.ok(err.message.includes('Cannot transition'));
        return true;
      }
    );

    // Terminal state: CLOSED cannot transition to any other status
    assert.throws(
      () => validateStateTransition('CLOSED', 'NEW'),
      (err: InvalidStateTransitionError) => {
        assert.strictEqual(err.code, 'INVALID_STATE_TRANSITION');
        return true;
      }
    );
  });

  // 7. Internal case notes never appear in public responses
  it('redacts internal staff notes, phone, and internal risk scores from public DTOs', async () => {
    const tracked = await serviceRequestsService.track({
      referenceNumber: 'SR-2026-00123',
      verificationCode: '492815',
    });

    const publicDto = tracked as unknown as Record<string, unknown>;
    assert.strictEqual(publicDto.internalStaffNotes, undefined, 'Internal notes must be redacted');
    assert.strictEqual(publicDto.phone, undefined, 'Client phone must not be exposed');
    assert.strictEqual(publicDto.email, undefined, 'Client email must not be exposed');
    assert.strictEqual(publicDto.riskAssessmentScore, undefined, 'Risk score must be redacted');
    assert.ok(tracked.trackingSessionToken, 'Must issue signed tracking session token');
  });

  // 8. File processing: True signatures vs Spoofed signatures & Unauthorized downloads
  it('enforces true binary magic numbers and rejects spoofed files', async () => {
    // Valid PDF buffer: %PDF-1.4
    const validPdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
    const stored = await filesService.processUpload('incident-report.pdf', 'application/pdf', validPdfBuffer);
    assert.ok(stored.id.startsWith('file-'));
    assert.strictEqual(stored.quarantineStatus, 'CLEARED');

    // Spoofed file: .pdf extension with executable/malicious header
    const spoofedPdfBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00WindowsExecutablePayload');
    await assert.rejects(
      async () => {
        await filesService.processUpload('malware.pdf', 'application/pdf', spoofedPdfBuffer);
      },
      (err: Error) => {
        assert.ok(err.message.includes('does not match true PDF binary signature'));
        return true;
      }
    );

    // Unauthorized download rejection
    assert.throws(
      () => filesService.getFile(stored.id, undefined),
      (err: Error) => {
        assert.ok(err.message.includes('Unauthorized access'));
        return true;
      }
    );
  });

  // 9. Rejects oversized uploads (> 5MB)
  it('rejects uploads exceeding the 5MB maximum limit', async () => {
    const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024); // 5MB + 1KB
    await assert.rejects(
      async () => {
        await filesService.processUpload('huge.pdf', 'application/pdf', oversizedBuffer);
      },
      (err: Error) => {
        assert.ok(err.message.includes('exceeds the 5MB size limit'));
        return true;
      }
    );
  });

  // 10. Prevents stored XSS in case feedback descriptions
  it('sanitizes user text to prevent stored cross-site scripting', async () => {
    const xssPayload = {
      category: 'COMPLAINT' as const,
      contactName: 'Security Auditor',
      email: 'auditor@company.com',
      description: 'Breach attempt: <script>alert("XSS")</script><img src=x onerror=alert(1)>',
      privacyConsent: true,
    };

    const result = await casesService.createCase(xssPayload);
    const storedRecord = casesService.getRecord(result.referenceNumber);
    assert.ok(storedRecord, 'Record must exist in store');
    assert.ok(!storedRecord.description.includes('<script>'), 'Unescaped script tags must not be stored');
    assert.ok(storedRecord.description.includes('&lt;script&gt;'), 'Must be safely escaped');
  });

  // 11. Error sanitizer prevents stack traces and database leakages
  it('sanitizes error responses to prevent internal stack trace leakage', () => {
    const internalDbError = new Error('FATAL: connection to server at "10.0.4.12:5432" failed');
    internalDbError.stack = 'Error at pg.Client.connect (/app/node_modules/pg/client.js:124:19)';

    const sanitized = sanitizeError(internalDbError);
    assert.strictEqual(sanitized.statusCode, 500);
    assert.strictEqual(
      (sanitized as unknown as Record<string, unknown>).stack,
      undefined,
      'Stack trace must never leak to client'
    );
  });
});
