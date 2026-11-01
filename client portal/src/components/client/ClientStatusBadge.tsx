/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type StatusVariant =
  | 'Submitted'
  | 'Under Assessment'
  | 'Quotation Issued'
  | 'Approved'
  | 'Mobilizing'
  | 'Active'
  | 'Completed'
  | 'Cancelled'
  | 'Open'
  | 'In Review'
  | 'Escalated'
  | 'Resolved'
  | 'Closed'
  | 'Active Guarded'
  | '24/7 Monitored'
  | 'Access Control Only'
  | 'Patrol Managed'
  | 'Urgent'
  | 'Emergency Priority'
  | 'Standard'
  | 'Tier-1 Enterprise'
  | 'Tier-2 Commercial'
  | 'Standard Managed';

interface ClientStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const ClientStatusBadge: React.FC<ClientStatusBadgeProps> = ({ status, size = 'sm' }) => {
  let styleClasses = 'bg-stone-100 text-stone-700 border-stone-200';

  switch (status) {
    case 'Active':
    case 'Active Guarded':
    case 'Approved':
    case 'Resolved':
      styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case 'Quotation Issued':
    case 'Mobilizing':
    case 'In Review':
    case 'Under Assessment':
    case 'Urgent':
      styleClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'Emergency Priority':
    case 'Escalated':
      styleClasses = 'bg-rose-50 text-rose-800 border-rose-200';
      break;
    case 'Completed':
    case '24/7 Monitored':
      styleClasses = 'bg-[#003C35]/10 text-[#003C35] border-[#003C35]/20';
      break;
    case 'Cancelled':
    case 'Closed':
      styleClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    case 'Tier-1 Enterprise':
      styleClasses = 'bg-[#C9A04A]/15 text-[#634913] border-[#C9A04A]/40 font-semibold';
      break;
    default:
      styleClasses = 'bg-stone-50 text-stone-700 border-stone-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md tracking-tight ${sizeClasses} ${styleClasses}`}
    >
      {status}
    </span>
  );
};
