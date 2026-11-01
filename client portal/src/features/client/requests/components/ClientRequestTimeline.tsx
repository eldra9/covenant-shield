/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { RequestTimelineEvent } from '@/src/types/clientPortal';
import { formatEAT } from '@/src/api/clientPortalApi';
import { ClientStatusBadge } from '@/src/components/client/ClientStatusBadge';

interface ClientRequestTimelineProps {
  timeline: RequestTimelineEvent[];
}

export const ClientRequestTimeline: React.FC<ClientRequestTimelineProps> = ({ timeline }) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div>
          <h3 className="text-sm font-bold text-[#092824]">Operational Status History</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Verified status timeline published by Covenant Shield Operations
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>All timestamps in East Africa Time (EAT)</span>
        </div>
      </div>

      <div className="mt-6 relative pl-6 border-l-2 border-stone-200 space-y-6">
        {timeline.map((event, idx) => (
          <div key={event.id || idx} className="relative group">
            {/* Dot marker */}
            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#003C35] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#003C35]" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">{event.title}</span>
                <ClientStatusBadge status={event.status} size="sm" />
              </div>
              <span className="text-[11px] font-mono text-stone-500 tabular-nums">
                {formatEAT(event.timestamp)}
              </span>
            </div>

            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
              {event.clientVisibleNotes}
            </p>

            <div className="mt-1 text-[10px] text-stone-400 font-medium">
              Recorded by: <span className="text-stone-600">{event.actorRole}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
