/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface ClientPageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const ClientPageHeader: React.FC<ClientPageHeaderProps> = ({
  breadcrumbs,
  title,
  description,
  action,
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-stone-200">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5" aria-label="Breadcrumb">
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-stone-300">/</span>}
                {bc.onClick ? (
                  <button
                    onClick={bc.onClick}
                    className="hover:text-[#003C35] transition-colors font-medium cursor-pointer"
                  >
                    {bc.label}
                  </button>
                ) : (
                  <span className={bc.active ? 'text-stone-900 font-semibold' : ''}>{bc.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-[#092824]">{title}</h1>
        {description && (
          <p className="text-sm text-stone-600 mt-0.5 max-w-3xl">{description}</p>
        )}
      </div>

      {action && <div className="shrink-0 flex items-center gap-3">{action}</div>}
    </div>
  );
};
