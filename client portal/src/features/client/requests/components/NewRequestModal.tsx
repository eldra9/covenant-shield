/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NewRequestModal — 3-step format matching the Public Website's ServiceRequestForm.
 * Step 1: Contact & Client Entity (pre-filled from profile, editable)
 * Step 2: Deployment Scope & Location (site, service type, address, guard count)
 * Step 3: Post Orders — Schedule, Coverage, and Consent
 */

import React, { useState } from 'react';
import { clientPortalApi, sessionManager } from '@/src/api/clientPortalApi';
import { Site, ServiceRequest } from '@/src/types/clientPortal';
import { DispatchTicket } from '@/src/components/luxury/DispatchTicket';
import { SealStamp } from '@/src/components/luxury/SealStamp';
import {
  X, CheckCircle2, AlertCircle, User, Building, Phone,
  Mail, MapPin, Shield, Clock, ChevronRight, ChevronLeft,
} from 'lucide-react';

interface NewRequestModalProps {
  sites: Site[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newReq: ServiceRequest) => void;
}

interface FormData {
  // Step 1
  contactName: string;
  organizationName: string;
  email: string;
  phone: string;
  // Step 2
  siteId: string;
  siteAddress: string;
  city: string;
  serviceType: string;
  guardCount: number;
  // Step 3
  coverage: string;
  armedPreference: string;
  duration: string;
  requestedStartDate: string;
  additionalRequirements: string;
  preferredContactMethod: string;
  privacyConsent: boolean;
}

const SERVICE_TYPES = [
  { id: 'STATIC_GUARDING', label: 'Static Guard Deployment' },
  { id: 'MOBILE_PATROL', label: 'Mobile / Perimeter Patrol' },
  { id: 'ESCORT', label: 'Tactical Transit Escort' },
  { id: 'EVENT_SECURITY', label: 'Event Security Management' },
  { id: 'CLOSE_PROTECTION', label: 'Executive Close Protection' },
  { id: 'CCTV_MONITORING', label: 'Electronic Surveillance / CCTV Audit' },
];

const COVERAGE_OPTIONS = [
  { id: 'EIGHT_HOUR', label: '8-Hour Day Shift' },
  { id: 'TWELVE_HOUR', label: '12-Hour Extended Shift' },
  { id: 'TWENTY_FOUR_HOUR', label: '24-Hour Round-the-Clock Coverage' },
];

