/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClientBreadcrumbs, BreadcrumbItem } from './ClientBreadcrumbs';

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
          <div className="mb-1.5">
            <ClientBreadcrumbs items={breadcrumbs} />
          </div>
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
