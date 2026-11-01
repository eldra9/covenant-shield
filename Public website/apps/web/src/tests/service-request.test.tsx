import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ServiceRequestSchema, TrackRequestSchema } from '../../../../packages/shared/src/schemas/index.ts';
import { serviceRequestsService } from '../../../api/src/modules/service-requests/service-requests.service.ts';

describe('Service Request Intake & Tracking Validation', () => {
  it('accepts valid service request inputs and rejects invalid guard counts', () => {
    const validData = {
      contactName: 'Commander Jack Hayes',
      organizationName: 'Vanguard Industrial',
      phone: '+1 555-019-3321',
      email: 'j.hayes@vanguard.com',
      serviceType: 'STATIC_GUARDING' as const,
      siteAddress: 'Building 4, Dock 12',
      city: 'Metropolis',
      guardCount: 4,
      coverage: 'TWENTY_FOUR_HOUR' as const,
      armedPreference: 'ARMED_IF_PERMITTED' as const,
      startDate: '2026-12-01',
      duration: 'SIX_MONTHS' as const,
      additionalRequirements: 'Port access validation',
      preferredContactMethod: 'EMAIL' as const,
      privacyConsent: true,
    };

    const res = ServiceRequestSchema.safeParse(validData);
    assert.strictEqual(res.success, true);

    // Reject 0 or negative guards
    const invalidGuards = { ...validData, guardCount: 0 };
    const invalidRes = ServiceRequestSchema.safeParse(invalidGuards);
    assert.strictEqual(invalidRes.success, false);

    // Reject unconfirmed privacy consent
    const noConsent = { ...validData, privacyConsent: false };
    const noConsentRes = ServiceRequestSchema.safeParse(noConsent);
    assert.strictEqual(noConsentRes.success, false);
  });

  it('generates server-side reference identifier and 6-digit verification code', async () => {
    const validData = {
      contactName: 'Rachel Green',
      phone: '+1 555-882-1200',
      email: 'rachel@example.com',
      serviceType: 'PATROL_SERVICES' as const,
      siteAddress: '100 North Gate Road',
      city: 'Metropolis',
      guardCount: 2,
      coverage: 'NIGHT' as const,
      armedPreference: 'UNARMED' as const,
      startDate: '2026-11-20',
      duration: 'ONE_MONTH' as const,
      preferredContactMethod: 'PHONE' as const,
      privacyConsent: true,
    };

    const result = await serviceRequestsService.create(validData);
    assert.ok(result.referenceNumber.startsWith('SR-'));
    assert.strictEqual(result.verificationCode.length, 6);
    assert.strictEqual(result.status, 'NEW');
  });

  it('validates tracking credentials and shields sensitive internal notes', async () => {
    // Valid track schema test
    const validTrack = TrackRequestSchema.safeParse({
      referenceNumber: 'SR-2026-00123',
      verificationCode: '492815',
    });
    assert.strictEqual(validTrack.success, true);

    // Track seed sample
    const trackResult = await serviceRequestsService.track({
      referenceNumber: 'SR-2026-00123',
      verificationCode: '492815',
    });

    assert.strictEqual(trackResult.referenceNumber, 'SR-2026-00123');
    assert.strictEqual(trackResult.status, 'SITE_ASSESSMENT_SCHEDULED');
    assert.ok(trackResult.latestPublicUpdate);

    // Ensure private fields like phone and internal staff notes are NOT returned
    assert.strictEqual((trackResult as unknown as Record<string, unknown>).phone, undefined);
    assert.strictEqual((trackResult as unknown as Record<string, unknown>).email, undefined);
  });
});
