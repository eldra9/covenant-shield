/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ClientSummaryCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'default' | 'accent' | 'warning' | 'alert';
  onClick?: () => void;
}

export const ClientSummaryCard: React.FC<ClientSummaryCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  let borderAccent = 'border-stone-200';
  let iconColor = 'text-stone-700 bg-stone-100';

  if (variant === 'accent') {
    iconColor = 'text-[#003C35] bg-[#003C35]/10';
  } else if (variant === 'warning') {
    iconColor = 'text-amber-800 bg-amber-100/60';
  } else if (variant === 'alert') {
    iconColor = 'text-rose-800 bg-rose-100/60';
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border ${borderAccent} p-5 transition-all shadow-xs ${
        onClick ? 'cursor-pointer hover:border-stone-400 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          {label}
        </span>
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-[#092824] font-mono tabular-nums">
          {value}
        </span>
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-stone-500 truncate">{subtext}</p>
      )}
    </div>
  );
};
