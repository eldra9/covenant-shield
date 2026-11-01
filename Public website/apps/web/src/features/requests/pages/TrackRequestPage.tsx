import React, { useState, useEffect } from 'react';
import { PageHeaderBand } from '../../../components/ui/PageHeaderBand.tsx';
import { FormField } from '../../../components/forms/FormField.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { MagneticButton } from '../../../motion/MagneticButton.tsx';
import { trackServiceRequest } from '../api/requestsApi.ts';
import { PublicTrackRequestResponse, RequestStatus } from '../../../../../../packages/shared/src/types/index.ts';
import { SERVICE_TYPE_LABELS, REQUEST_STATUS_LABELS } from '../../../../../../packages/shared/src/constants/index.ts';
import { formatDate } from '../../../lib/formatters.ts';
import {
  Search,
  Phone,
  Shield,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export interface TrackRequestPageProps {
  onNavigate: (path: string) => void;
  initialReference?: string;
  initialPhone?: string;
}

export const TrackRequestPage: React.FC<TrackRequestPageProps> = ({
  onNavigate,
  initialReference = '',
  initialPhone = '',
}) => {
  const [referenceNumber, setReferenceNumber] = useState(initialReference);
  const [phone, setPhone] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<PublicTrackRequestResponse | null>(null);

  // 429 Rate Limit Countdown
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
    setRecord(null);

    try {
      const data = await trackServiceRequest(referenceNumber.trim().toUpperCase(), {
        phone: phone.trim(),
        verificationCode: phone.trim(),
      });
      setRecord(data);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : '';
      if (errMsg.includes('429') || errMsg.toLowerCase().includes('too many requests')) {
        setRateLimitSeconds(60);
      } else {
        // Uniform copy required by specification
        setError("We couldn't find a match. Check the reference and phone number.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillSample = () => {
    setReferenceNumber('SR-2026-00123');
    setPhone('+1 555-019-2834');
    setError(null);
  };

  // Client-visible timeline steps
  const clientVisibleSteps: { key: RequestStatus; label: string; desc: string }[] = [
    { key: 'NEW', label: 'Intake Logged', desc: 'Received into operations registry and assigned reference.' },
    { key: 'UNDER_REVIEW', label: 'Risk Profile Review', desc: 'Tactical threat matrix and licensing assessment in progress.' },
    { key: 'SITE_ASSESSMENT_SCHEDULED', label: 'Site Assessment', desc: 'Physical perimeter survey by Senior Field Assessor.' },
    { key: 'QUOTATION_SENT', label: 'Quotation Sent', desc: 'Formal post orders and SLA sent to client.' },
    { key: 'ACCEPTED', label: 'Mobilization', desc: 'Sentry shifts rostered and logistics confirmed.' },
    { key: 'CONTRACT_ACTIVE', label: 'Active Post', desc: 'Guard deployment active under continuous supervisory watch.' },
  ];

  const currentStepIndex = record
    ? clientVisibleSteps.findIndex((s) => s.key === record.status)
    : -1;

  return (
    <div className="w-full bg-[#F4F6F4] min-h-screen">
      {/* Header Band */}
      <PageHeaderBand
        title="Track a Request."
        badge="DISPATCH REGISTRY QUERY"
        subtitle="Check live dispatch review findings, survey schedules, and mobilization milestones using your reference and verified phone. [DRAFT]"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Track Request', path: '/track' },
        ]}
        onNavigate={onNavigate}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-10">
        {/* Track Query Box */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#D9E0DC] shadow-xs">
          <form onSubmit={handleTrack} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                id="track-ref"
                label="Reference Identifier"
                required
                hint="Format: SR-YYYY-XXXXX"
              >
                <Input
                  id="track-ref"
                  placeholder="e.g. SR-2026-00123"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </FormField>

              <FormField
                id="track-phone"
                label="Contact Phone Number"
                required
                hint="Phone number entered during intake (or 6-digit code)"
              >
                <Input
                  id="track-phone"
                  placeholder="e.g. +1 555-019-2834"
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
                  Query rate limit engaged. Dispatch registry cooldown in effect:{' '}
                  <strong>{rateLimitSeconds} seconds remaining</strong> before next retry.
                </span>
              </div>
            )}

            {/* Generic Mismatch Copy */}
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
                Fill sample reference (SR-2026-00123)
              </button>

              <MagneticButton
                type="submit"
                variant="gold"
                disabled={isLoading || rateLimitSeconds !== null}
                className="w-full sm:w-auto !px-7 !py-3 font-bold uppercase text-xs tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Querying Dispatch...' : 'Query Status'}</span>
                </span>
              </MagneticButton>
            </div>
          </form>
        </div>

        {/* ========================================================
            TRACKING RESULT: DispatchTicket + Vertical Timeline
        ======================================================== */}
        {record && !isLoading && (
          <div
            className="space-y-8 animate-fadeIn"
            style={{ animationDuration: '600ms' }}
          >
            {/* 1. Dispatch Ticket Card */}
            <div
              className="rounded-2xl bg-[#0D322D] text-white border border-[#C9A04A]/40 p-6 sm:p-8 shadow-xl relative overflow-hidden"
              style={{
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25), 0 20px 40px rgba(0,20,16,0.3)',
              }}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#003C35] flex items-center justify-center border border-[#C9A04A]/30">
                    <ShieldCheck className="w-5 h-5 text-[#C9A04A]" />
                  </div>
                  <div>
                    <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-white block">
                      {record.referenceNumber}
                    </span>
                    <span className="text-[11px] font-mono text-[#C9A04A]">
                      Intake Logged · {formatDate(record.submissionDate)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-[#1D4E89]/40 text-[#E8F0FA] border border-[#1D4E89]/60">
                    {REQUEST_STATUS_LABELS[record.status]?.label || record.status}
                  </span>
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                <div className="p-3.5 rounded-lg bg-[#092824] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
                    Security Discipline
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {SERVICE_TYPE_LABELS[record.serviceType] || record.serviceType}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#092824] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
                    Deployment Locality
                  </span>
                  <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A04A]" />
                    <span>{record.city}</span>
                  </span>
                </div>
              </div>

              {/* Latest Approved Public Update */}
              <div className="mt-4 p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-300">
                  <Clock className="w-3.5 h-3.5 text-[#C9A04A]" />
                  <span>Approved Public Operations Note</span>
                </div>
                <p className="text-sm text-blue-100 leading-relaxed">
                  {record.latestPublicUpdate}
                </p>
              </div>

              {/* Next Operational Step */}
              <div className="mt-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Next Action Milestone</span>
                </div>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  {record.nextAction}
                </p>
              </div>

              {/* Authenticated Token */}
              {record.trackingSessionToken && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 font-mono">
                  <span>Signed 2FA Session Active (30m)</span>
                  <span className="truncate max-w-[140px] text-[#C9A04A]">
                    {record.trackingSessionToken.slice(0, 16)}...
                  </span>
                </div>
              )}
            </div>

            {/* 2. Vertical Timeline (line draws top to bottom 600ms, steps fade in 120ms apart) */}
            <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#D9E0DC] shadow-xs space-y-6">
              <h3 className="font-display text-xl font-semibold text-[#003C35] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C9A04A]" />
                <span>Operational Milestone Timeline</span>
              </h3>

              <div className="relative pl-8 space-y-8">
                {/* Vertical connecting line that draws top to bottom (600ms) */}
                <div
                  className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-[#D9E0DC]"
                  aria-hidden="true"
                >
                  <div
                    className="w-full bg-[#C9A04A] transition-all duration-[600ms] ease-out"
                    style={{
                      height: `${Math.max(
                        0,
                        Math.min(100, ((currentStepIndex + 1) / clientVisibleSteps.length) * 100)
                      )}%`,
                    }}
                  />
                </div>

                {clientVisibleSteps.map((step, idx) => {
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
                      {/* Milestone Dot */}
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
                              Current Status
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
