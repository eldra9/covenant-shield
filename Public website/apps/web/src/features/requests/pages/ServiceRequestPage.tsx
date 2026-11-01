import React, { useState, useRef, useId } from 'react';
import {
  ShieldCheck,
  CalendarCheck,
  UserCheck,
  Route,
  Video,
  Plus,
  Shield,
  Clock,
  MapPin,
  Check,
  Copy,
  AlertTriangle,
  Send,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Map,
  X,
} from 'lucide-react';
import { PageHeaderBand } from '../../../components/ui/PageHeaderBand.tsx';
import { FormField } from '../../../components/forms/FormField.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Select } from '../../../components/ui/Select.tsx';
import { Textarea } from '../../../components/ui/Textarea.tsx';
import { MagneticButton } from '../../../motion/MagneticButton.tsx';
import { SealStamp } from '../../../motion/SealStamp.tsx';
import {
  ServiceRequestSchema,
  ServiceRequestFormData,
} from '../../../../../../packages/shared/src/schemas/index.ts';
import {
  ServiceType,
  CoverageOption,
  ArmedPreference,
  DurationOption,
  ContactMethod,
} from '../../../../../../packages/shared/src/types/index.ts';
import {
  SERVICE_TYPE_LABELS,
  COVERAGE_LABELS,
  DURATION_LABELS,
} from '../../../../../../packages/shared/src/constants/index.ts';
import { submitServiceRequest, CreateServiceRequestResult } from '../api/requestsApi.ts';

export interface ServiceRequestPageProps {
  onNavigate: (path: string, options?: { serviceType?: ServiceType; referenceNumber?: string; phone?: string }) => void;
  initialServiceType?: ServiceType;
}

