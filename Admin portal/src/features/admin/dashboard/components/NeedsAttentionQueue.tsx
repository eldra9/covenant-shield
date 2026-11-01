import React from 'react';
import { ShieldAlert, ClockAlert, ClipboardList, ArrowRight, ShieldCheck } from 'lucide-react';
import { GuillocheSeal } from '@/components/admin/GuillocheSeal';
import { AdminTab } from '@/components/admin/AdminSidebar';
import { formatEATDate } from '@/utils/date';

export interface AttentionItem {
  id: string;
  category: 'case' | 'attendance' | 'request';
  reference: string;
  reason: string;
  severity: 'danger' | 'warning' | 'info';
  age: string;
  actionLabel: string;
  tab: AdminTab;
  recordId: string;
}

interface NeedsAttentionQueueProps {
  items: AttentionItem[];
  onAction: (tab: AdminTab, recordId: string) => void;
}

export const NeedsAttentionQueue: React.FC<NeedsAttentionQueueProps> = ({
  items,
  onAction,
}) => {
  if (items.length === 0) {
    return (
      <div className="p-8 sm:p-10 text-center bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl emboss-card flex flex-col items-center justify-center space-y-3">
        <GuillocheSeal size={96} theme="dark" />
        <div className="space-y-1 max-w-md">
          <h3 className="text-base font-display font-bold text-[#F4F6F4]">
            Nothing needs attention.
          </h3>
          <p className="text-xs text-[#A0B2AC]">
            All security sites are manned, incident SLAs are satisfied, and inbound service requests are assigned.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D322D] border border-[#C9A04A]/28 rounded-xl overflow-hidden emboss-card">
      <div className="px-5 py-3.5 border-b border-[#003C35] bg-[#071F1C] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A12B2B] animate-pulse" />
          <h3 className="text-sm font-bold text-[#F4F6F4] font-sans tracking-wide">
            Priority Attention Queue
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#A12B2B]/20 text-[#FBE9E9] border border-[#A12B2B]/40">
            {items.length} {items.length === 1 ? 'Action Required' : 'Actions Required'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#A0B2AC]">Real-time operational triage</span>
      </div>

      <div className="divide-y divide-[#003C35]">
        {items.map((item, idx) => {
          let dotColor = 'bg-[#A12B2B]';
          if (item.severity === 'warning') dotColor = 'bg-[#C9A04A]';
          if (item.severity === 'info') dotColor = 'bg-[#1D4E89]';

          return (
            <div
              key={item.id}
              className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#123D37]/50 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1 sm:mt-0 ${dotColor}`} />
                <span className="font-mono text-xs font-semibold text-[#E6CB8A] shrink-0">
                  {item.reference}
                </span>
                <span className="text-xs text-[#F4F6F4] truncate font-medium">
                  {item.reason}
                </span>
                <span className="text-[10px] font-mono text-[#52625D] shrink-0 hidden md:inline-block">
                  · Age: {item.age}
                </span>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <span className="text-[10px] font-mono text-[#A0B2AC] md:hidden">
                  {item.age}
                </span>
                <button
                  onClick={() => onAction(item.tab, item.recordId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#092824] bg-[#C9A04A] hover:bg-[#E6CB8A] rounded transition-colors"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
