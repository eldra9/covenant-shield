/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * RestrictedPostState:
 * Canonical 403 Forbidden state component:
 * "Restricted post: You don't have access to this page. If you think you should, contact your administrator."
 */

import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { GuillocheSeal } from '@/src/components/luxury/GuillocheSeal';

interface RestrictedPostStateProps {
  onBack: () => void;
  title?: string;
  className?: string;
}

export const RestrictedPostState: React.FC<RestrictedPostStateProps> = ({
  onBack,
  title = 'Restricted Post Access',
  className = '',
}) => {
  return (
    <div className={`min-h-[460px] flex items-center justify-center p-6 ${className}`}>
      <div className="max-w-lg w-full bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-8 text-center shadow-lg space-y-5">
        <div className="flex justify-center">
          <div className="relative">
            <GuillocheSeal size={72} theme="dark" showCenterEmblem={false} />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-[#A12B2B]" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono-ref uppercase tracking-widest text-[#A12B2B]">
            403 • Operational Boundary Enforced
          </span>
          <h2 className="font-display text-xl font-bold text-[var(--text-main)]">
            {title}
          </h2>
          <p className="text-xs text-[var(--text-sub)] leading-relaxed max-w-sm mx-auto">
            Restricted post: You don't have access to this page. If you think you should, contact your administrator.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#003C35] hover:bg-[#0B5247] text-white text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Authorized Records</span>
          </button>
        </div>

        <p className="text-[10px] font-mono-ref text-[var(--text-sub)] opacity-70">
          Covenant Shield IDOR Enforcement Gateway • Cross-Tenant Access Blocked
        </p>
      </div>
    </div>
  );
};
