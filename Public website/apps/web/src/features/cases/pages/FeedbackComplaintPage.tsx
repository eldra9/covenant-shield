import React, { useState } from 'react';
import { PageHeaderBand } from '../../../components/ui/PageHeaderBand.tsx';
import { FormField } from '../../../components/forms/FormField.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Textarea } from '../../../components/ui/Textarea.tsx';
import { MagneticButton } from '../../../motion/MagneticButton.tsx';
import { SealStamp } from '../../../motion/SealStamp.tsx';
import { submitCase, CreateCaseResult } from '../api/casesApi.ts';
import { CaseSchema, CaseFormData } from '../../../../../../packages/shared/src/schemas/index.ts';
import { CaseCategory } from '../../../../../../packages/shared/src/types/index.ts';
import {
  ShieldAlert,
  Star,
  UploadCloud,
  File,
  X,
  Check,
  Copy,
  AlertTriangle,
  Send,
  Shield,
} from 'lucide-react';

export interface FeedbackComplaintPageProps {
  onNavigate: (path: string, options?: { referenceNumber?: string; phone?: string }) => void;
}

export const FeedbackComplaintPage: React.FC<FeedbackComplaintPageProps> = ({ onNavigate }) => {
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

  const [files, setFiles] = useState<{ name: string; size: number; base64: string; mimeType: string }[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<CreateCaseResult | null>(null);
  const [copied, setCopied] = useState(false);

  const categories: { id: CaseCategory; label: string; desc: string }[] = [
    { id: 'COMPLAINT', label: 'Complaint', desc: 'Service incident or post shortfall' },
    { id: 'COMPLIMENT', label: 'Compliment', desc: 'Sentry commendation or praise' },
    { id: 'SUGGESTION', label: 'Suggestion', desc: 'Operational improvement note' },
    { id: 'GENERAL_FEEDBACK', label: 'General Feedback', desc: 'General observation' },
  ];

  const isGeneralFeedback = formData.category === 'GENERAL_FEEDBACK';

  const handleChange = (field: keyof CaseFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // File Upload Handlers (max 3 files, 5MB each, PDF/JPG/PNG)
  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    const newFiles = [...files];

    for (let i = 0; i < selectedFiles.length; i++) {
      if (newFiles.length >= 3) break;
      const file = selectedFiles[i];

      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: Only PDF, JPG, and PNG formats are accepted.`);
        continue;
      }
      if (file.size > maxSizeBytes) {
        alert(`${file.name} exceeds 5 MB.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Str = (reader.result as string).split(',')[1] || '';
        setFiles((prev) => {
          if (prev.length >= 3) return prev;
          return [...prev, { name: file.name, size: file.size, base64: base64Str, mimeType: file.type }];
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    setFieldErrors({});

    const result = CaseSchema.safeParse(formData);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (!errs[key]) errs[key] = issue.message;
      });
      setFieldErrors(errs);

      const firstKey = Object.keys(errs)[0];
      const el = document.getElementById(`case-${firstKey}`);
      if (el) el.focus();
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitCase(result.data);
      setSuccessResult(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to register feedback in oversight register.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className="w-full bg-[#F4F6F4] min-h-screen">
      {/* Header Band */}
      <PageHeaderBand
        title="Feedback & Complaints."
        badge="STANDARDS & OVERSIGHT"
        subtitle="Submit feedback, commendations, or service shortfall reports directly to the Quality Assurance Directorate. [DRAFT]"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Feedback & Complaints', path: '/feedback' },
        ]}
        onNavigate={onNavigate}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* ========================================================
            SUCCESS: DispatchTicket with SealStamp
        ======================================================== */}
        {successResult ? (
          <div
            className="max-w-2xl mx-auto bg-[#0D322D] text-white rounded-2xl border border-[#C9A04A]/40 p-8 sm:p-12 shadow-2xl relative overflow-hidden transition-all duration-700 ease-out will-change-transform"
            style={{
              transitionTimingFunction: 'var(--e-silk)',
              transform: 'translateY(0)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25), 0 24px 48px rgba(0,20,16,0.5)',
            }}
          >
            {/* SealStamp on corner */}
            <div className="absolute top-6 right-6">
              <SealStamp size={80} label="LOGGED" />
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#C9A04A] uppercase tracking-widest block">
                  CASE LOGGED · STANDARDS REGISTER
                </span>
                <h2 className="font-display text-3xl font-medium text-white">
                  Oversight Matter Registered
                </h2>
                <p className="text-sm text-white/80 leading-relaxed max-w-lg">
                  Your report has been entered into the Covenant Shield Professional Standards
                  Register. An independent supervisory review has been initiated.
                </p>
              </div>

              {/* Reference Chip */}
              <div className="p-4 rounded-xl bg-[#092824] border border-[#C9A04A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
                    Case Reference Number
                  </span>
                  <span className="font-mono text-2xl font-bold tracking-wider text-[#C9A04A]">
                    {successResult.referenceNumber}
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(successResult.referenceNumber)}
                  className="px-4 py-2 rounded border border-[#C9A04A]/50 bg-[#C9A04A]/10 text-xs font-mono uppercase tracking-wider text-[#C9A04A] hover:bg-[#C9A04A]/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Ref'}</span>
                </button>
              </div>

              {copied && (
                <div className="p-2 rounded bg-emerald-900/60 border border-emerald-500/50 text-emerald-200 text-xs text-center font-mono">
                  Case reference copied to clipboard.
                </div>
              )}

              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4">
                <MagneticButton
                  variant="gold"
                  onClick={() =>
                    onNavigate('/track-case', {
                      referenceNumber: successResult.referenceNumber,
                      phone: formData.phone,
                    })
                  }
                  className="w-full sm:w-auto !px-6 !py-3 font-bold uppercase text-xs tracking-wider"
                >
                  Track this case
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
        ) : (
          /* ========================================================
              FORM
          ======================================================== */
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#D9E0DC] shadow-xs">
            {errorMessage && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-[#FBE9E9] border border-[#A12B2B]/40 text-[#A12B2B] text-xs flex items-center gap-2 mb-6"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 1. Category Tiles */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#003C35] block mb-3">
                  Submission Category <span className="text-[#C9A04A]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map((cat) => {
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleChange('category', cat.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none ${
                          isSelected
                            ? 'bg-[#003C35] text-white border-[#003C35] ring-1 ring-[#C9A04A]'
                            : 'bg-white text-[#24332F] border-[#D9E0DC] hover:border-[#003C35]/50'
                        }`}
                      >
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-[#C9A04A]' : 'text-[#003C35]'
                          }`}
                        >
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  id="case-contactName"
                  label="Your Full Name"
                  required={!isGeneralFeedback}
                  error={fieldErrors.contactName}
                >
                  <Input
                    id="case-contactName"
                    placeholder="e.g. Eleanor Vance"
                    value={formData.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                    hasError={!!fieldErrors.contactName}
                  />
                </FormField>

                <FormField
                  id="case-email"
                  label="Email Address"
                  required={!isGeneralFeedback}
                  error={fieldErrors.email}
                >
                  <Input
                    id="case-email"
                    type="email"
                    placeholder="e.g. e.vance@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    hasError={!!fieldErrors.email}
                  />
                </FormField>

                <FormField
                  id="case-phone"
                  label="Phone Number (Optional)"
                  hint="Used for 2FA case status tracking"
                  error={fieldErrors.phone}
                >
                  <Input
                    id="case-phone"
                    type="tel"
                    placeholder="e.g. +1 555-402-9912"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    hasError={!!fieldErrors.phone}
                  />
                </FormField>

                {/* Site Location (Optional) */}
                <FormField
                  id="case-relatedSite"
                  label="Site Location (Optional)"
                  error={fieldErrors.relatedSite}
                >
                  <Input
                    id="case-relatedSite"
                    placeholder="e.g. Pier 42 Maritime Terminal, Gate B"
                    value={formData.relatedSite || ''}
                    onChange={(e) => handleChange('relatedSite', e.target.value)}
                    hasError={!!fieldErrors.relatedSite}
                  />
                </FormField>
              </div>

              {/* Guard as Free Text (no public name list to protect security personnel) */}
              <FormField
                id="case-personnelRef"
                label="Guard / Personnel Reference (Optional)"
                hint="Free text: Badge number, physical description, or station post (no public officer list)"
                error={fieldErrors.personnelRef}
              >
                <Input
                  id="case-personnelRef"
                  placeholder="e.g. Day Shift Officer at East Gate (Badge #CS-881)"
                  value={formData.personnelRef || ''}
                  onChange={(e) => handleChange('personnelRef', e.target.value)}
                  hasError={!!fieldErrors.personnelRef}
                />
              </FormField>

              {/* Rating 1-5 (Keyboard Radio Group; Stars fill with 120ms stagger) */}
              <div role="radiogroup" aria-labelledby="rating-label">
                <span
                  id="rating-label"
                  className="text-xs font-semibold uppercase tracking-wider text-[#003C35] block mb-2"
                >
                  Overall Evaluation Rating (1 to 5)
                </span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (formData.rating || 0) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={formData.rating === star}
                        tabIndex={0}
                        onClick={() => handleChange('rating', star)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                            handleChange('rating', Math.min(5, (formData.rating || 1) + 1));
                          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                            handleChange('rating', Math.max(1, (formData.rating || 1) - 1));
                          }
                        }}
                        className="p-1 rounded text-gray-300 hover:text-[#C9A04A] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#003C35]"
                        aria-label={`${star} Star`}
                      >
                        <Star
                          className={`w-7 h-7 transition-all ${
                            isFilled ? 'fill-[#C9A04A] text-[#C9A04A]' : 'text-gray-300'
                          }`}
                          style={{
                            transitionDelay: `${(star - 1) * 120}ms`,
                          }}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-mono text-[#52625D] ml-2">
                    {formData.rating ? `${formData.rating} / 5 Stars` : 'No rating'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <FormField
                id="case-description"
                label="Detailed Statement"
                required
                hint="Provide specific times, locations, and factual observations (min 10 characters)"
                error={fieldErrors.description}
              >
                <Textarea
                  id="case-description"
                  rows={5}
                  placeholder="Describe the incident or commendation with verifiable facts..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  hasError={!!fieldErrors.description}
                />
              </FormField>

              {/* FileDropzone (max 3 files, 5 MB each, PDF/JPG/PNG) */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#003C35] block">
                  Supporting Documentation / Evidence (Optional)
                </label>
                <div className="border-2 border-dashed border-[#D9E0DC] hover:border-[#003C35]/60 rounded-xl p-6 text-center bg-[#F4F6F4]/50 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileDrop}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2 select-none"
                  >
                    <UploadCloud className="w-8 h-8 text-[#003C35]" />
                    <span className="text-xs font-semibold text-[#003C35]">
                      Drop evidence files here, or <span className="text-[#C9A04A] underline">browse</span>
                    </span>
                    <span className="text-[11px] text-[#52625D]">
                      Max 3 files, 5 MB each. PDF, JPG, PNG accepted.
                    </span>
                  </label>
                </div>

                {/* Attached files list */}
                {files.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#D9E0DC] text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <File className="w-4 h-4 text-[#003C35] shrink-0" />
                          <span className="truncate font-medium text-[#24332F]">{f.name}</span>
                          <span className="text-gray-400 font-mono text-[10px]">
                            ({(f.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                          aria-label={`Remove ${f.name}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consent */}
              <div className="p-4 rounded-xl bg-[#F4F6F4] border border-[#D9E0DC]">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="case-consent"
                    checked={formData.privacyConsent}
                    onChange={(e) => handleChange('privacyConsent', e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#003C35] rounded border-[#D9E0DC] focus:ring-[#C9A04A]"
                  />
                  <span className="text-xs text-[#24332F] leading-snug">
                    I certify that this submission is factual and understand it will be formally
                    investigated by the Quality Assurance Directorate.
                  </span>
                </label>
                {fieldErrors.privacyConsent && (
                  <p role="alert" className="text-xs font-semibold text-[#A12B2B] mt-1.5">
                    {fieldErrors.privacyConsent}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2 flex justify-end">
                <MagneticButton
                  type="submit"
                  variant="gold"
                  disabled={isSubmitting}
                  className="!px-8 !py-3.5 font-bold uppercase text-xs tracking-wider"
                >
                  <span className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Registering Case...' : 'Submit to Standards Register'}</span>
                  </span>
                </MagneticButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
