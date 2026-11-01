import React, { useState, useRef } from 'react';
import { Shield, Send, Building, User, Phone, Mail, MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';
import {
  SERVICE_CATEGORIES,
  COVERAGE_LABELS,
  DURATION_LABELS,
} from '../../../../../../packages/shared/src/constants/index.ts';
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
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Select } from '../../../components/ui/Select.tsx';
import { Textarea } from '../../../components/ui/Textarea.tsx';
import { FormField } from '../../../components/forms/FormField.tsx';
import { FieldHint } from '../../../components/ui/FieldHint.tsx';
import { ProgressIndicator } from '../../../components/ui/ProgressIndicator.tsx';
import { InlineNotification } from '../../../components/ui/InlineNotification.tsx';
import { submitServiceRequest, CreateServiceRequestResult } from '../api/requestsApi.ts';

export interface ServiceRequestFormProps {
  initialServiceType?: ServiceType;
  onSuccess: (result: CreateServiceRequestResult) => void;
}

export const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  initialServiceType = 'STATIC_GUARDING',
  onSuccess,
}) => {
  // Stable idempotency key per intake attempt session
  const idempotencyKeyRef = useRef<string>(
    `idemp-sr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );

  const [activeStep, setActiveStep] = useState<number>(0);

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
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 0, label: 'Client Entity', sublabel: 'Contact info' },
    { id: 1, label: 'Deployment Scope', sublabel: 'Location & guards' },
    { id: 2, label: 'Post Orders', sublabel: 'Schedule & consent' },
  ];

  const handleChange = (
    field: keyof ServiceRequestFormData,
    value: string | number | boolean
  ) => {
    // Conservative normalization on input
    let sanitizedValue = value;
    if (typeof value === 'string') {
      if (field === 'email') {
        sanitizedValue = value.toLowerCase().trim();
      }
    }

    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBlurTrim = (field: keyof ServiceRequestFormData) => {
    const val = formData[field];
    if (typeof val === 'string') {
      setFormData((prev) => ({ ...prev, [field]: val.trim() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setServerError(null);
    setFieldErrors({});

    // Client-side normalization
    const normalizedPayload: ServiceRequestFormData = {
      ...formData,
      contactName: formData.contactName.trim(),
      organizationName: formData.organizationName ? formData.organizationName.trim() : '',
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      siteAddress: formData.siteAddress.trim(),
      city: formData.city.trim(),
      coordinates: formData.coordinates ? formData.coordinates.trim() : '',
      additionalRequirements: formData.additionalRequirements ? formData.additionalRequirements.trim() : '',
      idempotencyKey: idempotencyKeyRef.current,
    };

    // Validate using strict shared Zod schema
    const validation = ServiceRequestSchema.safeParse(normalizedPayload);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (!errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      });
      setFieldErrors(errors);

      // Navigate to step of first error
      if (errors.contactName || errors.organizationName || errors.email || errors.phone) {
        setActiveStep(0);
      } else if (errors.serviceType || errors.city || errors.siteAddress || errors.guardCount) {
        setActiveStep(1);
      } else {
        setActiveStep(2);
      }

      const firstErrorKey = Object.keys(errors)[0];
      const el = document.getElementById(firstErrorKey);
      if (el) {
        setTimeout(() => el.focus(), 100);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await submitServiceRequest(validation.data);
      onSuccess(result);
    } catch (err: unknown) {
      // User inputs remain preserved in formData state for easy retry
      const message =
        err instanceof Error
          ? err.message
          : 'A network interruption occurred. Your inputs have been preserved. Please try submitting again.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#CCD8D2] shadow-sm">
      {/* Accessible Stepper Header */}
      <div className="pb-4 border-b border-[#CCD8D2]">
        <ProgressIndicator
          steps={steps}
          currentStepIndex={activeStep}
          onStepClick={(idx) => setActiveStep(idx)}
        />
      </div>

      {serverError && (
        <InlineNotification
          variant="error"
          title="Intake Submission Issue"
          actionText="Click to retry submission"
          onAction={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
        >
          {serverError}
        </InlineNotification>
      )}

      {/* Section 1: Client & Organization Details */}
      <div className={`space-y-5 ${activeStep !== 0 ? 'hidden' : 'block'}`}>
        <div className="border-b border-[#CCD8D2] pb-2 flex items-center justify-between">
          <h3 className="text-base font-bold font-serif-brand text-[#003C35] flex items-center gap-2">
            <User className="w-4 h-4 text-[#C9A04A]" />
            1. Contact &amp; Client Entity
          </h3>
          <span className="text-xs text-[#536B65]">Step 1 of 3</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            id="contactName"
            label="Full Name of Requestor"
            required
            error={fieldErrors.contactName}
          >
            <Input
              id="contactName"
              placeholder="e.g. Director Michael Vance"
              value={formData.contactName}
              onChange={(e) => handleChange('contactName', e.target.value)}
              onBlur={() => handleBlurTrim('contactName')}
              hasError={!!fieldErrors.contactName}
              leftIcon={<User className="w-4 h-4" />}
            />
            <FieldHint>Must be the authorized representative for site operations</FieldHint>
          </FormField>

          <FormField
            id="organizationName"
            label="Organization / Company"
            error={fieldErrors.organizationName}
          >
            <Input
              id="organizationName"
              placeholder="e.g. Horizon Logistics International"
              value={formData.organizationName || ''}
              onChange={(e) => handleChange('organizationName', e.target.value)}
              onBlur={() => handleBlurTrim('organizationName')}
              hasError={!!fieldErrors.organizationName}
              leftIcon={<Building className="w-4 h-4" />}
            />
            <FieldHint>For corporate, diplomatic, or industrial contracts</FieldHint>
          </FormField>

          <FormField
            id="email"
            label="Official Email Address"
            required
            error={fieldErrors.email}
          >
            <Input
              id="email"
              type="email"
              placeholder="e.g. operations@company.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlurTrim('email')}
              hasError={!!fieldErrors.email}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <FieldHint>Where dispatch proposal and SLA will be securely delivered</FieldHint>
          </FormField>

          <FormField
            id="phone"
            label="Telephone / Mobile Number"
            required
            error={fieldErrors.phone}
          >
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. +1 555-019-4821"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlurTrim('phone')}
              hasError={!!fieldErrors.phone}
              leftIcon={<Phone className="w-4 h-4" />}
            />
            <FieldHint>Standard national or international dialing format</FieldHint>
          </FormField>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={() => setActiveStep(1)}
          >
            Continue to Deployment Scope →
          </Button>
        </div>
      </div>

      {/* Section 2: Deployment Location & Service Class */}
      <div className={`space-y-5 ${activeStep !== 1 ? 'hidden' : 'block'}`}>
        <div className="border-b border-[#CCD8D2] pb-2 flex items-center justify-between">
          <h3 className="text-base font-bold font-serif-brand text-[#003C35] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#C9A04A]" />
            2. Deployment Scope &amp; Location
          </h3>
          <span className="text-xs text-[#536B65]">Step 2 of 3</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            id="serviceType"
            label="Service Discipline"
            required
            error={fieldErrors.serviceType}
          >
            <Select
              id="serviceType"
              value={formData.serviceType}
              onChange={(e) => handleChange('serviceType', e.target.value as ServiceType)}
              hasError={!!fieldErrors.serviceType}
            >
              {SERVICE_CATEGORIES.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.title}
                </option>
              ))}
            </Select>
            <FieldHint>Select primary protection category</FieldHint>
          </FormField>

          <FormField
            id="city"
            label="City / Locality"
            required
            error={fieldErrors.city}
          >
            <Input
              id="city"
              placeholder="e.g. Metropolis, NY"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              onBlur={() => handleBlurTrim('city')}
              hasError={!!fieldErrors.city}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField
              id="siteAddress"
              label="Physical Site Address"
              required
              error={fieldErrors.siteAddress}
            >
              <Input
                id="siteAddress"
                placeholder="e.g. 400 Citadel Boulevard, Gate 3 North"
                value={formData.siteAddress}
                onChange={(e) => handleChange('siteAddress', e.target.value)}
                onBlur={() => handleBlurTrim('siteAddress')}
                hasError={!!fieldErrors.siteAddress}
              />
              <FieldHint>Exact perimeter entrance, gatehouse, or facility address</FieldHint>
            </FormField>
          </div>

          <FormField
            id="coordinates"
            label="GPS Coordinates (Optional)"
            error={fieldErrors.coordinates}
          >
            <Input
              id="coordinates"
              placeholder="e.g. 40.7128, -74.0060"
              value={formData.coordinates || ''}
              onChange={(e) => handleChange('coordinates', e.target.value)}
              onBlur={() => handleBlurTrim('coordinates')}
              hasError={!!fieldErrors.coordinates}
            />
            <FieldHint>Format: Latitude, Longitude</FieldHint>
          </FormField>

          <FormField
            id="guardCount"
            label="Personnel Count Required"
            required
            error={fieldErrors.guardCount}
          >
            <Input
              id="guardCount"
              type="number"
              min={1}
              max={200}
              value={formData.guardCount}
              onChange={(e) => handleChange('guardCount', parseInt(e.target.value, 10) || 1)}
              hasError={!!fieldErrors.guardCount}
            />
            <FieldHint>Sentries required per shift. Requests exceeding 10 guards undergo battalion logistics review.</FieldHint>
          </FormField>
        </div>

        <div className="pt-4 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveStep(0)}
          >
            ← Back to Contact
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => setActiveStep(2)}
          >
            Continue to Post Orders →
          </Button>
        </div>
      </div>

      {/* Section 3: Scheduling, Coverage & Parameters */}
      <div className={`space-y-5 ${activeStep !== 2 ? 'hidden' : 'block'}`}>
        <div className="border-b border-[#CCD8D2] pb-2 flex items-center justify-between">
          <h3 className="text-base font-bold font-serif-brand text-[#003C35] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C9A04A]" />
            3. Operational Schedule &amp; Post Requirements
          </h3>
          <span className="text-xs text-[#536B65]">Step 3 of 3</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FormField
            id="coverage"
            label="Shift Coverage"
            required
            error={fieldErrors.coverage}
          >
            <Select
              id="coverage"
              value={formData.coverage}
              onChange={(e) => handleChange('coverage', e.target.value as CoverageOption)}
              hasError={!!fieldErrors.coverage}
            >
              {Object.entries(COVERAGE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            id="armedPreference"
            label="Guard Specification"
            required
            error={fieldErrors.armedPreference}
          >
            <Select
              id="armedPreference"
              value={formData.armedPreference}
              onChange={(e) => handleChange('armedPreference', e.target.value as ArmedPreference)}
              hasError={!!fieldErrors.armedPreference}
            >
              <option value="UNARMED">Standard Certified Unarmed Sentry</option>
              <option value="ARMED_IF_PERMITTED">Armed Security (Statutory Approved)</option>
            </Select>
            <FieldHint>Armed sentries trigger mandatory statutory regulatory verification</FieldHint>
          </FormField>

          <FormField
            id="duration"
            label="Contract Duration"
            required
            error={fieldErrors.duration}
          >
            <Select
              id="duration"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value as DurationOption)}
              hasError={!!fieldErrors.duration}
            >
              {Object.entries(DURATION_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            id="startDate"
            label="Desired Start Date"
            required
            error={fieldErrors.startDate}
          >
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              hasError={!!fieldErrors.startDate}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField
              id="preferredContactMethod"
              label="Preferred Contact Channel"
              required
              error={fieldErrors.preferredContactMethod}
            >
              <Select
                id="preferredContactMethod"
                value={formData.preferredContactMethod}
                onChange={(e) => handleChange('preferredContactMethod', e.target.value as ContactMethod)}
                hasError={!!fieldErrors.preferredContactMethod}
              >
                <option value="EMAIL">Email Dispatch Briefing</option>
                <option value="PHONE">Direct Telephone Call from Duty Officer</option>
                <option value="WHATSAPP">Secure WhatsApp Business</option>
              </Select>
            </FormField>
          </div>
        </div>

        <FormField
          id="additionalRequirements"
          label="Special Post Orders &amp; Tactical Instructions"
          error={fieldErrors.additionalRequirements}
        >
          <Textarea
            id="additionalRequirements"
            rows={3}
            placeholder="Outline site-specific risks, access clearance criteria, or specific instructions..."
            value={formData.additionalRequirements || ''}
            onChange={(e) => handleChange('additionalRequirements', e.target.value)}
            onBlur={() => handleBlurTrim('additionalRequirements')}
            hasError={!!fieldErrors.additionalRequirements}
          />
          <FieldHint>Max 1,500 characters. Sentry briefing directives.</FieldHint>
        </FormField>

        {/* Privacy Notice & Consent */}
        <div className="p-4 rounded-xl bg-[#F4F6F4] border border-[#CCD8D2] space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="privacyConsent"
              checked={formData.privacyConsent}
              onChange={(e) => handleChange('privacyConsent', e.target.checked)}
              className="mt-1 w-4 h-4 text-[#003C35] rounded border-gray-300 focus:ring-[#C9A04A]"
            />
            <span className="text-xs text-[#24332F] leading-relaxed select-none">
              I confirm that I am authorized to request security services on behalf of the location/organization, and I acknowledge Covenant Shield&apos;s confidentiality terms. All deployment parameters are subject to security threat matrix evaluation and statutory regulatory approval.
            </span>
          </label>
          {fieldErrors.privacyConsent && (
            <p className="text-xs font-semibold text-rose-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fieldErrors.privacyConsent}
            </p>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#CCD8D2]">
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveStep(1)}
          >
            ← Back to Deployment Scope
          </Button>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            rightIcon={<Send className="w-4 h-4" />}
            className="w-full sm:w-auto font-bold"
          >
            {isSubmitting ? 'Transmitting to Dispatch...' : 'Submit Service Request'}
          </Button>
        </div>
      </div>
    </form>
  );
};
