import React, { useState } from 'react';
import { PageHeaderBand } from '../../../components/ui/PageHeaderBand.tsx';
import { FormField } from '../../../components/forms/FormField.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Textarea } from '../../../components/ui/Textarea.tsx';
import { MagneticButton } from '../../../motion/MagneticButton.tsx';
import { Alert } from '../../../components/ui/Alert.tsx';
import { ContactMessageSchema, ContactMessageFormData } from '../../../../../../packages/shared/src/schemas/index.ts';
import { submitContactMessage } from '../../cases/api/casesApi.ts';
import { Phone, Mail, MapPin, Clock, Send, Shield } from 'lucide-react';

export interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<ContactMessageFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    privacyConsent: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{ ticketId: string; message: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const contactInfo = {
    phone: '+1 (800) 555-SHIELD',
    dispatchEmail: 'dispatch@covenantshield.com',
    hqAddress: '100 Citadel Way, Suite 800, Financial District',
  };

  const handleChange = (field: keyof ContactMessageFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg(null);
    setFieldErrors({});

    const val = ContactMessageSchema.safeParse(formData);
    if (!val.success) {
      const errs: Record<string, string> = {};
      val.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!errs[field]) errs[field] = issue.message;
      });
      setFieldErrors(errs);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitContactMessage(val.data);
      setSuccessResult({ ticketId: res.ticketId, message: res.message });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        privacyConsent: false,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to transmit inquiry to dispatch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#F4F6F4]">
      {/* Page Header Band */}
      <PageHeaderBand
        title="Direct line to command."
        badge="HEADQUARTERS & DISPATCH"
        subtitle="Speak directly with our Operations Desk, arrange an onsite security evaluation, or submit an operational inquiry. [DRAFT]"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Contact', path: '/contact' },
        ]}
        onNavigate={onNavigate}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details Column (Cols 1-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div
              className="bg-[#003C35] text-white p-8 rounded-2xl relative overflow-hidden"
              style={{
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25)',
              }}
            >
              <div className="space-y-6 relative z-10">
                <div>
                  <span className="text-xs font-mono font-semibold tracking-widest uppercase text-[#C9A04A]">
                    COMMAND COMMUNICATIONS
                  </span>
                  <h3 className="font-display text-2xl font-medium text-white mt-1">
                    Operations Center
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#C9A04A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white text-sm mb-0.5">Continuous Watch</strong>
                      <span className="text-white/70">24/7 Operations Command &amp; Supervisory Liaison</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#C9A04A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white text-sm mb-0.5">Telephone Dispatch</strong>
                      <a href="tel:+18005557443" className="text-white/80 hover:text-[#C9A04A] block">
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#C9A04A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white text-sm mb-0.5">Encrypted Mail Desk</strong>
                      <a href={`mailto:${contactInfo.dispatchEmail}`} className="text-white/80 hover:text-[#C9A04A] block">
                        {contactInfo.dispatchEmail}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#C9A04A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white text-sm mb-0.5">Headquarters</strong>
                      <span className="text-white/70 block">{contactInfo.hqAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#D9E0DC] space-y-3 shadow-xs">
              <h4 className="text-sm font-display font-semibold text-[#003C35] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#C9A04A]" />
                Planning an active deployment?
              </h4>
              <p className="text-xs text-[#52625D] leading-relaxed">
                If you already know the guard count, shift hours, and site location, submit directly
                via our Service Request intake to obtain a formal reference identifier.
              </p>
              <button
                onClick={() => onNavigate('/request')}
                className="w-full py-2.5 rounded bg-[#003C35] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0B5247] transition-colors cursor-pointer"
              >
                Go to Service Request
              </button>
            </div>
          </div>

          {/* Form Column (Cols 6-12) */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-[#D9E0DC] shadow-xs">
            <h3 className="font-display text-2xl font-semibold text-[#003C35] mb-2">
              Send an Official Inquiry
            </h3>
            <p className="text-xs text-[#52625D] mb-8">
              Duty officers monitor inquiries around the clock. Typical response within 2–4 hours.
            </p>

            {successResult && (
              <Alert variant="success" title="Inquiry Logged by Dispatch" className="mb-6">
                {successResult.message} Reference Ticket: <strong>{successResult.ticketId}</strong>
              </Alert>
            )}

            {errorMsg && (
              <Alert variant="error" title="Transmission Error" className="mb-6">
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField id="c-name" label="Your Name" required error={fieldErrors.name}>
                  <Input
                    id="c-name"
                    placeholder="e.g. Commander Marcus Sterling"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    hasError={!!fieldErrors.name}
                  />
                </FormField>

                <FormField id="c-email" label="Email Address" required error={fieldErrors.email}>
                  <Input
                    id="c-email"
                    type="email"
                    placeholder="e.g. m.sterling@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    hasError={!!fieldErrors.email}
                  />
                </FormField>

                <FormField id="c-phone" label="Phone (Optional)" error={fieldErrors.phone}>
                  <Input
                    id="c-phone"
                    type="tel"
                    placeholder="e.g. +1 555-019-2834"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    hasError={!!fieldErrors.phone}
                  />
                </FormField>

                <FormField id="c-subj" label="Subject" required error={fieldErrors.subject}>
                  <Input
                    id="c-subj"
                    placeholder="e.g. Facility Security Perimeter Evaluation"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    hasError={!!fieldErrors.subject}
                  />
                </FormField>
              </div>

              <FormField id="c-msg" label="Inquiry Message" required error={fieldErrors.message}>
                <Textarea
                  id="c-msg"
                  rows={4}
                  placeholder="Detail your security concern, property configuration, or operational requirements..."
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  hasError={!!fieldErrors.message}
                />
              </FormField>

              <div className="p-4 rounded-lg bg-[#F4F6F4] border border-[#D9E0DC]">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="c-consent"
                    checked={formData.privacyConsent}
                    onChange={(e) => handleChange('privacyConsent', e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#003C35] rounded border-[#D9E0DC] focus:ring-[#C9A04A]"
                  />
                  <span className="text-xs text-[#24332F] leading-snug">
                    I confirm this inquiry will be routed to Covenant Shield Operations Dispatch in
                    accordance with strict client non-disclosure standards.
                  </span>
                </label>
                {fieldErrors.privacyConsent && (
                  <p role="alert" className="text-xs font-semibold text-[#A12B2B] mt-1.5">
                    {fieldErrors.privacyConsent}
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <MagneticButton
                  type="submit"
                  variant="gold"
                  disabled={isSubmitting}
                  className="!px-7 !py-3 font-bold uppercase text-xs tracking-wider"
                >
                  <span className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Transmitting...' : 'Send Inquiry'}</span>
                  </span>
                </MagneticButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
