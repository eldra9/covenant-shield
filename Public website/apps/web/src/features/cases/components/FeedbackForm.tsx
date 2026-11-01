import React, { useState, useRef } from 'react';
import { Send, Star, User, Mail, Phone, Building, AlertCircle } from 'lucide-react';
import { CaseCategory, CaseAttachmentMeta } from '../../../../../../packages/shared/src/types/index.ts';
import { CaseSchema, CaseFormData } from '../../../../../../packages/shared/src/schemas/index.ts';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Textarea } from '../../../components/ui/Textarea.tsx';
import { FormField } from '../../../components/forms/FormField.tsx';
import { FieldHint } from '../../../components/ui/FieldHint.tsx';
import { FileUpload } from '../../../components/ui/FileUpload.tsx';
import { InlineNotification } from '../../../components/ui/InlineNotification.tsx';
import { submitCase, CreateCaseResult } from '../api/casesApi.ts';

export interface FeedbackFormProps {
  onSuccess: (result: CreateCaseResult) => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccess }) => {
  const idempotencyKeyRef = useRef<string>(
    `idemp-case-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );

  const [formData, setFormData] = useState<CaseFormData>({
    category: 'COMPLAINT' as CaseCategory,
    contactName: '',
    email: '',
    phone: '',
    relatedSite: '',
    personnelRef: '',
    rating: 5,
    description: '',
    privacyConsent: false,
  });

  const [attachments, setAttachments] = useState<CaseAttachmentMeta[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof CaseFormData, value: unknown) => {
    let sanitized = value;
    if (typeof value === 'string' && field === 'email') {
      sanitized = value.toLowerCase().trim();
    }

    setFormData((prev) => ({ ...prev, [field]: sanitized }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBlurTrim = (field: keyof CaseFormData) => {
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

    const normalized: CaseFormData = {
      ...formData,
      contactName: formData.contactName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone ? formData.phone.trim() : '',
      relatedSite: formData.relatedSite ? formData.relatedSite.trim() : '',
      personnelRef: formData.personnelRef ? formData.personnelRef.trim() : '',
      description: formData.description.trim(),
      idempotencyKey: idempotencyKeyRef.current,
    };

    const validation = CaseSchema.safeParse(normalized);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (!errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      });
      setFieldErrors(errors);

      const firstError = Object.keys(errors)[0];
      const el = document.getElementById(firstError);
      if (el) el.focus();
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...validation.data,
        attachments,
      };
      const result = await submitCase(payload);
      onSuccess(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to record case in oversight register.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-10 rounded-2xl border border-[#CCD8D2] shadow-sm">
      {serverError && (
        <InlineNotification
          variant="error"
          title="Submission Issue"
          actionText="Click to retry"
          onAction={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
        >
          {serverError}
        </InlineNotification>
      )}

      {/* Category selector buttons */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[#003C35] block mb-2">
          Feedback Category *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(
            [
              { id: 'COMPLAINT', label: 'Complaint', desc: 'Service incident or shortfall' },
              { id: 'COMPLIMENT', label: 'Commendation', desc: 'Officer praise or commendation' },
              { id: 'SUGGESTION', label: 'Suggestion', desc: 'Operational improvement' },
              { id: 'GENERAL_FEEDBACK', label: 'Feedback', desc: 'General observation' },
            ] as const
          ).map((cat) => {
            const isSelected = formData.category === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => handleChange('category', cat.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#003C35] bg-[#003C35] text-white shadow-sm'
                    : 'border-[#CCD8D2] bg-white text-[#24332F] hover:bg-[#F4F6F4]'
                }`}
              >
                <div className={`text-xs font-bold ${isSelected ? 'text-[#C9A04A]' : 'text-[#003C35]'}`}>
                  {cat.label}
                </div>
                <div className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-gray-200' : 'text-[#536B65]'}`}>
                  {cat.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submitter info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="contactName"
          label="Your Full Name"
          required
          error={fieldErrors.contactName}
        >
          <Input
            id="contactName"
            placeholder="e.g. Eleanor Vance"
            value={formData.contactName}
            onChange={(e) => handleChange('contactName', e.target.value)}
            onBlur={() => handleBlurTrim('contactName')}
            hasError={!!fieldErrors.contactName}
            leftIcon={<User className="w-4 h-4" />}
          />
        </FormField>

        <FormField
          id="email"
          label="Your Email Address"
          required
          error={fieldErrors.email}
        >
          <Input
            id="email"
            type="email"
            placeholder="e.g. e.vance@crestwood.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlurTrim('email')}
            hasError={!!fieldErrors.email}
            leftIcon={<Mail className="w-4 h-4" />}
          />
          <FieldHint>For official verification and supervisory resolution notices</FieldHint>
        </FormField>

        <FormField
          id="phone"
          label="Phone Number (Optional)"
          error={fieldErrors.phone}
        >
          <Input
            id="phone"
            type="tel"
            placeholder="e.g. +1 555-019-3829"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlurTrim('phone')}
            hasError={!!fieldErrors.phone}
            leftIcon={<Phone className="w-4 h-4" />}
          />
        </FormField>

        <FormField
          id="relatedSite"
          label="Related Location or Site"
          error={fieldErrors.relatedSite}
        >
          <Input
            id="relatedSite"
            placeholder="e.g. Metro West Logistics Hub"
            value={formData.relatedSite || ''}
            onChange={(e) => handleChange('relatedSite', e.target.value)}
            onBlur={() => handleBlurTrim('relatedSite')}
            hasError={!!fieldErrors.relatedSite}
            leftIcon={<Building className="w-4 h-4" />}
          />
          <FieldHint>Where did the incident or service take place?</FieldHint>
        </FormField>

        <FormField
          id="personnelRef"
          label="Guard / Employee Reference (Optional)"
          error={fieldErrors.personnelRef}
        >
          <Input
            id="personnelRef"
            placeholder="e.g. Officer Marcus (Badge #CS-442)"
            value={formData.personnelRef || ''}
            onChange={(e) => handleChange('personnelRef', e.target.value)}
            onBlur={() => handleBlurTrim('personnelRef')}
            hasError={!!fieldErrors.personnelRef}
          />
          <FieldHint>Officer name, vehicle patrol unit, or badge identifier</FieldHint>
        </FormField>

        {/* Rating component (1 to 5) */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#003C35] block mb-2">
            Service Rating (Optional)
          </label>
          <div className="flex items-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => handleChange('rating', star)}
                className="p-1 text-gray-300 hover:text-[#C9A04A] transition-colors cursor-pointer"
                aria-label={`Rate ${star} out of 5 stars`}
              >
                <Star
                  className={`w-6 h-6 ${
                    (formData.rating || 0) >= star
                      ? 'fill-[#C9A04A] text-[#C9A04A]'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs text-[#536B65] font-medium ml-2">
              {formData.rating ? `${formData.rating} / 5 Stars` : 'No rating'}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <FormField
        id="description"
        label="Detailed Description"
        required
        error={fieldErrors.description}
      >
        <Textarea
          id="description"
          rows={5}
          placeholder="Describe the incident, praise, or suggestion with specific dates, times, and observable facts..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlurTrim('description')}
          hasError={!!fieldErrors.description}
        />
        <FieldHint>Minimum 10 characters, maximum 2,500 characters.</FieldHint>
      </FormField>

      {/* Attachments Section using FileUpload */}
      <div className="p-4 rounded-xl bg-[#F4F6F4] border border-[#CCD8D2]">
        <FileUpload
          maxFiles={3}
          attachments={attachments}
          onChange={(newAttachments) => setAttachments(newAttachments)}
        />
      </div>

      {/* Consent Checkbox */}
      <div className="p-4 rounded-xl bg-[#F4F6F4] border border-[#CCD8D2] space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            id="casePrivacyConsent"
            checked={formData.privacyConsent}
            onChange={(e) => handleChange('privacyConsent', e.target.checked)}
            className="mt-1 w-4 h-4 text-[#003C35] rounded border-gray-300 focus:ring-[#C9A04A]"
          />
          <span className="text-xs text-[#24332F] leading-relaxed select-none">
            I certify that the information provided is accurate to the best of my knowledge and understand that official investigations are logged into the permanent Covenant Shield Compliance Register.
          </span>
        </label>
        {fieldErrors.privacyConsent && (
          <p className="text-xs font-semibold text-rose-700 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {fieldErrors.privacyConsent}
          </p>
        )}
      </div>

      {/* Submit button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#CCD8D2]">
        <span className="text-xs text-[#536B65]">
          A formal Case Reference (CS-YYYY-XXXXX) will be generated.
        </span>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          rightIcon={<Send className="w-4 h-4" />}
          className="w-full sm:w-auto font-bold"
        >
          {isSubmitting ? 'Filing into Register...' : 'Submit Feedback / Case'}
        </Button>
      </div>
    </form>
  );
};
