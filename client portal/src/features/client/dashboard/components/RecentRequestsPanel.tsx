/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileText, ArrowRight, AlertCircle } from 'lucide-react';
import { ServiceRequest } from '@/src/types/clientPortal';
import { ClientStatusBadge } from '@/src/components/client/ClientStatusBadge';
import { formatEAT } from '@/src/api/clientPortalApi';

interface RecentRequestsPanelProps {
  requests: ServiceRequest[];
  onSelectRequest: (id: string) => void;
  onViewAll: () => void;
  onNewRequest: () => void;
}

export const RecentRequestsPanel: React.FC<RecentRequestsPanelProps> = ({
  requests,
  onSelectRequest,
  onViewAll,
  onNewRequest,
}) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
      <div className="p-5 border-b border-stone-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#092824]">Recent Service Requests</h2>
          <p className="text-xs text-stone-500 mt-0.5">Track deployment, quotations, and active details</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#003C35] hover:text-[#092824] inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400 mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-stone-700">No Service Requests Active</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            You do not currently have any active service requests or escort orders logged for your account.
          </p>
          <button
            onClick={onNewRequest}
            className="mt-4 px-3.5 py-1.5 bg-[#003C35] hover:bg-[#002b26] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Submit Service Request
          </button>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {requests.map(req => (
            <div
              key={req.id}
              onClick={() => onSelectRequest(req.id)}
              className="p-4 hover:bg-stone-50 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#092824]">
                    {req.reference}
                  </span>
                  <ClientStatusBadge status={req.status} />
                  {req.requiresClientAction && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      Action Needed
                    </span>
                  )}
                </div>

                <div className="text-xs font-medium text-stone-800 mt-1 truncate">
                  {req.serviceType}
                </div>

                <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                  <span className="truncate">{req.siteName}</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">{formatEAT(req.createdAt)}</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {req.quotation && (
                  <span className="text-xs font-semibold text-stone-700 font-mono">
                    KES {req.quotation.amountKes.toLocaleString()}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
