/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock } from 'lucide-react';
import { CaseTimelineItem } from '@/src/types/clientPortal';
import { formatEAT } from '@/src/api/clientPortalApi';
import { ClientStatusBadge } from '@/src/components/client/ClientStatusBadge';

interface ClientCaseTimelineProps {
  timeline: CaseTimelineItem[];
}

export const ClientCaseTimeline: React.FC<ClientCaseTimelineProps> = ({ timeline }) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div>
          <h3 className="text-sm font-bold text-[#092824]">Case Resolution Timeline</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Operational milestones and investigation updates
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>EAT</span>
        </div>
      </div>

      <div className="mt-5 relative pl-6 border-l-2 border-stone-200 space-y-5">
        {timeline.map((item, idx) => (
          <div key={item.id || idx} className="relative">
            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#003C35] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#003C35]" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-stone-900">{item.title}</span>
              <span className="text-[11px] font-mono text-stone-500 tabular-nums">
                {formatEAT(item.timestamp)}
              </span>
            </div>

            <p className="text-xs text-stone-600 mt-1">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
