/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  PlusCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { ServiceRequest, ClientOrganization, Site } from '@/src/types/clientPortal';
import { ClientPageHeader } from '@/src/components/client/ClientPageHeader';
import { ClientStatusBadge } from '@/src/components/client/ClientStatusBadge';
import { ClientRequestFilters } from '../components/ClientRequestFilters';
import { clientRequestsApi } from '../api/clientRequestsApi';
import { clientSitesApi } from '@/src/features/client/sites/api/clientSitesApi';
import { formatEAT, formatKES } from '@/src/api/clientPortalApi';

interface ClientRequestsPageProps {
  client: ClientOrganization;
  onSelectRequest: (id: string) => void;
  onRequestCreated?: () => void;
  onNewRequest?: () => void;
}

export const ClientRequestsPage: React.FC<ClientRequestsPageProps> = ({
  client,
  onSelectRequest,
  onRequestCreated,
  onNewRequest,
}) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Request Form State
  const [formSiteId, setFormSiteId] = useState('');
  const [formServiceType, setFormServiceType] = useState('Armed Static Guarding');
  const [formPriority, setFormPriority] = useState<ServiceRequest['priority']>('Standard');
  const [formStartDate, setFormStartDate] = useState('2026-11-15');
  const [formDescription, setFormDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqList, siteList] = await Promise.all([
        clientRequestsApi.getRequests(),
        clientSitesApi.getSites(),
      ]);
      setRequests(reqList);
      setSites(siteList);
      if (siteList.length > 0 && !formSiteId) {
        setFormSiteId(siteList[0].id);
      }
    } catch (err) {
      console.error('Failed to load requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [client.id]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSiteId || !formDescription.trim()) return;

    setSubmitting(true);
    try {
      const created = await clientRequestsApi.createRequest({
        siteId: formSiteId,
        serviceType: formServiceType,
        priority: formPriority,
        requestedStartDate: formStartDate,
        description: formDescription,
      });
      setIsModalOpen(false);
      setFormDescription('');
      await loadData();
      if (onRequestCreated) onRequestCreated();
      onSelectRequest(created.id);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchQ =
      r.reference.toLowerCase().includes(q) ||
      r.serviceType.toLowerCase().includes(q) ||
      r.siteName.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchQ && matchStatus;
  });

  return (
    <div className="space-y-6">
      <ClientPageHeader
        breadcrumbs={[{ label: 'Portal', active: false }, { label: 'Service Requests', active: true }]}
        title="Service Requests & Deployments"
        description="Submit, track, and approve security deployments, canine patrols, armed escort details, and access control installations."
        action={
          <button
            onClick={() => {
              if (onNewRequest) {
                onNewRequest();
              } else {
                setIsModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#003C35] hover:bg-[#002b26] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#C9A04A]" />
            <span>Commission Request</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <ClientRequestFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Requests Table / Cards */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-20 bg-stone-200 rounded-xl" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#003C35]/10 text-[#003C35] mx-auto flex items-center justify-center mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#092824]">No Service Requests on File</h3>
          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
            {client.name} has not logged any active security deployment requests or highway escorts yet.
          </p>
          <button
            onClick={() => {
              if (onNewRequest) {
                onNewRequest();
              } else {
                setIsModalOpen(true);
              }
            }}
            className="mt-6 px-4 py-2 bg-[#003C35] hover:bg-[#002b26] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Commission Request
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <AlertCircle className="w-6 h-6 text-stone-400 mx-auto mb-2" />
          <div className="text-xs font-bold text-stone-700">No requests match criteria</div>
          <p className="text-xs text-stone-500 mt-1">Try resetting your search query or status filter.</p>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('All');
            }}
            className="mt-3 text-xs text-[#003C35] font-semibold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs divide-y divide-stone-100">
          {filtered.map(req => (
            <div
              key={req.id}
              onClick={() => onSelectRequest(req.id)}
              className="p-5 hover:bg-stone-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#092824] bg-stone-100 px-2 py-0.5 rounded">
                    {req.reference}
                  </span>
                  <ClientStatusBadge status={req.status} />
                  <ClientStatusBadge status={req.priority} size="sm" />
                  {req.requiresClientAction && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3 text-amber-700" />
                      <span>Quotation Ready for Approval</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-stone-900 group-hover:text-[#003C35] transition-colors mt-2">
                  {req.serviceType}
                </h4>

                <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">
                  {req.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mt-2">
                  <span>Site: <strong className="text-stone-700">{req.siteName}</strong></span>
                  <span>·</span>
                  <span>Required Date: <strong className="text-stone-700 font-mono">{req.requestedStartDate}</strong></span>
                  <span>·</span>
                  <span>Submitted: <span className="font-mono">{formatEAT(req.createdAt)}</span></span>
                </div>
              </div>

              {/* Quotation & Chevron */}
              <div className="shrink-0 flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                {req.quotation ? (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                      Quotation
                    </span>
                    <span className="text-sm font-bold text-[#092824] font-mono">
                      {formatKES(req.quotation.amountKes)}
                    </span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block">Assessment</span>
                    <span className="text-xs text-stone-500 font-medium">Pending Quote</span>
                  </div>
                )}
                <div className="p-2 rounded-lg bg-stone-50 group-hover:bg-[#003C35]/10 text-stone-400 group-hover:text-[#003C35] transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Service Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold text-[#092824]">Submit New Service Request</h3>
            <p className="text-xs text-stone-500 mt-1">
              Initiate operations assessment for static guarding, canine patrol, or armed transit escort.
            </p>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Target Service Site</label>
                {sites.length > 0 ? (
                  <select
                    value={formSiteId}
                    onChange={e => setFormSiteId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#003C35]"
                    required
                  >
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) - {s.locality}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-amber-800 bg-amber-50 p-2 rounded text-[11px]">
                    No authorized sites yet. Request will be logged under general account assessment.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Service Type & Scope</label>
                <select
                  value={formServiceType}
                  onChange={e => setFormServiceType(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#003C35]"
                >
                  <option value="Armed Static Guarding">Armed Static Guarding</option>
                  <option value="K9 Canine Protection & Patrol Squad">K9 Canine Protection & Patrol Squad</option>
                  <option value="High-Value Armed Transit Escort">High-Value Armed Transit Escort</option>
                  <option value="Biometric Access Control Maintenance">Biometric Access Control Maintenance</option>
                  <option value="VIP Close Protection Detail">VIP Close Protection Detail</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Priority Level</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#003C35]"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency Priority">Emergency Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Required Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#003C35]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Operational Requirements & Details
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Specify post locations, shift hours, cargo details, or special directives..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#003C35]"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#003C35] hover:bg-[#002b26] text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Register Service Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
