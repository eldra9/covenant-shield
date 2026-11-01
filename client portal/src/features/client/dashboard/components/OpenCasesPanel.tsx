/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MessageSquareWarning, ArrowRight, MessageSquare } from 'lucide-react';
import { ClientCase } from '@/src/types/clientPortal';
import { ClientStatusBadge } from '@/src/components/client/ClientStatusBadge';
import { formatEAT } from '@/src/api/clientPortalApi';

interface OpenCasesPanelProps {
  cases: ClientCase[];
  onSelectCase: (id: string) => void;
  onViewAll: () => void;
  onNewCase: () => void;
}

export const OpenCasesPanel: React.FC<OpenCasesPanelProps> = ({
  cases,
  onSelectCase,
  onViewAll,
  onNewCase,
}) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
      <div className="p-5 border-b border-stone-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#092824]">Active Cases & Inquiries</h2>
          <p className="text-xs text-stone-500 mt-0.5">Complaints, operational queries, and escalation tickets</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#003C35] hover:text-[#092824] inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {cases.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400 mb-3">
            <MessageSquareWarning className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-stone-700">No Open Tickets</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            All cases and queries for your account are resolved. Have a question or operational incident to report?
          </p>
          <button
            onClick={onNewCase}
            className="mt-4 px-3.5 py-1.5 bg-[#003C35] hover:bg-[#002b26] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Open Support Ticket
          </button>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {cases.map(c => (
            <div
              key={c.id}
              onClick={() => onSelectCase(c.id)}
              className="p-4 hover:bg-stone-50 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#092824]">
                    {c.reference}
                  </span>
                  <ClientStatusBadge status={c.status} />
                  <span className="text-[11px] font-medium text-stone-500">
                    {c.category}
                  </span>
                </div>

                <div className="text-xs font-medium text-stone-800 mt-1 truncate">
                  {c.subject}
                </div>

                <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-stone-400" />
                    <span>{c.messages.length} message{c.messages.length === 1 ? '' : 's'}</span>
                  </span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">{formatEAT(c.updatedAt)}</span>
                </div>
              </div>

              <div className="shrink-0">
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
