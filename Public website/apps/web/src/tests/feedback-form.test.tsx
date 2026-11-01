import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CaseSchema, TrackCaseSchema } from '../../../../packages/shared/src/schemas/index.ts';
import { casesService } from '../../../api/src/modules/cases/cases.service.ts';

describe('Feedback & Complaints Oversight Processing', () => {
  it('validates formal case submissions', () => {
    const validFeedback = {
      category: 'COMPLAINT' as const,
      contactName: 'Diana Prince',
      email: 'diana@metropolis.org',
      phone: '+1 555-888-9999',
      relatedSite: 'Embassy Plaza West Gate',
      personnelRef: 'Officer Johnson (Badge #CS-109)',
      rating: 2,
      description: 'Sentry post was unattended during the 18:00 rotation shift.',
      privacyConsent: true,
    };

    const res = CaseSchema.safeParse(validFeedback);
    assert.strictEqual(res.success, true);

    // Reject short descriptions (< 10 chars)
    const shortDesc = { ...validFeedback, description: 'bad' };
    const shortRes = CaseSchema.safeParse(shortDesc);
    assert.strictEqual(shortRes.success, false);
  });

  it('allows anonymous general feedback without a name or email', () => {
    const generalFeedback = {
      category: 'GENERAL_FEEDBACK' as const,
      contactName: '',
      email: '',
      description: 'The site perimeter lighting needs better visibility after dusk.',
      privacyConsent: true,
    };

    const res = CaseSchema.safeParse(generalFeedback);
    assert.strictEqual(res.success, true);
  });

  it('records case with CS-YYYY-XXXXX format and allows safe tracking', async () => {
    const validFeedback = {
      category: 'COMPLIMENT' as const,
      contactName: 'Bruce Wayne',
      email: 'bruce@wayne-enterprises.com',
      description: 'Outstanding perimeter defense during the annual executive charity banquet.',
      privacyConsent: true,
    };

    const result = await casesService.createCase(validFeedback);
    assert.ok(result.referenceNumber.startsWith('CS-'));
    assert.strictEqual(result.verificationCode.length, 6);

    // Track seed sample case
    const tracked = await casesService.trackCase({
      referenceNumber: 'CS-2026-00045',
      verificationCode: '829143',
    });
    assert.strictEqual(tracked.referenceNumber, 'CS-2026-00045');
    assert.strictEqual(tracked.status, 'RESOLVED');
  });
});
