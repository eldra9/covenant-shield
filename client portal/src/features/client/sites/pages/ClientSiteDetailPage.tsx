/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Shield,
  Users,
  PhoneCall,
  Clock,
  Compass,
  FileText,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Site } from '@/src/types/clientPortal';
import { ClientPageHeader } from '@/src/components/client/ClientPageHeader';
import { ClientStatusBadge } from '@/src/components/client/ClientStatusBadge';
import { clientSitesApi } from '../api/clientSitesApi';
import { formatEAT } from '@/src/api/clientPortalApi';

interface ClientSiteDetailPageProps {
  siteId: string;
  onBack: () => void;
  onRequestForSite: (siteId: string) => void;
  onReportIncident: (siteId: string) => void;
}

export const ClientSiteDetailPage: React.FC<ClientSiteDetailPageProps> = ({
  siteId,
  onBack,
  onRequestForSite,
  onReportIncident,
}) => {
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await clientSitesApi.getSiteById(siteId);
        if (isMounted) setSite(res);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load site');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [siteId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-stone-200 rounded w-1/4"></div>
        <div className="h-64 bg-stone-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-stone-200 rounded-xl"></div>
          <div className="h-48 bg-stone-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-8 text-center max-w-lg mx-auto">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-rose-900">Access Restricted</h3>
        <p className="text-xs text-rose-700 mt-1">{error}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Return to Sites Overview
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientPageHeader
        breadcrumbs={[
          { label: 'Authorized Sites', onClick: onBack },
          { label: site.code, active: true },
        ]}
        title={site.name}
        description={`Authorized Facility Code: ${site.code} · ${site.locality}, ${site.county}`}
        action={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onReportIncident(site.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Report Site Query</span>
            </button>
            <button
              onClick={() => onRequestForSite(site.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#003C35] hover:bg-[#002b26] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#C9A04A]" />
              <span>Request Additional Posts</span>
            </button>
          </div>
        }
      />

      {/* Hero Banner with Site Image */}
      <div className="bg-[#092824] rounded-2xl overflow-hidden border border-stone-200 shadow-xs relative">
        <div className="h-64 sm:h-72 w-full relative">
          {site.imageUrl ? (
            <img
              src={site.imageUrl}
              alt={site.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#092824] to-[#003C35] flex items-center justify-center p-8">
              <Shield className="w-16 h-16 text-[#C9A04A]/60" />
            </div>
          )}
          {/* Scrim Overlay for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold bg-[#C9A04A] text-[#092824] px-2 py-0.5 rounded">
                {site.code}
              </span>
              <ClientStatusBadge status={site.operationalStatus} />
              <span className="text-xs text-white/80 font-mono flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                <span>{site.siteCoordinates}</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {site.name}
            </h2>
            <p className="text-xs text-stone-200 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C9A04A]" />
              <span>{site.address}, {site.locality}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Authorized Operational Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Approved Service Coverage */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#092824] uppercase tracking-wider pb-3 border-b border-stone-100">
            <Shield className="w-4 h-4 text-[#003C35]" />
            <span>Authorized Protection Scope</span>
          </div>
          <div className="mt-3 text-xs text-stone-700 leading-relaxed">
            {site.serviceType}
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">Contract Posts:</span>
            <span className="font-bold font-mono text-[#003C35]">
              {site.guardPostsApprovedCount} Manning Stations
            </span>
          </div>
        </div>

        {/* Supervision & Duty Command */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#092824] uppercase tracking-wider pb-3 border-b border-stone-100">
            <Users className="w-4 h-4 text-[#003C35]" />
            <span>Operational Command</span>
          </div>
          <div className="mt-3 space-y-2 text-xs text-stone-700">
            <div>
              <span className="text-stone-400 block text-[11px]">Duty Supervisor:</span>
              <span className="font-semibold text-stone-900">{site.supervisorOnDuty}</span>
            </div>
            <div className="pt-2 border-t border-stone-100">
              <span className="text-stone-400 block text-[11px]">Authorized Escalation Desk:</span>
              <span className="font-medium text-stone-900">{site.escalationContact}</span>
            </div>
          </div>
        </div>

        {/* 24/7 Control Room & Incident Hotline */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#092824] uppercase tracking-wider pb-3 border-b border-stone-100">
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>Emergency Response</span>
            </div>
            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              Immediate armed response dispatch & central control room monitoring for this site.
            </p>
          </div>
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider block">
              24/7 Hotline
            </span>
            <span className="font-mono text-sm font-bold text-rose-900">
              {site.controlRoomHotline}
            </span>
          </div>
        </div>
      </div>

      {/* Assigned Security Personnel Roster with Full Details */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#003C35]/10 text-[#003C35]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#092824]">
                Assigned Security Guards &amp; Deployment Roster
              </h3>
              <p className="text-xs text-stone-500">
                Authorized tactical officers deployed at this installation under active post orders.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg border border-stone-200">
            {site.assignedGuards?.length || site.guardPostsApprovedCount} Officers On Post
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {site.assignedGuards && site.assignedGuards.length > 0 ? (
            site.assignedGuards.map((guard) => (
              <div
                key={guard.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-[#003C35]/40 hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{guard.name}</h4>
                    <span className="text-[11px] font-medium text-[#A47F2E]">{guard.rank}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    guard.status === 'On Duty'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {guard.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 text-[11px]">Badge Number:</span>
                    <span className="font-mono font-bold text-stone-800">{guard.badgeNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 text-[11px]">PSRA Registration:</span>
                    <span className="font-mono text-stone-700">{guard.psraNumber || 'PSRA-VERIFIED'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 text-[11px]">Shift Assignment:</span>
                    <span className="font-medium text-stone-800">{guard.shift}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 text-[11px]">Post Station:</span>
                    <span className="font-medium text-stone-800 truncate max-w-[180px]">{guard.stationPost || 'Access Control Barrier'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-400 text-[11px]">Direct Phone:</span>
                    <a href={`tel:${guard.phone}`} className="font-mono font-semibold text-[#003C35] hover:underline">
                      {guard.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-stone-400">
              No guard personnel records currently assigned to this installation.
            </div>
          )}
        </div>
      </div>

      {/* Client-Approved Operational Shift & Sweep Logbook */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-[#092824]">
              Recent Service Updates & Verified Sweeps
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Client-visible shift handovers and electronic access synchronization records
            </p>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            {site.clientSafeLogs.length} updates logged
          </span>
        </div>

        {site.clientSafeLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500">
            No recent operational updates published for this site.
          </div>
        ) : (
          <div className="divide-y divide-stone-100 mt-2">
            {site.clientSafeLogs.map(log => (
              <div key={log.id} className="py-4 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-900">{log.title}</span>
                    <span className="text-[11px] font-mono text-stone-500">
                      {formatEAT(log.timestamp)}
                    </span>
                  </div>
                  <span className="inline-block text-[10px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded mt-1">
                    {log.category}
                  </span>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {log.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
