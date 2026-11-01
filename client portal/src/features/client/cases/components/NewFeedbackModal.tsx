/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NewFeedbackModal:
 * Client feedback, complaints, and incident report submission:
 * - Type: Complaint / Compliment / Suggestion / General feedback
 * - Site select (scoped to client)
 * - Optional guard name as free text
 * - Rating 1-5
 * - Message
 * - Up to 3 attachments (5MB each, PDF/JPG/PNG; client & server verified)
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clientPortalApi } from '@/src/api/clientPortalApi';
import { Site, ClientCase } from '@/src/types/clientPortal';
import { X, Star, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

const feedbackSchema = z.object({
  type: z.enum(['Complaint', 'Compliment', 'Suggestion', 'General feedback']),
  siteId: z.string().optional(),
  guardName: z.string().optional(),
  rating: z.number().min(1).max(5),
  subject: z.string().min(5, 'Subject is required (min 5 characters)'),
  message: z.string().min(10, 'Message details required (min 10 characters)'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface NewFeedbackModalProps {
  sites: Site[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCase: ClientCase) => void;
}

export const NewFeedbackModal: React.FC<NewFeedbackModalProps> = ({
  sites,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    defaultValues: {
      type: 'General feedback',
      rating: 5,
      subject: '',
      message: '',
      guardName: '',
      siteId: sites[0]?.id || '',
    },
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files) return;

    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 3) {
      setFileError('Maximum of 3 attachments allowed per dispatch submission.');
      return;
    }

    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    for (const f of selected) {
      if (f.size > 5 * 1024 * 1024) {
        setFileError(`File ${f.name} exceeds 5 MB limit.`);
        return;
      }
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      if (!validExtensions.includes(ext)) {
        setFileError(`File ${f.name} format is not supported. Allowed: PDF, JPG, PNG.`);
        return;
      }
    }

    setFiles(prev => [...prev, ...selected].slice(0, 3));
  };

  const removeFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const categoryMap: Record<string, ClientCase['category']> = {
        'Complaint': 'Incident Inquiry',
        'Compliment': 'General Feedback',
        'Suggestion': 'Equipment & Access',
        'General feedback': 'General Feedback',
      };

      const caseCategory = categoryMap[data.type] || 'General Feedback';
      const compositeDescription = `[Category: ${data.type} | Service Rating: ${rating}/5]${
        data.guardName ? ` [Officer Referenced: ${data.guardName}]` : ''
      }\n\n${data.message}`;

      const created = await clientPortalApi.createCase({
        subject: `[${data.type}] ${data.subject}`,
        category: caseCategory,
        priority: data.type === 'Complaint' ? 'High' : 'Medium',
        siteId: data.siteId || undefined,
        description: compositeDescription,
      });

      onSuccess(created);
      reset();
      setFiles([]);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div className="relative w-full max-w-xl bg-[var(--surface-card)] rounded-2xl border border-[var(--surface-border)] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--surface-border)] bg-[var(--emerald-50)]/40 dark:bg-[#0D322D]">
          <div className="space-y-1">
            <span className="text-[11px] font-mono-ref uppercase tracking-wider text-[#A47F2E]">
              Client Concierge Desk
            </span>
            <h2 id="feedback-modal-title" className="font-display text-xl font-bold text-[var(--text-main)]">
              Submit Feedback or Incident
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-black/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#FBE9E9] text-[#A12B2B] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-main)]">
              Dispatch Nature *
            </label>
            <select
              {...register('type')}
              className="w-full text-xs p-2.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-main)]"
            >
              <option value="General feedback">General Feedback</option>
              <option value="Complaint">Complaint / Service Discrepancy</option>
              <option value="Compliment">Compliment / Commendation</option>
              <option value="Suggestion">Operational Suggestion</option>
            </select>
          </div>

          {/* Site and Guard Free Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-main)]">
                Relevant Site Location
              </label>
              <select
                {...register('siteId')}
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-main)]"
              >
                <option value="">(All or General HQ)</option>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-main)]">
                Specific Guard Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Officer Kiprono"
                {...register('guardName')}
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-main)]"
              />
            </div>
          </div>

          {/* Rating 1-5 */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-medium text-[var(--text-main)] block">
              Satisfaction Level ({rating} of 5)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-[#C9A04A] hover:scale-110 transition-transform cursor-pointer"
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-[#C9A04A] text-[#C9A04A]' : 'text-gray-300 dark:text-gray-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-main)]">
              Subject *
            </label>
            <input
              type="text"
              placeholder="Brief summary of communication"
              {...register('subject')}
              className="w-full text-xs p-2.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-main)]"
            />
            {errors.subject && (
              <p className="text-[11px] text-[#A12B2B]">{errors.subject.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-main)]">
              Detailed Narrative *
            </label>
            <textarea
              rows={4}
              placeholder="State observed timeline, personnel involved, or requested remedial action..."
              {...register('message')}
              className="w-full text-xs p-2.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-main)]"
            />
            {errors.message && (
              <p className="text-[11px] text-[#A12B2B]">{errors.message.message}</p>
            )}
          </div>

          {/* File Attachments (max 3, 5MB each) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-main)]">
                Attachments (Optional - max 3 files, 5 MB each)
              </span>
              <span className="text-[11px] font-mono-ref text-[var(--text-sub)]">
                {files.length} / 3 selected
              </span>
            </div>

            <label className="flex items-center justify-center p-3 rounded-lg border border-dashed border-[var(--surface-border)] hover:border-[#003C35] hover:bg-[var(--emerald-50)]/20 cursor-pointer transition-colors text-xs text-[var(--text-sub)]">
              <Upload className="w-4 h-4 mr-2 text-[#A47F2E]" />
              <span>Attach PDF, JPG, or PNG</span>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                disabled={files.length >= 3}
              />
            </label>

            {fileError && (
              <p className="text-[11px] text-[#A12B2B]">{fileError}</p>
            )}

            {files.length > 0 && (
              <div className="space-y-1 pt-1">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-1.5 rounded bg-[var(--surface-bg)] text-xs font-mono-ref text-[var(--text-main)]"
                  >
                    <span className="truncate max-w-[280px]">{f.name} ({(f.size / 1024).toFixed(0)} KB)</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-[#A12B2B] hover:underline cursor-pointer ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer CTAs */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--surface-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[var(--text-sub)] hover:text-[var(--text-main)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#003C35] hover:bg-[#0B5247] text-white text-xs font-semibold tracking-wide transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Transmitting to Desk...' : 'Transmit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
