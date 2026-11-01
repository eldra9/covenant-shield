/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  PlusCircle,
  Search,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { ClientCase, ClientOrganization, Site } from '@/src/types/clientPortal';
import { ClientPageHeader } from '@/src/components/client/ClientPageHeader';
import { ClientStatusBadge } from '@/src/components/client/ClientStatusBadge';
import { clientCasesApi } from '../api/clientCasesApi';
import { clientSitesApi } from '@/src/features/client/sites/api/clientSitesApi';
import { formatEAT } from '@/src/api/clientPortalApi';

interface ClientCasesPageProps {
  client: ClientOrganization;
  onSelectCase: (id: string) => void;
  onCaseCreated?: () => void;
}

export const ClientCasesPage: React.FC<ClientCasesPageProps> = ({
  client,
  onSelectCase,
  onCaseCreated,
}) => {
  const [cases, setCases] = useState<ClientCase[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Case form state
  const [formSubject, setFormSubject] = useState('');
  const [formCategory, setFormCategory] = useState<ClientCase['category']>('Incident Inquiry');
  const [formPriority, setFormPriority] = useState<ClientCase['priority']>('Medium');
  const [formSiteId, setFormSiteId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [caseList, siteList] = await Promise.all([
        clientCasesApi.getCases(),
        clientSitesApi.getSites(),
      ]);
      setCases(caseList);
      setSites(siteList);
      if (siteList.length > 0 && !formSiteId) {
        setFormSiteId(siteList[0].id);
      }
    } catch (err) {
      console.error('Failed to load cases', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [client.id]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formDescription.trim()) return;

    setSubmitting(true);
    try {
      const created = await clientCasesApi.createCase({
        subject: formSubject,
        category: formCategory,
        priority: formPriority,
        siteId: formSiteId || undefined,
        description: formDescription,
      });
      setIsModalOpen(false);
      setFormSubject('');
      setFormDescription('');
      await loadData();
      if (onCaseCreated) onCaseCreated();
      onSelectCase(created.id);
    } catch (err: any) {
      alert(`Failed to create case: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = cases.filter(c => {
    const q = search.toLowerCase();
    const matchesQ =
      c.reference.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.siteName && c.siteName.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesQ && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <ClientPageHeader
        breadcrumbs={[{ label: 'Portal', active: false }, { label: 'Cases & Feedback', active: true }]}
        title="Client Cases, Inquiries & Feedback"
        description="Formal communication desk for incident verification, guard attendance queries, patrol timings, and invoice clarifications."
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#003C35] hover:bg-[#002b26] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#C9A04A]" />
            <span>Open Support Ticket</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ticket ref, category, or subject..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003C35] focus:bg-white text-stone-900"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Open', 'In Review', 'Resolved', 'Closed'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === filter
                  ? 'bg-[#003C35] text-white font-semibold shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Cases List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-20 bg-stone-200 rounded-xl" />
          ))}
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#003C35]/10 text-[#003C35] mx-auto flex items-center justify-center mb-4">
            <MessageSquareWarning className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#092824]">No Support Tickets Logged</h3>
          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
            There are currently no inquiries or incident reports registered for {client.name}.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 px-4 py-2 bg-[#003C35] hover:bg-[#002b26] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Open First Ticket
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <AlertCircle className="w-6 h-6 text-stone-400 mx-auto mb-2" />
          <div className="text-xs font-bold text-stone-700">No cases match filters</div>
          <p className="text-xs text-stone-500 mt-1">Try adjusting your query or status selection.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs divide-y divide-stone-100">
          {filtered.map(c => (
            <div
              key={c.id}
              onClick={() => onSelectCase(c.id)}
              className="p-5 hover:bg-stone-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#092824] bg-stone-100 px-2 py-0.5 rounded">
                    {c.reference}
                  </span>
                  <ClientStatusBadge status={c.status} />
                  <span className="text-xs font-semibold text-stone-600">
                    {c.category}
                  </span>
                  <ClientStatusBadge status={c.priority} size="sm" />
                </div>

                <h4 className="text-sm font-semibold text-stone-900 group-hover:text-[#003C35] transition-colors mt-2">
                  {c.subject}
                </h4>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mt-2">
                  {c.siteName && (
                    <span>Site: <strong className="text-stone-700">{c.siteName}</strong></span>
                  )}
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                    <span>{c.messages.length} message{c.messages.length === 1 ? '' : 's'}</span>
                  </span>
                  <span>·</span>
                  <span>Updated: <span className="font-mono">{formatEAT(c.updatedAt)}</span></span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <span className="text-xs font-semibold text-[#003C35] group-hover:underline">
                  Open Thread
                </span>
                <div className="p-2 rounded-lg bg-stone-50 group-hover:bg-[#003C35]/10 text-stone-400 group-hover:text-[#003C35] transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold text-[#092824]">Open Support Ticket or Inquiry</h3>
            <p className="text-xs text-stone-500 mt-1">
              Direct communication with your Operations Account Lead and Duty Desk.
            </p>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Subject / Summary</label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  placeholder="e.g. Guard uniform compliance query at Gate 4..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#003C35]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#003C35]"
                  >
                    <option value="Incident Inquiry">Incident Inquiry</option>
                    <option value="Guard Conduct">Guard Conduct</option>
                    <option value="Patrol Schedule">Patrol Schedule</option>
                    <option value="Billing & Invoice">Billing & Invoice</option>
                    <option value="Equipment & Access">Equipment & Access</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Urgency Priority</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#003C35]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {sites.length > 0 && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Related Site (Optional)
                  </label>
                  <select
                    value={formSiteId}
                    onChange={e => setFormSiteId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#003C35]"
                  >
                    <option value="">-- General Account / Not Site-Specific --</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Detailed Explanation
                </label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Include dates, guard names, gate numbers, or invoice references..."
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
                  {submitting ? 'Submitting...' : 'Register Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