const DURATION_OPTIONS = [
  { id: 'ONE_MONTH', label: '1 Month' },
  { id: 'THREE_MONTHS', label: '3 Months' },
  { id: 'SIX_MONTHS', label: '6 Months' },
  { id: 'ONE_YEAR', label: '12 Months / Renewable' },
  { id: 'ONGOING', label: 'Ongoing (No fixed end)' },
];

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  sites,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const sessionUser = sessionManager.getCurrentUser();
  const sessionOrg = sessionManager.getCurrentClient();

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<ServiceRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    contactName: sessionUser.fullName || '',
    organizationName: sessionOrg.name || '',
    email: sessionUser.email || '',
    phone: sessionUser.directPhone || '',
    siteId: sites[0]?.id || '',
    siteAddress: sites[0]?.address || '',
    city: sites[0]?.city || '',
    serviceType: 'STATIC_GUARDING',
    guardCount: 2,
    coverage: 'TWENTY_FOUR_HOUR',
    armedPreference: 'UNARMED',
    duration: 'THREE_MONTHS',
    requestedStartDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    additionalRequirements: '',
    preferredContactMethod: 'EMAIL',
    privacyConsent: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
    // Auto-populate address/city when site changes
    if (field === 'siteId') {
      const found = sites.find(s => s.id === String(value));
      if (found) {
        setFormData(prev => ({
          ...prev,
          siteId: String(value),
          siteAddress: found.address || '',
          city: found.city || '',
        }));
      }
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.contactName.trim()) errors.contactName = 'Full name is required';
      if (!formData.email.trim()) errors.email = 'Email address is required';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    }
    if (step === 1) {
      if (!formData.siteAddress.trim()) errors.siteAddress = 'Site address is required';
      if (!formData.city.trim()) errors.city = 'City / locality is required';
      if (formData.guardCount < 1) errors.guardCount = 'At least 1 guard is required';
    }
    if (step === 2) {
      if (!formData.privacyConsent) errors.privacyConsent = 'You must confirm authorization to submit';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(activeStep)) setActiveStep(s => s + 1);
  };
  const prevStep = () => setActiveStep(s => s - 1);

  const selectedSite = sites.find(s => s.id === formData.siteId) || sites[0];
  const selectedServiceLabel = SERVICE_TYPES.find(s => s.id === formData.serviceType)?.label || formData.serviceType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await clientPortalApi.createServiceRequest({
        siteId: formData.siteId,
        siteName: selectedSite?.name,
        siteAddress: formData.siteAddress,
        city: formData.city,
        serviceType: formData.serviceType,
        priority: 'Standard',
        requestedStartDate: formData.requestedStartDate,
        startDate: formData.requestedStartDate,
        description: formData.additionalRequirements,
        additionalRequirements: formData.additionalRequirements,
        contactName: formData.contactName,
        organizationName: formData.organizationName,
        phone: formData.phone,
        email: formData.email,
        guardCount: formData.guardCount,
        coverage: formData.coverage,
        armedPreference: formData.armedPreference,
        duration: formData.duration,
        preferredContactMethod: formData.preferredContactMethod,
      });
      setCreatedRequest(result);
      onSuccess(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit service request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    setCreatedRequest(null);
    setActiveStep(0);
    setFormData({
      contactName: sessionUser.fullName || '',
      organizationName: sessionOrg.name || '',
      email: sessionUser.email || '',
      phone: sessionUser.directPhone || '',
      siteId: sites[0]?.id || '',
      siteAddress: sites[0]?.address || '',
      city: sites[0]?.city || '',
      serviceType: 'STATIC_GUARDING',
      guardCount: 2,
      coverage: 'TWENTY_FOUR_HOUR',
      armedPreference: 'UNARMED',
      duration: 'THREE_MONTHS',
      requestedStartDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      additionalRequirements: '',
      preferredContactMethod: 'EMAIL',
      privacyConsent: false,
    });
    setFieldErrors({});
    onClose();
  };

  const fieldCls = (err?: string) =>
    `w-full px-3 py-2 text-xs border rounded-lg bg-[var(--surface-card)] text-[var(--text-main)] focus:outline-none focus:border-[#003C35] ${err ? 'border-red-400' : 'border-[var(--surface-border)]'}`;

  const steps = [
    { label: 'Client Entity', sublabel: 'Contact info' },
    { label: 'Deployment Scope', sublabel: 'Location & service' },
    { label: 'Post Orders', sublabel: 'Schedule & consent' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-request-title"
    >
      <div className="relative w-full max-w-4xl bg-[var(--surface-card)] rounded-2xl border border-[var(--surface-border)] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--surface-border)] bg-[var(--emerald-50)]/40 dark:bg-[#0D322D]">
          <div className="space-y-1">
            <span className="text-[11px] font-mono-ref uppercase tracking-wider text-[#A47F2E]">
              Covenant Operations Dispatch
            </span>
            <h2 id="new-request-title" className="font-display text-xl font-bold text-[var(--text-main)]">
              {createdRequest ? 'Deployment Order Registered' : 'Commission Security Service'}
            </h2>
          </div>
          <button type="button" onClick={handleDone} className="p-2 rounded-lg text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-black/5 cursor-pointer" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdRequest ? (
          /* SUCCESS STATE */
          <div className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <SealStamp size={88} theme="gold" label="COMMISSION RECORDED" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="font-display text-2xl text-[var(--text-main)] font-semibold">
                Service Order {createdRequest.reference}
              </h3>
              <p className="text-xs text-[var(--text-sub)] leading-relaxed">
                Your deployment request has been registered in the Covenant Shield tactical dispatch register. An operations commander has been notified for site assessment.
              </p>
            </div>
            <div className="max-w-lg mx-auto text-left">
              <DispatchTicket
                reference={createdRequest.reference}
                title={createdRequest.serviceType}
                subtitle={`Target Location: ${createdRequest.siteName}`}
                dateLabel={`Registered: ${new Date(createdRequest.createdAt).toLocaleDateString()} EAT`}
                isPrinting={true}
                metadata={[
                  { label: 'Priority', value: createdRequest.priority },
                  { label: 'Start Date', value: createdRequest.requestedStartDate },
                  { label: 'Status', value: createdRequest.status },
                  { label: 'Officer', value: formData.contactName },
                ]}
              />
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <button type="button" onClick={handleDone} className="px-6 py-2.5 rounded-lg bg-[#003C35] hover:bg-[#0B5247] text-white text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer">
                Return to Requests Registry
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Step Indicator */}
            <div className="mb-6 pb-4 border-b border-[var(--surface-border)]">
              <nav aria-label="Progress" className="flex items-center justify-center gap-2">
                {steps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <button
                      type="button"
                      onClick={() => idx < activeStep && setActiveStep(idx)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        idx === activeStep
                          ? 'bg-[#003C35] text-white'
                          : idx < activeStep
                          ? 'bg-[#003C35]/10 text-[#003C35] dark:text-[#C9A04A] cursor-pointer hover:bg-[#003C35]/20'
                          : 'bg-[var(--surface-border)]/30 text-[var(--text-sub)] cursor-default'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === activeStep ? 'bg-white/20' : idx < activeStep ? 'bg-[#C9A04A] text-[#003C35]' : 'bg-[var(--surface-border)]'}`}>
                        {idx < activeStep ? '✓' : idx + 1}
                      </span>
                      <span className="hidden sm:block">{step.label}</span>
                    </button>
                    {idx < steps.length - 1 && (
                      <div className={`h-px w-8 ${idx < activeStep ? 'bg-[#003C35]' : 'bg-[var(--surface-border)]'}`} />
                    )}
                  </React.Fragment>
                ))}
              </nav>
              <p className="text-center text-[11px] text-[var(--text-sub)] mt-2">
                Step {activeStep + 1} of 3 — {steps[activeStep].sublabel}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Column */}
              <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-[#FBE9E9] text-[#A12B2B] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* ── STEP 1: Contact & Client Entity ── */}
                {activeStep === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[var(--surface-border)]">
                      <User className="w-4 h-4 text-[#C9A04A]" />
                      <h3 className="text-sm font-bold text-[var(--text-main)]">1. Contact &amp; Client Entity</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--text-main)]">Full Name of Requestor *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[var(--text-sub)]" />
                          <input
                            type="text"
                            value={formData.contactName}
                            onChange={e => handleChange('contactName', e.target.value)}
                            placeholder="Director Jane Doe"
                            className={`${fieldCls(fieldErrors.contactName)} pl-9`}
                          />
                        </div>
                        {fieldErrors.contactName && <p className="text-[11px] text-red-600">{fieldErrors.contactName}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--text-main)]">Organization / Company</label>
                        <div className="relative">
                          <Building className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[var(--text-sub)]" />
                          <input
                            type="text"
                            value={formData.organizationName}
                            onChange={e => handleChange('organizationName', e.target.value)}
                            placeholder="Horizon Logistics Ltd"
                            className={`${fieldCls()} pl-9`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--text-main)]">Official Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[var(--text-sub)]" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={e => handleChange('email', e.target.value.toLowerCase())}
                            placeholder="ops@company.com"
                            className={`${fieldCls(fieldErrors.email)} pl-9`}
                          />
                        </div>
                        {fieldErrors.email && <p className="text-[11px] text-red-600">{fieldErrors.email}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--text-main)]">Telephone / Mobile *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[var(--text-sub)]" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => handleChange('phone', e.target.value)}
                            placeholder="+254 700 000 000"
                            className={`${fieldCls(fieldErrors.phone)} pl-9`}
                          />
                        </div>
                        {fieldErrors.phone && <p className="text-[11px] text-red-600">{fieldErrors.phone}</p>}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button type="button" onClick={nextStep} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#003C35] hover:bg-[#0B5247] text-white text-xs font-semibold transition-all cursor-pointer">
                        Continue to Deployment Scope <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Deployment Scope ── */}
                {activeStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[var(--surface-border)]">
                      <Shield className="w-4 h-4 text-[#C9A04A]" />
                      <h3 className="text-sm font-bold text-[var(--text-main)]">2. Deployment Scope &amp; Location</h3>
                    </div>

                    {sites.length > 0 && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--text-main)]">Authorized Installation (Quick Select)</label>
                        <select
                          value={formData.siteId}
                          onChange={e => handleChange('siteId', e.target.value)}
                          className={fieldCls()}
                        >
                          <option value="">— Select from your registered sites —</option>
                          {sites.map(s => (
                            <option key={s.id} value={s.id}>{s.name} — {s.address}</option>
                          ))}
                          <option value="">— Or enter new address below —</option>
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-medium text-[var(--text-main)]">Physical Site Address *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[var(--text-sub)]" />
                          <input
                            type="text"
                            value={formData.siteAddress}
                            onChange={e => handleChange('siteAddress', e.target.value)}
                            placeholder="400 Citadel Boulevard, Gate 3 North"
                            className={`${fieldCls(fieldErrors.siteAddress)} pl-9`}
                          />
                        </div>
                        {fieldErrors.siteAddress && <p className="text-[11px] text-red-600">{fieldErrors.siteAddress}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--text-main)]">City / Locality *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[var(--text-sub)]" />
                          <input
                            type="text"
                            value={formData.city}
                            onChange={e => handleChange('city', e.target.value)}
                            placeholder="e.g. Nairobi"
                            className={`${fieldCls(fieldErrors.city)} pl-9`}
                          />
                        </div>
                        {fieldErrors.city && <p className="text-[11px] text-red-600">{fieldErrors.city}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--text-main)]">Service Discipline *</label>
                        <select
                          value={formData.serviceType}
                          onChange={e => handleChange('serviceType', e.target.value)}
                          className={fieldCls()}
                        >
                          {SERVICE_TYPES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--text-main)]">Personnel Count Required *</label>
                        <input
                          type="number"
                          min={1}
                          max={200}
                          value={formData.guardCount}
                          onChange={e => handleChange('guardCount', parseInt(e.target.value, 10) || 1)}
                          className={fieldCls(fieldErrors.guardCount)}
                        />
                        {fieldErrors.guardCount && <p className="text-[11px] text-red-600">{fieldErrors.guardCount}</p>}
                        <p className="text-[10px] text-[var(--text-sub)]">Sentries required per shift</p>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <button type="button" onClick={prevStep} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--surface-border)] text-[var(--text-sub)] text-xs font-medium hover:text-[var(--text-main)] cursor-pointer">
                        <ChevronLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <button type="button" onClick={nextStep} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#003C35] hover:bg-[#0B5247] text-white text-xs font-semibold transition-all cursor-pointer">
                        Continue to Post Orders <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Post Orders ── */}
                {activeStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[var(--surface-border)]">
                      <Clock className="w-4 h-4 text-[#C9A04A]" />
                      <h3 className="text-sm font-bold text-[var(--text-main)]">3. Operational Schedule &amp; Post Requirements</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--text-main)]">Shift Coverage *</label>
                        <select value={formData.coverage} onChange={e => handleChange('coverage', e.target.value)} className={fieldCls()}>
                          {COVERAGE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--text-main)]">Guard Specification *</label>
                        <select value={formData.armedPreference} onChange={e => handleChange('armedPreference', e.target.value)} className={fieldCls()}>
                          <option value="UNARMED">Standard Certified Unarmed Sentry</option>
                          <option value="ARMED_IF_PERMITTED">Armed Security (Statutory Approved)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--text-main)]">Contract Duration *</label>
                        <select value={formData.duration} onChange={e => handleChange('duration', e.target.value)} className={fieldCls()}>
                          {DURATION_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                        </select>
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-xs font-medium text-[var(--text-main)]">Desired Deployment Start Date *</label>
                        <input
                          type="date"
                          value={formData.requestedStartDate}
                          onChange={e => handleChange('requestedStartDate', e.target.value)}
                          className={fieldCls()}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--text-main)]">Special Post Orders &amp; Tactical Instructions</label>
                      <textarea
                        rows={3}
                        value={formData.additionalRequirements}
                        onChange={e => handleChange('additionalRequirements', e.target.value)}
                        placeholder="Outline site-specific risks, access clearance criteria, or special instructions..."
                        className={`${fieldCls()} resize-none`}
                      />
                      <p className="text-[10px] text-[var(--text-sub)]">Max 1,500 characters. Sentry briefing directives.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--text-main)]">Preferred Contact Channel *</label>
                      <select value={formData.preferredContactMethod} onChange={e => handleChange('preferredContactMethod', e.target.value)} className={fieldCls()}>
                        <option value="EMAIL">Email Dispatch Briefing</option>
                        <option value="PHONE">Direct Telephone Call from Duty Officer</option>
                        <option value="WHATSAPP">Secure WhatsApp Business</option>
                      </select>
                    </div>

                    {/* Privacy Consent */}
                    <div className="p-4 rounded-xl bg-[var(--emerald-50)]/40 border border-[var(--surface-border)] space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.privacyConsent}
                          onChange={e => handleChange('privacyConsent', e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-stone-300 text-[#003C35] focus:ring-[#C9A04A] cursor-pointer"
                        />
                        <span className="text-xs text-[var(--text-main)] leading-relaxed select-none">
                          I confirm that I am authorized to request security services on behalf of the location/organization, and I acknowledge Covenant Shield's confidentiality terms. All deployment parameters are subject to security threat matrix evaluation and statutory regulatory approval.
                        </span>
                      </label>
                      {fieldErrors.privacyConsent && (
                        <p className="text-[11px] text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.privacyConsent}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[var(--surface-border)]">
                      <button type="button" onClick={prevStep} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--surface-border)] text-[var(--text-sub)] text-xs font-medium hover:text-[var(--text-main)] cursor-pointer">
                        <ChevronLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#C9A04A] hover:bg-[#b58f3f] text-[#002B26] text-xs font-bold tracking-wide transition-all shadow-md disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? 'Transmitting to Dispatch...' : 'Submit Service Request'}
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Live Preview Column */}
              <div className="lg:col-span-5 space-y-3 hidden lg:block">
                <div className="flex items-center justify-between text-xs font-mono-ref">
                  <span className="text-[var(--text-sub)] uppercase">Live Voucher Preview</span>
                  <span className="text-[#A47F2E]">DRAFT</span>
                </div>
                <DispatchTicket
                  reference="REQ-DRAFT"
                  title={selectedServiceLabel}
                  subtitle={`Site: ${selectedSite ? selectedSite.name : formData.siteAddress || 'Selected Site'}`}
                  dateLabel="Pending Authorization"
                  metadata={[
                    { label: 'Guard Count', value: String(formData.guardCount) },
                    { label: 'Start Date', value: formData.requestedStartDate || 'TBD' },
                    { label: 'Account', value: formData.organizationName || sessionOrg.name },
                    { label: 'Coverage', value: COVERAGE_OPTIONS.find(c => c.id === formData.coverage)?.label || formData.coverage },
                  ]}
                />
                <p className="text-[11px] text-[var(--text-sub)] leading-normal pt-2">
                  Upon dispatch, a unique reference voucher is registered and assigned to your Covenant Shield Operations Manager.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
