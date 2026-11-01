/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Reusable, accessible empty-state component for client portal lists and data views.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ClientEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export const ClientEmptyState: React.FC<ClientEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
      <div className="w-12 h-12 rounded-full bg-[#003C35]/10 text-[#003C35] mx-auto flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>

      <h3 className="text-base font-bold text-[#092824]">{title}</h3>

      <p className="text-xs text-stone-600 mt-2 leading-relaxed">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="w-full sm:w-auto px-4 py-2 bg-[#003C35] hover:bg-[#002b26] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003C35]"
            >
              {primaryAction.label}
            </button>
          )}

          {secondaryAction && (
            secondaryAction.href ? (
              <a
                href={secondaryAction.href}
                className="w-full sm:w-auto px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
              >
                {secondaryAction.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="w-full sm:w-auto px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};
