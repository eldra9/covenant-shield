/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, File, AlertCircle } from 'lucide-react';

interface ClientReplyFormProps {
  isClosed: boolean;
  onSendReply: (content: string, attachments?: File[]) => Promise<void>;
  onReopen?: () => void;
}

export const ClientReplyForm: React.FC<ClientReplyFormProps> = ({
  isClosed,
  onSendReply,
  onReopen,
}) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isClosed) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 text-center">
        <p className="text-xs text-stone-600 font-medium">
          This case has been formally resolved and closed. Direct replies are disabled.
        </p>
        {onReopen && (
          <button
            onClick={onReopen}
            className="mt-3 px-3.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Request Ticket Reopening
          </button>
        )}
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      // Validate max file size 10MB
      const invalid = selected.find(f => f.size > 10 * 1024 * 1024);
      if (invalid) {
        setError(`File ${invalid.name} exceeds the 10MB upload limit.`);
        return;
      }
      setError(null);
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSendReply(content, files);
      setContent('');
      setFiles([]);
    } catch (err: any) {
      setError(err.message || 'Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
      <h4 className="text-xs font-bold text-[#092824] uppercase tracking-wider mb-2">
        Post Client Reply to Operations Team
      </h4>

      {error && (
        <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <textarea
        rows={3}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Provide additional context, clarify incident time, or acknowledge operations findings..."
        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003C35] focus:bg-white text-stone-900"
        required
      />

      {/* Selected Attachments List */}
      {files.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-700 rounded-md text-xs border border-stone-200"
            >
              <File className="w-3 h-3 text-stone-500" />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="text-stone-400 hover:text-stone-700 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Attach File (PDF, Images up to 10MB)</span>
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting || (!content.trim() && files.length === 0)}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#003C35] hover:bg-[#002b26] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5 text-[#C9A04A]" />
          <span>{submitting ? 'Transmitting...' : 'Send Reply'}</span>
        </button>
      </div>
    </form>
  );
};
