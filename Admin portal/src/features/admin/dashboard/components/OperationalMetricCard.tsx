import React from 'react';
import { LucideIcon } from 'lucide-react';
import { NumberRoll } from '@/motion';

interface OperationalMetricCardProps {
  label: string;
  value: number;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
  variant?: 'default' | 'warning' | 'alert' | 'success';
  onClick?: () => void;
  staggerIndex?: number;
}

export const OperationalMetricCard: React.FC<OperationalMetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  badge,
  variant = 'default',
  onClick,
  staggerIndex = 0,
}) => {
  let borderColor = 'border-[#C9A04A]/22';
  let iconBg = 'bg-[#071F1C] text-[#C9A04A] border border-[#003C35]';
  let valueColor = 'text-[#FFFFFF]';

  if (variant === 'warning') {
    borderColor = 'border-[#C9A04A]/40';
    iconBg = 'bg-[#071F1C] text-[#C9A04A] border border-[#C9A04A]/30';
    valueColor = 'text-[#E6CB8A]';
  } else if (variant === 'alert') {
    borderColor = 'border-[#A12B2B]/40';
    iconBg = 'bg-[#071F1C] text-[#A12B2B] border border-[#A12B2B]/30';
    valueColor = 'text-[#FBE9E9]';
  } else if (variant === 'success') {
    borderColor = 'border-[#1E6B45]/40';
    iconBg = 'bg-[#071F1C] text-[#1E6B45] border border-[#1E6B45]/30';
    valueColor = 'text-[#E7F3EC]';
  }

  return (
    <div
      onClick={onClick}
      className={`p-4 bg-[#0D322D] border rounded-xl transition-all duration-200 emboss-card relative group ${borderColor} ${
        onClick ? 'cursor-pointer hover:border-[#C9A04A]/60 hover:bg-[#123D37]' : ''
      }`}
      style={{
        animationDelay: `${staggerIndex * 60}ms`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-[#A0B2AC] truncate">{label}</span>
        <div className={`p-2 rounded-lg shrink-0 transition-transform group-hover:scale-105 ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className={`text-[32px] leading-tight font-semibold font-sans tracking-tight ${valueColor}`}>
          <NumberRoll value={value} />
        </div>
        {badge && (
          <span className="text-[10px] font-mono uppercase text-[#A0B2AC] bg-[#071F1C] px-1.5 py-0.5 rounded border border-[#003C35]">
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <div className="mt-1.5 text-[11px] text-[#A0B2AC] font-mono truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};