export const ServiceRequestPage: React.FC<ServiceRequestPageProps> = ({
  onNavigate,
  initialServiceType = 'STATIC_GUARDING',
}) => {
  // Form State
  const [formData, setFormData] = useState<ServiceRequestFormData>({
    contactName: '',
    organizationName: '',
    phone: '',
    email: '',
    serviceType: initialServiceType,
    siteAddress: '',
    city: '',
    coordinates: '',
    guardCount: 2,
    coverage: 'TWENTY_FOUR_HOUR' as CoverageOption,
    armedPreference: 'UNARMED' as ArmedPreference,
    startDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    duration: 'THREE_MONTHS' as DurationOption,
    additionalRequirements: '',
    preferredContactMethod: 'EMAIL' as ContactMethod,
    privacyConsent: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hasInteracted, setHasInteracted] = useState<Record<string, boolean>>({});
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<CreateServiceRequestResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Character limit for additional details: 1000 chars
  const maxChars = 1000;
  const currentChars = (formData.additionalRequirements || '').length;

  // Validation Checks for the 3 Numbered Cards (Foil Thread fill state)
  const isCard1Valid = Boolean(
    formData.contactName.trim().length >= 2 &&
    formData.phone.trim().length >= 7 &&
    formData.email.trim().includes('@')
  );

  const isCard2Valid = Boolean(
    formData.serviceType &&
    formData.siteAddress.trim().length >= 5 &&
    formData.city.trim().length >= 2 &&
    formData.guardCount >= 1 &&
    formData.startDate
  );

  const isCard3Valid = Boolean(
    formData.privacyConsent === true &&
    currentChars <= maxChars
  );

  // Field change handler
  const handleChange = (field: keyof ServiceRequestFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Re-validate field if already blurred/interacted
    if (hasInteracted[field]) {
      validateSingleField(field, value);
    }
  };

  const handleBlur = (field: keyof ServiceRequestFormData) => {
    setHasInteracted((prev) => ({ ...prev, [field]: true }));
    validateSingleField(field, formData[field]);
  };

  const validateSingleField = (field: keyof ServiceRequestFormData, value: unknown) => {
    const testObj = { ...formData, [field]: value };
    const res = ServiceRequestSchema.safeParse(testObj);
    if (!res.success) {
      const issue = res.error.issues.find((i) => i.path[0] === field);
      if (issue) {
        setFieldErrors((prev) => ({ ...prev, [field]: issue.message }));
      } else {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStatus === 'submitting') return;

    setErrorMessage(null);
    setFieldErrors({});

    const result = ServiceRequestSchema.safeParse(formData);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (!errs[key]) errs[key] = issue.message;
      });
      setFieldErrors(errs);

      // Focus first invalid field
      const firstInvalidKey = Object.keys(errs)[0];
      const el = document.getElementById(`field-${firstInvalidKey}`);
      if (el) {
        el.focus();
      }
      return;
    }

    try {
      setFormStatus('submitting');
      const response = await submitServiceRequest(result.data);

      if (response && response.referenceNumber) {
        setSuccessResult(response);
        setFormStatus('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('Invalid response from dispatch.');
      }
    } catch (err: unknown) {
      setFormStatus('failed');
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to communicate with Operations Command desk. Your input has been preserved.'
      );
    }
  };

  const handleCopyReference = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const serviceTiles: {
    type: ServiceType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: 'STATIC_GUARDING',
      label: 'Static Guarding',
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      type: 'EVENT_SECURITY',
      label: 'Event Security',
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      type: 'VIP_ESCORT',
      label: 'VIP & Escort',
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      type: 'PATROL_SERVICES',
      label: 'Patrol Services',
      icon: <Route className="w-5 h-5" />,
    },
    {
      type: 'CCTV_MONITORING',
      label: 'CCTV Monitoring',
      icon: <Video className="w-5 h-5" />,
    },
    {
      type: 'OTHER_SECURITY',
      label: 'Other / Custom',
      icon: <Plus className="w-5 h-5" />,
    },
  ];

  return (
    <div className="w-full bg-[#F4F6F4] min-h-screen">
      {/* Header Band */}
      <PageHeaderBand
        title="Request a Service."
        badge="SECURE CLIENT INTAKE"
        subtitle="Submit physical site parameters and shift requirements to receive an official reference identifier and binding proposal. [DRAFT]"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Request a Service', path: '/request' },
        ]}
        onNavigate={onNavigate}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* ========================================================
            SUCCESS STATE: DispatchTicket prints in + SealStamp
        ======================================================== */}
        {formStatus === 'success' && successResult && (
          <div
            className="max-w-2xl mx-auto bg-[#0D322D] text-white rounded-2xl border border-[#C9A04A]/40 p-8 sm:p-12 shadow-2xl relative overflow-hidden transition-all duration-700 ease-out will-change-transform"
            style={{
              transitionTimingFunction: 'var(--e-silk)',
              transform: 'translateY(0)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25), 0 24px 48px rgba(0,20,16,0.5)',
            }}
          >
            {/* SealStamp on its corner */}
            <div className="absolute top-6 right-6">
              <SealStamp size={80} label="ACCEPTED" />
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#C9A04A] uppercase tracking-widest block">
                  REQUEST RECEIVED · OFFICIAL DISPATCH RECORD
                </span>
                <h2 className="font-display text-3xl font-medium text-white">
                  Intake Logged to Registry
                </h2>
                <p className="text-sm text-white/80 leading-relaxed max-w-lg">
                  Keep this reference identifier and the phone number you used to track your request.
                  Our Duty Operations Officer is evaluating your site parameters.
                </p>
              </div>

              {/* Reference Identifier Chip with Copy & Toast */}
              <div className="p-4 rounded-xl bg-[#092824] border border-[#C9A04A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
                    Assigned Reference Identifier
                  </span>
                  <span className="font-mono text-2xl font-bold tracking-wider text-[#C9A04A]">
                    {successResult.referenceNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyReference(successResult.referenceNumber)}
                    className="px-4 py-2 rounded border border-[#C9A04A]/50 bg-[#C9A04A]/10 text-xs font-mono uppercase tracking-wider text-[#C9A04A] hover:bg-[#C9A04A]/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Ref'}</span>
                  </button>
                </div>
              </div>

              {/* Toast confirmation */}
              {copied && (
                <div className="p-2 rounded bg-emerald-900/60 border border-emerald-500/50 text-emerald-200 text-xs text-center font-mono">
                  Reference identifier copied to clipboard.
                </div>
              )}

              {/* Summary Details */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10 text-xs text-white/70">
                <div>
                  <span className="text-white/40 block">Contact Sentry:</span>
                  <span className="font-semibold text-white">{formData.contactName}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Verified Phone:</span>
                  <span className="font-semibold text-white">{formData.phone}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Discipline Class:</span>
                  <span className="font-semibold text-white">
                    {SERVICE_TYPE_LABELS[formData.serviceType]}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block">Locality:</span>
                  <span className="font-semibold text-white">{formData.city}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4">
                <MagneticButton
                  variant="gold"
                  onClick={() =>
                    onNavigate('/track', {
                      referenceNumber: successResult.referenceNumber,
                      phone: formData.phone,
                    })
                  }
                  className="w-full sm:w-auto !px-6 !py-3 font-bold uppercase text-xs tracking-wider"
                >
                  Track this request
                </MagneticButton>

                <button
                  onClick={() => onNavigate('/')}
                  className="w-full sm:w-auto px-6 py-3 rounded border border-white/30 text-white font-medium text-xs uppercase tracking-wider hover:border-[#C9A04A] hover:text-[#C9A04A] transition-colors cursor-pointer"
                >
                  Back to home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            FORM STATE: Desktop 7 Cols Form + 5 Cols Sticky Summary
        ======================================================== */}
        {formStatus !== 'success' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Form Column (Columns 1-7) */}
            <div className="lg:col-span-7 space-y-8 relative">
              {/* Vertical Foil Thread Connecting the 3 Numbered Cards */}
              <div
                className="hidden lg:block absolute left-8 top-16 bottom-16 w-[2px] pointer-events-none"
                style={{
                  background:
                    isCard1Valid && isCard2Valid && isCard3Valid
                      ? 'var(--foil)'
                      : isCard1Valid && isCard2Valid
                      ? 'linear-gradient(to bottom, #C9A04A 66%, #D9E0DC 66%)'
                      : isCard1Valid
                      ? 'linear-gradient(to bottom, #C9A04A 33%, #D9E0DC 33%)'
                      : '#D9E0DC',
                  transition: 'background 0.4s ease',
                }}
                aria-hidden="true"
              />

              {/* Failed Error Notice */}
              {formStatus === 'failed' && (
                <div
                  role="alert"
                  className="p-5 rounded-xl bg-[#FBE9E9] border border-[#A12B2B]/40 text-[#A12B2B] space-y-2"
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Submission Interrupted</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {errorMessage ||
                      'Unable to establish secure dispatch connection. All of your inputs have been preserved.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="text-xs font-bold uppercase tracking-wider underline hover:text-black cursor-pointer pt-1"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Validation Summary Alert if submitted with invalid fields */}
              {Object.keys(fieldErrors).length > 0 && (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-[#FBE9E9] border border-[#A12B2B]/40 text-[#A12B2B] text-xs space-y-1.5"
                >
                  <strong className="block font-semibold">Please complete the required fields:</strong>
                  <ul className="list-disc list-inside space-y-0.5">
                    {Object.entries(fieldErrors).map(([key, err]) => (
                      <li key={key}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* ----------------------------------------------------
                    CARD 1: "Your details"
                ---------------------------------------------------- */}
                <div className="bg-white rounded-2xl border border-[#D9E0DC] p-6 sm:p-8 shadow-xs relative">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#D9E0DC]">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                          isCard1Valid
                            ? 'bg-[#003C35] text-[#C9A04A]'
                            : 'bg-[#F4F6F4] text-[#52625D] border border-[#D9E0DC]'
                        }`}
                      >
                        {isCard1Valid ? <Check className="w-4 h-4" /> : '01'}
                      </span>
                      <h3 className="font-display text-xl font-semibold text-[#003C35]">
                        Your details
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#52625D]">
                      {isCard1Valid ? 'Verified' : 'Required'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      id="field-contactName"
                      label="Full Name"
                      required
                      error={fieldErrors.contactName}
                    >
                      <Input
                        id="field-contactName"
                        placeholder="e.g. Commander Marcus Sterling"
                        value={formData.contactName}
                        onChange={(e) => handleChange('contactName', e.target.value)}
                        onBlur={() => handleBlur('contactName')}
                        hasError={!!fieldErrors.contactName}
                      />
                    </FormField>

                    <FormField
                      id="field-organizationName"
                      label="Organization"
                      error={fieldErrors.organizationName}
                    >
                      <Input
                        id="field-organizationName"
                        placeholder="e.g. Sterling Holdings Ltd."
                        value={formData.organizationName || ''}
                        onChange={(e) => handleChange('organizationName', e.target.value)}
                        onBlur={() => handleBlur('organizationName')}
                        hasError={!!fieldErrors.organizationName}
                      />
                    </FormField>

                    <FormField
                      id="field-phone"
                      label="Phone"
                      required
                      hint="Used along with reference to track status"
                      error={fieldErrors.phone}
                    >
                      <Input
                        id="field-phone"
                        type="tel"
                        placeholder="e.g. +1 555-019-2834"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        onBlur={() => handleBlur('phone')}
                        hasError={!!fieldErrors.phone}
                      />
                    </FormField>

                    <FormField
                      id="field-email"
                      label="Email"
                      required
                      error={fieldErrors.email}
                    >
                      <Input
                        id="field-email"
                        type="email"
                        placeholder="e.g. m.sterling@company.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        hasError={!!fieldErrors.email}
                      />
                    </FormField>

                    <div className="sm:col-span-2">
                      <FormField
                        id="field-preferredContactMethod"
                        label="Preferred Contact Method"
                        required
                        error={fieldErrors.preferredContactMethod}
                      >
                        <Select
                          id="field-preferredContactMethod"
                          value={formData.preferredContactMethod}
                          onChange={(e) =>
                            handleChange('preferredContactMethod', e.target.value as ContactMethod)
                          }
                          onBlur={() => handleBlur('preferredContactMethod')}
                          hasError={!!fieldErrors.preferredContactMethod}
                        >
                          <option value="PHONE">Direct Telephone</option>
                          <option value="EMAIL">Encrypted Email</option>
                          <option value="WHATSAPP">SMS / WhatsApp</option>
                        </Select>
                      </FormField>
                    </div>
                  </div>
                </div>

                {/* ----------------------------------------------------
                    CARD 2: "The service"
                ---------------------------------------------------- */}
                <div className="bg-white rounded-2xl border border-[#D9E0DC] p-6 sm:p-8 shadow-xs relative">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#D9E0DC]">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                          isCard2Valid
                            ? 'bg-[#003C35] text-[#C9A04A]'
                            : 'bg-[#F4F6F4] text-[#52625D] border border-[#D9E0DC]'
                        }`}
                      >
                        {isCard2Valid ? <Check className="w-4 h-4" /> : '02'}
                      </span>
                      <h3 className="font-display text-xl font-semibold text-[#003C35]">
                        The service
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#52625D]">
                      {isCard2Valid ? 'Verified' : 'Required'}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* Six Selectable Tiles with Icons */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#003C35] block mb-2.5">
                        Service Type <span className="text-[#C9A04A]">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {serviceTiles.map((tile) => {
                          const isSelected = formData.serviceType === tile.type;
                          return (
                            <button
                              key={tile.type}
                              type="button"
                              onClick={() => handleChange('serviceType', tile.type)}
                              className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 select-none ${
                                isSelected
                                  ? 'bg-[#003C35] text-white border-[#003C35] shadow-sm ring-1 ring-[#C9A04A]'
                                  : 'bg-white text-[#24332F] border-[#D9E0DC] hover:border-[#003C35]/50'
                              }`}
                            >
                              <div
                                className={`${
                                  isSelected ? 'text-[#C9A04A]' : 'text-[#003C35]'
                                }`}
                              >
                                {tile.icon}
                              </div>
                              <span className="text-xs font-semibold leading-tight">
                                {tile.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Site Address & City */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <FormField
                          id="field-siteAddress"
                          label="Site Address"
                          required
                          error={fieldErrors.siteAddress}
                        >
                          <Input
                            id="field-siteAddress"
                            placeholder="e.g. 400 Citadel Blvd, West Gate Security Point"
                            value={formData.siteAddress}
                            onChange={(e) => handleChange('siteAddress', e.target.value)}
                            onBlur={() => handleBlur('siteAddress')}
                            hasError={!!fieldErrors.siteAddress}
                          />
                        </FormField>
                      </div>

                      <FormField id="field-city" label="City" required error={fieldErrors.city}>
                        <Input
                          id="field-city"
                          placeholder="e.g. Metropolis"
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          onBlur={() => handleBlur('city')}
                          hasError={!!fieldErrors.city}
                        />
                      </FormField>

                      {/* Optional Add Map Location Toggle */}
                      <div className="flex flex-col justify-end">
                        <button
                          type="button"
                          onClick={() => setShowMapPicker(!showMapPicker)}
                          className="h-[44px] px-4 rounded-md border border-[#D9E0DC] bg-[#F4F6F4] text-xs font-semibold text-[#003C35] hover:border-[#C9A04A] transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#C9A04A]" />
                            <span>{showMapPicker ? 'Close Map Picker' : 'Add map location'}</span>
                          </span>
                          <span className="text-[10px] text-[#52625D]">
                            {formData.coordinates ? 'Coordinates set' : 'Optional'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Map Picker with manual latitude/longitude fallback */}
                    {showMapPicker && (
                      <div className="p-4 rounded-xl bg-[#F4F6F4] border border-[#D9E0DC] space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#003C35]">
                          <span className="flex items-center gap-1.5">
                            <Map className="w-4 h-4 text-[#C9A04A]" />
                            <span>Location Coordinates</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              handleChange('coordinates', '40.7128, -74.0060');
                            }}
                            className="text-[#C9A04A] hover:underline cursor-pointer"
                          >
                            Set HQ Point
                          </button>
                        </div>
                        <FormField
                          id="field-coordinates"
                          label="Latitude / Longitude Coordinates"
                          hint="e.g. 40.7128, -74.0060 (Manual fallback)"
                          error={fieldErrors.coordinates}
                        >
                          <Input
                            id="field-coordinates"
                            placeholder="e.g. 40.7128, -74.0060"
                            value={formData.coordinates || ''}
                            onChange={(e) => handleChange('coordinates', e.target.value)}
                            onBlur={() => handleBlur('coordinates')}
                            hasError={!!fieldErrors.coordinates}
                          />
                        </FormField>
                      </div>
                    )}

                    {/* Number of guards (stepper, min 1) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#003C35] block mb-1.5">
                          Number of Guards <span className="text-[#C9A04A]">*</span>
                        </label>
                        <div className="flex items-center h-[44px] rounded-md border border-[#D9E0DC] bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              handleChange('guardCount', Math.max(1, formData.guardCount - 1))
                            }
                            className="px-3.5 h-full text-base font-bold text-[#003C35] hover:bg-[#F4F6F4] transition-colors cursor-pointer select-none"
                            aria-label="Decrease guards"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center font-mono text-base font-bold text-[#24332F]">
                            {formData.guardCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleChange('guardCount', formData.guardCount + 1)}
                            className="px-3.5 h-full text-base font-bold text-[#003C35] hover:bg-[#F4F6F4] transition-colors cursor-pointer select-none"
                            aria-label="Increase guards"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Shift coverage (Day / Night / 24-hour) */}
                      <div>
                        <FormField
                          id="field-coverage"
                          label="Shift Coverage"
                          required
                          error={fieldErrors.coverage}
                        >
                          <Select
                            id="field-coverage"
                            value={formData.coverage}
                            onChange={(e) =>
                              handleChange('coverage', e.target.value as CoverageOption)
                            }
                            onBlur={() => handleBlur('coverage')}
                          >
                            <option value="DAY">Day (08:00 - 20:00)</option>
                            <option value="NIGHT">Night (20:00 - 08:00)</option>
                            <option value="TWENTY_FOUR_HOUR">24-Hour Continuous</option>
                          </Select>
                        </FormField>
                      </div>

                      {/* Armed or unarmed preference */}
                      <div>
                        <FormField
                          id="field-armedPreference"
                          label="Armed / Unarmed"
                          required
                          error={fieldErrors.armedPreference}
                        >
                          <Select
                            id="field-armedPreference"
                            value={formData.armedPreference}
                            onChange={(e) =>
                              handleChange('armedPreference', e.target.value as ArmedPreference)
                            }
                            onBlur={() => handleBlur('armedPreference')}
                          >
                            <option value="UNARMED">Unarmed Sentry</option>
                            <option value="ARMED_IF_PERMITTED">Armed (Subject to Lic.)</option>
                          </Select>
                        </FormField>
                      </div>
                    </div>

                    {/* Start Date & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        id="field-startDate"
                        label="Start Date"
                        required
                        error={fieldErrors.startDate}
                      >
                        <Input
                          id="field-startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleChange('startDate', e.target.value)}
                          onBlur={() => handleBlur('startDate')}
                          hasError={!!fieldErrors.startDate}
                        />
                      </FormField>

                      <FormField
                        id="field-duration"
                        label="Duration"
                        required
                        error={fieldErrors.duration}
                      >
                        <Select
                          id="field-duration"
                          value={formData.duration}
                          onChange={(e) =>
                            handleChange('duration', e.target.value as DurationOption)
                          }
                          onBlur={() => handleBlur('duration')}
                        >
                          <option value="ONE_OFF">One-off / Single event</option>
                          <option value="ONE_MONTH">1 Month</option>
                          <option value="THREE_MONTHS">3 Months</option>
                          <option value="SIX_MONTHS">6 Months</option>
                          <option value="TWELVE_MONTHS">12 Months</option>
                        </Select>
                      </FormField>
                    </div>
                  </div>
                </div>

                {/* ----------------------------------------------------
                    CARD 3: "Anything else?" (1000-character counter)
                ---------------------------------------------------- */}
                <div className="bg-white rounded-2xl border border-[#D9E0DC] p-6 sm:p-8 shadow-xs relative">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#D9E0DC]">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                          isCard3Valid
                            ? 'bg-[#003C35] text-[#C9A04A]'
                            : 'bg-[#F4F6F4] text-[#52625D] border border-[#D9E0DC]'
                        }`}
                      >
                        {isCard3Valid ? <Check className="w-4 h-4" /> : '03'}
                      </span>
                      <h3 className="font-display text-xl font-semibold text-[#003C35]">
                        Anything else?
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#52625D]">
                      {isCard3Valid ? 'Verified' : 'Required'}
                    </span>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="field-additionalRequirements"
                          className="text-xs font-semibold uppercase tracking-wider text-[#003C35]"
                        >
                          Additional Details
                        </label>
                        <span
                          className={`text-xs font-mono ${
                            currentChars > maxChars ? 'text-[#A12B2B] font-bold' : 'text-[#52625D]'
                          }`}
                        >
                          {currentChars} / {maxChars} characters
                        </span>
                      </div>
                      <Textarea
                        id="field-additionalRequirements"
                        rows={4}
                        placeholder="Detail specific access gates, emergency contact points, perimeter cameras, or risk factors..."
                        value={formData.additionalRequirements || ''}
                        onChange={(e) =>
                          handleChange('additionalRequirements', e.target.value.slice(0, 1000))
                        }
                        onBlur={() => handleBlur('additionalRequirements')}
                        hasError={currentChars > maxChars}
                      />
                    </div>

                    {/* Privacy & Authorization Consent */}
                    <div className="p-4 rounded-xl bg-[#F4F6F4] border border-[#D9E0DC] space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          id="field-privacyConsent"
                          checked={formData.privacyConsent}
                          onChange={(e) => handleChange('privacyConsent', e.target.checked)}
                          onBlur={() => handleBlur('privacyConsent')}
                          className="mt-0.5 w-4 h-4 text-[#003C35] rounded border-[#D9E0DC] focus:ring-[#C9A04A]"
                        />
                        <span className="text-xs text-[#24332F] leading-relaxed select-none">
                          I acknowledge that all deployment specifications will be logged into the
                          Covenant Shield Operations Dispatch register, and that a formal quotation
                          will be prepared by an Operations Officer.
                        </span>
                      </label>
                      {fieldErrors.privacyConsent && (
                        <p role="alert" className="text-xs font-semibold text-[#A12B2B]">
                          {fieldErrors.privacyConsent}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <span className="text-xs text-[#52625D]">
                        Submission issues an instant reference identifier.
                      </span>

                      <MagneticButton
                        type="submit"
                        variant="gold"
                        disabled={formStatus === 'submitting'}
                        className="w-full sm:w-auto !px-8 !py-3.5 font-bold uppercase tracking-wider text-xs shadow-lg"
                      >
                        <span className="flex items-center gap-2">
                          <Send className="w-3.5 h-3.5" />
                          <span>
                            {formStatus === 'submitting'
                              ? 'Transmitting to Dispatch...'
                              : 'Submit Service Request'}
                          </span>
                        </span>
                      </MagneticButton>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* ========================================================
                Sticky Summary Ticket Column (Columns 8-12 on Desktop)
            ======================================================== */}
            <div className="hidden lg:block lg:col-span-5 sticky top-28">
              <div
                className="bg-[#0D322D] text-white rounded-2xl border border-[#C9A04A]/30 p-6 sm:p-7 shadow-xl space-y-5"
                style={{
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25), 0 20px 40px rgba(0,20,16,0.2)',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#C9A04A]" />
                    <span className="font-serif text-sm font-semibold tracking-wide text-white">
                      Live Intake Summary
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A04A] bg-[#C9A04A]/10 px-2 py-0.5 rounded border border-[#C9A04A]/25">
                    Live Dispatch Draft
                  </span>
                </div>

                {/* Values slide in with a 200ms fade-up */}
                <div className="space-y-4 text-xs">
                  {/* Discipline */}
                  <div className="p-3 rounded-lg bg-[#092824] border border-white/5 transition-all duration-200">
                    <span className="text-white/40 uppercase tracking-widest text-[10px] block font-mono mb-1">
                      Selected Discipline
                    </span>
                    <span className="text-sm font-semibold text-white block">
                      {SERVICE_TYPE_LABELS[formData.serviceType]}
                    </span>
                  </div>

                  {/* Guard & Coverage Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[#092824] border border-white/5 transition-all duration-200">
                      <span className="text-white/40 uppercase tracking-widest text-[10px] block font-mono mb-1">
                        Personnel
                      </span>
                      <span className="text-sm font-mono font-bold text-[#C9A04A]">
                        {formData.guardCount} {formData.guardCount === 1 ? 'Guard' : 'Guards'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#092824] border border-white/5 transition-all duration-200">
                      <span className="text-white/40 uppercase tracking-widest text-[10px] block font-mono mb-1">
                        Shift Coverage
                      </span>
                      <span className="text-xs font-semibold text-white block">
                        {COVERAGE_LABELS[formData.coverage]}
                      </span>
                    </div>
                  </div>

                  {/* Location & Term */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[#092824] border border-white/5 transition-all duration-200">
                      <span className="text-white/40 uppercase tracking-widest text-[10px] block font-mono mb-1">
                        Target Locality
                      </span>
                      <span className="text-xs font-semibold text-white block">
                        {formData.city || '— Pending City —'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#092824] border border-white/5 transition-all duration-200">
                      <span className="text-white/40 uppercase tracking-widest text-[10px] block font-mono mb-1">
                        Contract Term
                      </span>
                      <span className="text-xs font-semibold text-white block">
                        {DURATION_LABELS[formData.duration]}
                      </span>
                    </div>
                  </div>

                  {/* Client Identification */}
                  <div className="p-3 rounded-lg bg-[#092824] border border-white/5 transition-all duration-200">
                    <span className="text-white/40 uppercase tracking-widest text-[10px] block font-mono mb-1">
                      Assigned Requestor
                    </span>
                    <span className="text-xs text-white block font-medium">
                      {formData.contactName || '— Name Not Provided —'}
                    </span>
                    {formData.organizationName && (
                      <span className="text-[11px] text-[#C9A04A] block mt-0.5">
                        {formData.organizationName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer notes */}
                <div className="pt-3 border-t border-white/10 text-[11px] text-white/50 flex items-center justify-between">
                  <span>Guaranteed 4-hour review SLA</span>
                  <span className="text-[#C9A04A]">Covenant Shield</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Summary Chip & Bottom Sheet (< 1024px) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setShowMobileSummary(true)}
          className="px-4 py-2.5 rounded-full bg-[#003C35] text-white border border-[#C9A04A] text-xs font-bold uppercase tracking-wider shadow-xl flex items-center gap-2 cursor-pointer"
        >
          <Shield className="w-4 h-4 text-[#C9A04A]" />
          <span>Summary Draft ({formData.guardCount} Guards)</span>
        </button>
      </div>

      {showMobileSummary && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#0D322D] text-white rounded-t-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto border-t border-[#C9A04A]/40">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-serif text-sm font-semibold text-[#C9A04A]">
                Live Intake Summary
              </span>
              <button
                onClick={() => setShowMobileSummary(false)}
                className="p-1 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-white/40 block text-[10px] uppercase font-mono">Service</span>
                <span className="text-white font-semibold">
                  {SERVICE_TYPE_LABELS[formData.serviceType]}
                </span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px] uppercase font-mono">Guards &amp; Coverage</span>
                <span className="text-[#C9A04A] font-mono font-bold">
                  {formData.guardCount} Operatives · {COVERAGE_LABELS[formData.coverage]}
                </span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px] uppercase font-mono">Location</span>
                <span className="text-white">{formData.siteAddress || 'Pending site'} · {formData.city || 'Pending city'}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px] uppercase font-mono">Requestor</span>
                <span className="text-white">{formData.contactName || 'Pending name'} ({formData.phone || 'No phone'})</span>
              </div>
            </div>

            <button
              onClick={() => setShowMobileSummary(false)}
              className="w-full py-3 rounded bg-[#C9A04A] text-[#003C35] font-bold text-xs uppercase tracking-wider"
            >
              Continue Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
