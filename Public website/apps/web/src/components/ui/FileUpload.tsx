import React, { useRef, useState } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CaseAttachmentMeta } from '../../../../../packages/shared/src/types/index.ts';

export interface FileUploadProps {
  maxFiles?: number;
  maxSizeInBytes?: number;
  allowedMimeTypes?: string[];
  attachments: CaseAttachmentMeta[];
  onChange: (attachments: CaseAttachmentMeta[]) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  maxFiles = 3,
  maxSizeInBytes = 5 * 1024 * 1024, // 5MB
  allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  attachments,
  onChange,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    if (attachments.length + files.length > maxFiles) {
      setErrorMessage(`Maximum limit reached: You can attach up to ${maxFiles} files.`);
      return;
    }

    const newItems: CaseAttachmentMeta[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check size
      if (file.size > maxSizeInBytes) {
        setErrorMessage(`"${file.name}" exceeds the 5MB maximum limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
        return;
      }

      // Check MIME type
      if (!allowedMimeTypes.includes(file.type)) {
        setErrorMessage(`"${file.name}" has an unsupported format. Allowed formats: PDF, PNG, JPG, WEBP.`);
        return;
      }

      newItems.push({
        fileName: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      });
    }

    onChange([...attachments, ...newItems]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => {
    onChange(attachments.filter((_, idx) => idx !== index));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold uppercase tracking-wider text-[#003C35] flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-[#C9A04A]" />
          Document &amp; Photo Evidence Attachments
        </span>
        <span className="text-[#536B65]">
          {attachments.length} of {maxFiles} files added
        </span>
      </div>

      {/* Drag & Drop Box */}
      {attachments.length < maxFiles && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-[#003C35] bg-[#003C35]/5'
              : 'border-[#CCD8D2] hover:border-[#003C35] bg-white'
          }`}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload files area. Drag and drop or press to browse."
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedMimeTypes.join(',')}
            onChange={(e) => processFiles(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#F4F6F4] border border-[#CCD8D2] flex items-center justify-center text-[#003C35]">
              <Upload className="w-5 h-5 text-[#003C35]" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-[#003C35] underline mr-1">Browse files</span>
              <span className="text-[#536B65]">or drag and drop here</span>
            </div>
            <p className="text-[11px] text-[#536B65]">
              Supported: PDF, PNG, JPG, WEBP (Max 5MB each)
            </p>
          </div>
        </div>
      )}

      {/* File Validation Error */}
      {errorMessage && (
        <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* List of Attached Files */}
      {attachments.length > 0 && (
        <ul className="space-y-2" aria-label="Attached files list">
          {attachments.map((file, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-[#F4F6F4] border border-[#CCD8D2] text-xs"
            >
              <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                <FileText className="w-4 h-4 text-[#003C35] shrink-0" />
                <span className="font-semibold text-[#24332F] truncate">{file.fileName}</span>
                <span className="text-[11px] text-[#536B65] shrink-0">
                  ({(file.fileSize / 1024).toFixed(0)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1 rounded text-gray-500 hover:text-red-700 transition-colors cursor-pointer"
                aria-label={`Remove attachment ${file.fileName}`}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
