import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ShieldCheck, ArrowRight, Printer, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/Button.tsx';

export interface RequestReferenceCardProps {
  referenceNumber: string;
  verificationCode: string;
  status: string;
  title?: string;
  description?: string;
  trackingPath: string;
  onNavigate: (path: string) => void;
}

export const RequestReferenceCard: React.FC<RequestReferenceCardProps> = ({
  referenceNumber,
  verificationCode,
  status,
  title = 'Service Request Confirmed & Queued',
  description = 'Your requirement has been securely submitted to the Covenant Shield Operations Dispatch Registry. To safeguard your site details, both your Reference ID and Verification Code are required to view updates.',
  trackingPath,
  onNavigate,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyRef = () => {
    navigator.clipboard?.writeText(referenceNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(verificationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-[#003C35] shadow-xl overflow-hidden max-w-2xl mx-auto animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-[#003C35] p-6 text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <div className="w-12 h-12 rounded-full bg-[#C9A04A]/20 border border-[#C9A04A] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7 text-[#C9A04A]" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif-brand">{title}</h3>
            <span className="text-xs text-[#C9A04A] font-semibold tracking-wider uppercase">
              Official Log Status: {status}
            </span>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-200 hover:text-white bg-[#0A554C] px-3 py-1.5 rounded-md border border-[#C9A04A]/30 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Receipt</span>
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <p className="text-sm text-[#536B65] leading-relaxed">{description}</p>

        {/* Credentials Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F4F6F4] p-5 rounded-xl border border-[#CCD8D2]">
          {/* Reference ID */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003C35] block">
              Reference Identifier
            </span>
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-lg border border-[#CCD8D2]">
              <span className="font-mono text-base font-bold text-[#003C35] tracking-wider">
                {referenceNumber}
              </span>
              <button
                onClick={handleCopyRef}
                className="text-[#536B65] hover:text-[#003C35] p-1 rounded"
                title="Copy reference number"
              >
                {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-[#536B65]">Official tracking identifier</span>
          </div>

          {/* Verification Code */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003C35] block">
              Security Verification Code
            </span>
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-lg border border-[#CCD8D2]">
              <span className="font-mono text-base font-bold text-[#C9A04A] tracking-widest">
                {verificationCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="text-[#536B65] hover:text-[#003C35] p-1 rounded"
                title="Copy verification code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-[#536B65]">Required for 2FA status queries</span>
          </div>
        </div>

        {/* Security Warning */}
        <div className="flex items-start gap-3 p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Confidential Security Notice</span>
            Covenant Shield implements zero-knowledge reference queries. We do not transmit or reveal confidential site assessments without this matching verification code. Store these details securely.
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            variant="gold"
            fullWidth
            onClick={() => onNavigate(trackingPath)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Track Status Now
          </Button>

          <Button
            variant="outline"
            fullWidth
            onClick={() => onNavigate('/')}
          >
            Return to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
};
