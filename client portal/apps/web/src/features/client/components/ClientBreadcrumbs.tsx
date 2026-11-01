/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Accessible, semantic breadcrumb navigation component for Covenant Shield Client Portal.
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface ClientBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const ClientBreadcrumbs: React.FC<ClientBreadcrumbsProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs text-stone-500 ${className}`}>
      <ol className="flex items-center gap-1.5 list-none p-0 m-0 flex-wrap">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="inline-flex items-center gap-1.5">
              {idx > 0 && (
                <ChevronRight className="w-3 h-3 text-stone-300 shrink-0" aria-hidden="true" />
              )}
              {item.onClick && !isLast ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-[#003C35] hover:underline transition-colors font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003C35] rounded-xs"
                >
                  {item.label}
                </button>
              ) : (
                <span
                  className={item.active || isLast ? 'text-stone-900 font-semibold truncate max-w-[200px]' : 'text-stone-500'}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
