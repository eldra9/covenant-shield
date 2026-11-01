/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClientSitesPage:
 * Authorized Sites Registry:
 * - Grid of CertificateCards with foil double hairline, corner seal, and 3D pointer lerp tilt
 * - Clicking a card opens the SiteDetailDrawer (spring 320ms) with coverage hours, supervisor contact, and 7-day ribbon
 * - Search by site name, code, or city
 * - Empty state with Guilloche rosette when no sites match
 */

import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Shield, Plus, AlertCircle, Trash2, Loader2, MapPin } from 'lucide-react';
import { Site, ClientOrganization } from '@/src/types/clientPortal';
import { clientPortalApi } from '@/src/api/clientPortalApi';
import { CertificateCard } from '@/src/components/luxury/CertificateCard';
import { SiteDetailDrawer } from '../components/SiteDetailDrawer';
import { GuillocheSeal } from '@/src/components/luxury/GuillocheSeal';

interface ClientSitesPageProps {
  client: ClientOrganization;
  onSelectSite?: (id: string) => void;
  onNewRequest: () => void;
}

export const ClientSitesPage: React.FC<ClientSitesPageProps> = ({
  client,
  onSelectSite,
  onNewRequest,
}) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDrawerSite, setSelectedDrawerSite] = useState<Site | null>(null);

  // Add site form state
  const [showAddSite, setShowAddSite] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteAddress, setNewSiteAddress] = useState('');
  const [newSiteCity, setNewSiteCity] = useState('');
  const [addingSite, setAddingSite] = useState(false);
  const [siteError, setSiteError] = useState<string | null>(null);
  const [addSiteError, setAddSiteError] = useState<string | null>(null);

  const loadSites = async () => {
    setLoading(true);
    try {
      const list = await clientPortalApi.getSites();
      setSites(list);
    } catch (err) {
      console.error('Failed to load sites', err);
      setSiteError('Unable to load sites registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, [client.id]);

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteAddress.trim() || !newSiteCity.trim()) return;
    setAddingSite(true);
    setAddSiteError(null);
    try {
      const added = await clientPortalApi.addSite({
        name: newSiteName.trim(),
        address: newSiteAddress.trim(),
        city: newSiteCity.trim(),
      });
      setSites(prev => [...prev, added]);
      setNewSiteName('');
      setNewSiteAddress('');
      setNewSiteCity('');
      setShowAddSite(false);
    } catch (err: any) {
      setAddSiteError(err.message || 'Failed to add site.');
    } finally {
      setAddingSite(false);
    }
  };

  const filteredSites = sites.filter(s => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--surface-border)]">
        <div className="space-y-1">
          <span className="text-[10px] font-mono-ref uppercase tracking-widest text-[#A47F2E]">
            Secured Infrastructure Register
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
            Authorized Service Sites
          </h1>
          <p className="text-xs text-[var(--text-sub)]">
            Commercial and industrial facilities secured under {client.name}'s service contract.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddSite(!showAddSite)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--surface-card)] hover:bg-[var(--emerald-50)] text-[#003C35] dark:text-[#C9A04A] border border-[var(--surface-border)] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Site</span>
          </button>
        </div>
      </div>

      {/* Add New Site Drawer / Form */}
      {showAddSite && (
        <form onSubmit={handleAddSite} className="p-5 bg-[var(--surface-card)] rounded-xl border border-[var(--surface-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--surface-border)]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C9A04A]" />
              <h3 className="text-sm font-bold text-[var(--text-main)]">Register New Secured Installation</h3>
            </div>
            <span className="text-[11px] font-mono-ref text-[var(--text-sub)]">Direct Facility Intake</span>
          </div>

          {addSiteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{addSiteError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-main)] mb-1">Facility / Site Name *</label>
              <input
                type="text"
                value={newSiteName}
                onChange={e => setNewSiteName(e.target.value)}
                placeholder="e.g. Westlands Corporate Complex"
                className="w-full px-3 py-2 bg-[var(--surface-bg)] border border-[var(--surface-border)] rounded-lg text-xs text-[var(--text-main)] focus:outline-none focus:border-[#003C35]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-main)] mb-1">Physical Street Address *</label>
              <input
                type="text"
                value={newSiteAddress}
                onChange={e => setNewSiteAddress(e.target.value)}
                placeholder="e.g. Chiromo Road, Westlands"
                className="w-full px-3 py-2 bg-[var(--surface-bg)] border border-[var(--surface-border)] rounded-lg text-xs text-[var(--text-main)] focus:outline-none focus:border-[#003C35]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-main)] mb-1">City / County *</label>
              <input
                type="text"
                value={newSiteCity}
                onChange={e => setNewSiteCity(e.target.value)}
                placeholder="e.g. Nairobi"
                className="w-full px-3 py-2 bg-[var(--surface-bg)] border border-[var(--surface-border)] rounded-lg text-xs text-[var(--text-main)] focus:outline-none focus:border-[#003C35]"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--surface-border)]">
            <button
              type="button"
              onClick={() => { setShowAddSite(false); setAddSiteError(null); }}
              className="px-4 py-2 text-xs font-medium text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingSite}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#003C35] hover:bg-[#0B5247] rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {addingSite ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Installation</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[var(--surface-card)] rounded-xl border border-[var(--surface-border)] p-3.5 flex items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sub)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by installation name, site code, or address..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--surface-bg)] border border-[var(--surface-border)] rounded-lg text-[var(--text-main)] focus:outline-none focus:border-[#003C35]"
          />
        </div>

        <span className="text-xs font-mono-ref text-[var(--text-sub)] hidden sm:block">
          Showing {filteredSites.length} of {sites.length} posts
        </span>
      </div>

      {/* Sites Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-64 rounded-xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      ) : filteredSites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <CertificateCard
              key={site.id}
              site={site}
              onClick={() => {
                setSelectedDrawerSite(site);
                if (onSelectSite) onSelectSite(site.id);
              }}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center space-y-4 max-w-md mx-auto">
          <div className="flex justify-center opacity-60">
            <GuillocheSeal size={64} theme="auto" showCenterEmblem={true} />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-base font-semibold text-[var(--text-main)]">
              No Authorized Installations Found
            </h3>
            <p className="text-xs text-[var(--text-sub)]">
              No active facilities match your query under this client account.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddSite(true)}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--emerald-50)] text-[#003C35] dark:text-[#C9A04A] border border-[var(--surface-border)] hover:bg-[#003C35] hover:text-white transition-colors cursor-pointer"
          >
            Add First Site
          </button>
        </div>
      )}

      {/* Slide-out Site Detail Drawer (Spring 320ms) */}
      <SiteDetailDrawer
        site={selectedDrawerSite}
        isOpen={selectedDrawerSite !== null}
        onClose={() => setSelectedDrawerSite(null)}
      />
    </div>
  );
};
