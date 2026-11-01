import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck,
  ShieldAlert,
  Send,
  Eye,
  CalendarCheck,
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = status.toLowerCase();

  let label = status.replace(/_/g, ' ');
  let colorStyles = 'text-slate-400 bg-slate-800/60 border-slate-700/60';
  let IconComponent = Clock;

  if (['on_time', 'active', 'accepted', 'contract_active', 'closed', 'completed'].includes(norm)) {
    colorStyles = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
    IconComponent = CheckCircle2;
    if (norm === 'contract_active') label = 'Contract Active';
    if (norm === 'on_time') label = 'On Time';
  } else if (['under_review', 'in_progress', 'scheduled'].includes(norm)) {
    colorStyles = 'text-sky-400 bg-sky-950/40 border-sky-800/40';
    IconComponent = Eye;
    if (norm === 'under_review') label = 'Under Review';
    if (norm === 'in_progress') label = 'In Progress';
  } else if (['site_assessment_scheduled', 'assigned'].includes(norm)) {
    colorStyles = 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40';
    IconComponent = CalendarCheck;
    if (norm === 'site_assessment_scheduled') label = 'Assessment Booked';
  } else if (['quotation_sent'].includes(norm)) {
    colorStyles = 'text-amber-300 bg-amber-950/40 border-amber-800/40';
    IconComponent = Send;
    label = 'Quotation Sent';
  } else if (['late', 'resolution_proposed', 'pending'].includes(norm)) {
    colorStyles = 'text-amber-400 bg-amber-950/40 border-amber-800/40';
    IconComponent = AlertTriangle;
    if (norm === 'resolution_proposed') label = 'Resolution Proposed';
  } else if (['absent', 'rejected', 'cancelled', 'critical', 'high'].includes(norm)) {
    colorStyles = 'text-rose-400 bg-rose-950/40 border-rose-800/40';
    IconComponent = ShieldAlert;
    if (norm === 'rejected') label = 'Rejected';
    if (norm === 'cancelled') label = 'Cancelled';
  } else if (['corrected'].includes(norm)) {
    colorStyles = 'text-teal-400 bg-teal-950/40 border-teal-800/40';
    IconComponent = FileCheck;
    label = 'Corrected (Audited)';
  } else if (['incomplete'].includes(norm)) {
    colorStyles = 'text-orange-400 bg-orange-950/40 border-orange-800/40';
    IconComponent = AlertTriangle;
  }

  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded border tabular-nums capitalize whitespace-nowrap shrink-0 ${colorStyles} ${sizeClass}`}
    >
      <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
