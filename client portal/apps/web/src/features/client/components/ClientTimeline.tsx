/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unified Chronological Progress Timeline for Client Requests and Case Updates.
 */

import React from 'react';
import { Clock } from 'lucide-react';
import { formatEAT } from '@/src/api/clientPortalApi';
import { ClientStatusBadge } from '@/src/components/client/ClientStatusBadge';

export interface TimelineEntry {
  id: string;
  timestamp: string;
  status: string;
  title: string;
  description: string;
  actorRole?: string;
}

interface ClientTimelineProps {
  entries: TimelineEntry[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ClientTimeline: React.FC<ClientTimelineProps> = ({
  entries,
  title = 'Chronological Progress History',
  subtitle = 'Verified operational milestones published by Covenant Shield',
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-stone-200 p-6 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#092824]">{title}</h3>
          {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono shrink-0">
          <Clock className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
          <span>East Africa Time (EAT)</span>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-stone-500 py-6 text-center">
          No progress events recorded yet.
        </p>
      ) : (
        <ol className="mt-6 relative pl-6 border-l-2 border-stone-200 space-y-6 list-none m-0">
          {entries.map((entry, idx) => (
            <li key={entry.id || idx} className="relative group">
              {/* Timeline indicator node */}
              <div
                className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-[#003C35] flex items-center justify-center"
                aria-hidden="true"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#003C35]" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-stone-900">{entry.title}</span>
                  <ClientStatusBadge status={entry.status} size="sm" />
                </div>
                <time
                  dateTime={entry.timestamp}
                  className="text-[11px] font-mono text-stone-500 tabular-nums shrink-0"
                >
                  {formatEAT(entry.timestamp)}
                </time>
              </div>

              <p className="text-xs text-stone-700 mt-2 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                {entry.description}
              </p>

              {entry.actorRole && (
                <div className="mt-1 text-[10px] text-stone-400 font-medium">
                  Verified by: <span className="text-stone-600 font-semibold">{entry.actorRole}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
