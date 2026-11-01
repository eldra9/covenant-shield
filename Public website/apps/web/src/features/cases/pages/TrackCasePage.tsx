import React, { useState, useEffect } from 'react';
import { PageHeaderBand } from '../../../components/ui/PageHeaderBand.tsx';
import { FormField } from '../../../components/forms/FormField.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { MagneticButton } from '../../../motion/MagneticButton.tsx';
import { trackCase } from '../api/casesApi.ts';
import { PublicTrackCaseResponse, CaseStatus } from '../../../../../../packages/shared/src/types/index.ts';
import { CASE_CATEGORY_LABELS, CASE_STATUS_LABELS } from '../../../../../../packages/shared/src/constants/index.ts';
import { formatDate } from '../../../lib/formatters.ts';
import {
  Search,
  Phone,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export interface TrackCasePageProps {
  onNavigate: (path: string) => void;
  initialReference?: string;
  initialPhone?: string;
}

export const TrackCasePage: React.FC<TrackCasePageProps> = ({
  onNavigate,
  initialReference = '',
  initialPhone = '',
}) => {
  const [referenceNumber, setReferenceNumber] = useState(initialReference);
  const [phone, setPhone] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseRecord, setCaseRecord] = useState<PublicTrackCaseResponse | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (rateLimitSeconds === null || rateLimitSeconds <= 0) return;
    const timer = setInterval(() => {
      setRateLimitSeconds((prev) => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitSeconds]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimitSeconds) return;

    if (!referenceNumber.trim() || !phone.trim()) {
      setError("We couldn't find a match. Check the reference and phone number.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCaseRecord(null);

    try {
      const data = await trackCase(referenceNumber.trim().toUpperCase(), {
        phone: phone.trim(),
        verificationCode: phone.trim(),
      });
      setCaseRecord(data);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : '';
      if (errMsg.includes('429') || errMsg.toLowerCase().includes('too many requests')) {
        setRateLimitSeconds(60);
      } else {
        setError("We couldn't find a match. Check the reference and phone number.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillSample = () => {
    setReferenceNumber('CS-2026-00045');
    setPhone('+1 555-402-9912');
    setError(null);
  };

  const caseTimelineSteps: { key: CaseStatus; label: string; desc: string }[] = [
    { key: 'LOGGED', label: 'Case Registered', desc: 'Case entered into the Quality Assurance Standards Register.' },
    { key: 'INVESTIGATING', label: 'Supervisory Review', desc: 'Senior Field Assessor examining dispatch logs and incident footage.' },
    { key: 'ACTION_PENDING', label: 'Findings Formulated', desc: 'Formal resolution determinations completed by Regional QA Director.' },
    { key: 'RESOLVED', label: 'Closed & Remediated', desc: 'Administrative follow-up executed and official case archived.' },
  ];

  const currentStepIndex = caseRecord
    ? caseTimelineSteps.findIndex((s) => s.key === caseRecord.status)
    : -1;

  return (
    <div className="w-full bg-[#F4F6F4] min-h-screen">
      {/* Header Band */}
      <PageHeaderBand
        title="Track a Case."
        badge="PROFESSIONAL STANDARDS REGISTER"
        subtitle="Follow complaint resolutions, commendation records, and supervisory findings using your case reference and phone number. [DRAFT]"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Track Case', path: '/track-case' },
        ]}
        onNavigate={onNavigate}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-10">
        {/* Track Query Box */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#D9E0DC] shadow-xs">
          <form onSubmit={handleTrack} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                id="case-ref"
                label="Case Reference Identifier"
                required
                hint="Format: CS-YYYY-XXXXX"
              >
                <Input
                  id="case-ref"
                  placeholder="e.g. CS-2026-00045"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </FormField>

              <FormField
                id="case-phone"
                label="Phone Number"
                required
                hint="Phone number entered with feedback (or verification code)"
              >
                <Input
                  id="case-phone"
                  placeholder="e.g. +1 555-402-9912"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </FormField>
            </div>

            {/* 429 Rate Limit Countdown */}
            {rateLimitSeconds !== null && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3 animate-fadeIn"
              >
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Query rate limit engaged:{' '}
                  <strong>{rateLimitSeconds} seconds remaining</strong> before retry permitted.
                </span>
              </div>
            )}

            {/* Generic Mismatch Error Copy */}
            {error && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-[#FBE9E9] border border-[#A12B2B]/40 text-[#A12B2B] text-xs flex items-center gap-2.5 animate-fadeIn"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleFillSample}
                className="text-xs text-[#003C35] font-semibold hover:text-[#C9A04A] underline cursor-pointer"
              >
                Fill sample case (CS-2026-00045)
              </button>

              <MagneticButton
                type="submit"
                variant="gold"
                disabled={isLoading || rateLimitSeconds !== null}
                className="w-full sm:w-auto !px-7 !py-3 font-bold uppercase text-xs tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Searching...' : 'Track Case Progress'}</span>
                </span>
              </MagneticButton>
            </div>
          </form>
        </div>

        {/* ========================================================
            TRACKING RESULT: DispatchTicket + Timeline
        ======================================================== */}
        {caseRecord && !isLoading && (
          <div className="space-y-8 animate-fadeIn" style={{ animationDuration: '600ms' }}>
            {/* Dispatch Ticket Card */}
            <div
              className="rounded-2xl bg-[#0D322D] text-white border border-[#C9A04A]/40 p-6 sm:p-8 shadow-xl relative overflow-hidden"
              style={{
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25), 0 20px 40px rgba(0,20,16,0.3)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#003C35] flex items-center justify-center border border-[#C9A04A]/30">
                    <ShieldCheck className="w-5 h-5 text-[#C9A04A]" />
                  </div>
                  <div>
                    <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-white block">
                      {caseRecord.referenceNumber}
                    </span>
                    <span className="text-[11px] font-mono text-[#C9A04A]">
                      Registered · {formatDate(caseRecord.submissionDate)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-[#1E6B45]/40 text-[#E7F3EC] border border-[#1E6B45]/60">
                    {CASE_STATUS_LABELS[caseRecord.status]?.label || caseRecord.status}
                  </span>
                </div>
              </div>

              {/* Classification */}
              <div className="mt-4 p-3.5 rounded-lg bg-[#092824] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
                  Feedback Classification
                </span>
                <span className="text-sm font-semibold text-white">
                  {CASE_CATEGORY_LABELS[caseRecord.category] || caseRecord.category}
                </span>
              </div>

              {/* Supervisory findings */}
              <div className="mt-4 p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-1.5">
                <span className="text-xs font-mono font-semibold text-blue-300 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#C9A04A]" />
                  <span>Supervisory Examination Findings</span>
                </span>
                <p className="text-sm text-blue-100 leading-relaxed font-medium">
                  {caseRecord.latestPublicUpdate}
                </p>
              </div>

              {/* Remediation */}
              <div className="mt-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
                <span className="text-xs font-mono font-semibold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Remediation &amp; Case Resolution</span>
                </span>
                <p className="text-sm text-emerald-100 leading-relaxed font-medium">
                  {caseRecord.nextAction}
                </p>
              </div>
            </div>

            {/* Vertical Timeline */}
            <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#D9E0DC] shadow-xs space-y-6">
              <h3 className="font-display text-xl font-semibold text-[#003C35] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C9A04A]" />
                <span>Oversight Milestone Stages</span>
              </h3>

              <div className="relative pl-8 space-y-8">
                <div
                  className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-[#D9E0DC]"
                  aria-hidden="true"
                >
                  <div
                    className="w-full bg-[#C9A04A] transition-all duration-[600ms] ease-out"
                    style={{
                      height: `${Math.max(
                        0,
                        Math.min(100, ((currentStepIndex + 1) / caseTimelineSteps.length) * 100)
                      )}%`,
                    }}
                  />
                </div>

                {caseTimelineSteps.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const isPending = idx > currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className="relative flex items-start gap-4 transition-opacity duration-300"
                      style={{
                        animation: `fadeIn 400ms var(--e-silk) forwards ${idx * 120}ms`,
                      }}
                    >
                      <div
                        className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-[#003C35] text-[#C9A04A] ring-4 ring-[#E6EFEC]'
                            : isCurrent
                            ? 'bg-[#C9A04A] text-[#003C35] ring-4 ring-[#FFF4DB]'
                            : 'bg-white text-gray-400 border-2 border-[#D9E0DC]'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4
                            className={`text-sm font-bold ${
                              isCurrent
                                ? 'text-[#003C35] font-display'
                                : isCompleted
                                ? 'text-[#003C35]'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#FFF4DB] text-[#8A5A00] font-bold">
                              Current Stage
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs leading-relaxed ${
                            isPending ? 'text-gray-400' : 'text-[#52625D]'
                          }`}
                        >
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
