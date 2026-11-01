/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, MapPin, Phone, Users, ArrowRight } from 'lucide-react';
import { Site } from '@/src/types/clientPortal';
import { ClientStatusBadge } from '@/src/components/client/ClientStatusBadge';

interface ClientSiteCardProps {
  site: Site;
  onSelect: (id: string) => void;
}

export const ClientSiteCard: React.FC<ClientSiteCardProps> = ({ site, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(site.id)}
      className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-stone-400 hover:shadow-md transition-all cursor-pointer flex flex-col group"
    >
      {/* Site Header Image or Styled Mesh Fallback */}
      <div className="h-44 bg-[#092824] relative overflow-hidden">
        {site.imageUrl ? (
          <img
            src={site.imageUrl}
            alt={site.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#092824] to-[#003C35] p-6 text-center">
            <div>
              <Shield className="w-8 h-8 text-[#C9A04A] mx-auto mb-2 opacity-80" />
              <div className="text-xs font-bold text-white tracking-wide">{site.code}</div>
              <div className="text-[11px] text-stone-300">{site.locality}</div>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="font-mono text-[11px] font-bold bg-[#092824]/85 text-white px-2 py-0.5 rounded backdrop-blur-xs">
            {site.code}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <ClientStatusBadge status={site.operationalStatus} />
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#092824] group-hover:text-[#003C35] transition-colors line-clamp-1">
            {site.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
            <span className="truncate">{site.address}, {site.county}</span>
          </div>

          <div className="mt-3 pt-3 border-t border-stone-100 space-y-2 text-xs">
            <div className="flex items-center justify-between text-stone-600">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                <span>Authorized Guard Posts:</span>
              </span>
              <span className="font-bold text-[#092824] font-mono tabular-nums">
                {site.guardPostsApprovedCount} Posts Active
              </span>
            </div>

            <div className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed bg-stone-50 p-2 rounded border border-stone-100">
              <span className="font-semibold text-stone-700">Scope: </span>
              {site.serviceType}
            </div>
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-stone-500 truncate max-w-[190px]">
            <Phone className="w-3 h-3 text-[#003C35] shrink-0" />
            <span className="truncate text-[11px]">{site.escalationContact}</span>
          </div>
          <span className="inline-flex items-center gap-1 font-semibold text-[#003C35] group-hover:translate-x-0.5 transition-transform text-xs">
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
