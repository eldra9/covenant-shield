/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Lock,
  FileCheck,
  Shield,
  PhoneCall,
  Edit3,
  Calendar,
  AlertCircle,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { ClientOrganization, ClientUser } from '@/src/types/clientPortal';
import { ClientPageHeader } from '@/src/components/client/ClientPageHeader';
import { ClientStatusBadge } from '@/src/components/client/ClientStatusBadge';
import { ClientContactDetails } from '../components/ClientContactDetails';
import { clientProfileApi } from '../api/clientProfileApi';
import { formatEAT } from '@/src/api/clientPortalApi';

interface ClientProfilePageProps {
  client: ClientOrganization;
  user: ClientUser;
  onProfileUpdated?: () => void;
  onLogout?: () => void;
}

export const ClientProfilePage: React.FC<ClientProfilePageProps> = ({
  client,
  user,
  onProfileUpdated,
  onLogout,
}) => {
  const [currentUser, setCurrentUser] = useState<ClientUser>(user);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [requestedFields, setRequestedFields] = useState('');
  const [submittingChange, setSubmittingChange] = useState(false);
  const [changeSuccessMessage, setChangeSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleUpdateContact = async (updates: Partial<ClientUser>) => {
    const updated = await clientProfileApi.updatePersonalContact(updates);
    setCurrentUser(updated);
    if (onProfileUpdated) onProfileUpdated();
  };

  const handleCompanyChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeReason.trim() || !requestedFields.trim()) return;

    setSubmittingChange(true);
    try {
      const res = await clientProfileApi.submitCompanyChangeRequest(changeReason, requestedFields);
      setChangeSuccessMessage(res.message);
      setIsChangeModalOpen(false);
      setChangeReason('');
      setRequestedFields('');
      setTimeout(() => setChangeSuccessMessage(null), 5000);
      if (onProfileUpdated) onProfileUpdated();
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmittingChange(false);
    }
  };

  return (
    <div className="space-y-6">
      <ClientPageHeader
        breadcrumbs={[{ label: 'Portal', active: false }, { label: 'Company Profile', active: true }]}
        title="Organization Profile & Contacts"
        description="Review legal organization credentials, contract tier parameters, and maintain verified escalation contacts."
      />

      {changeSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-xs text-emerald-900 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{changeSuccessMessage}</span>
        </div>
      )}

      {/* Read-Only Company Information Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#003C35]/10 text-[#003C35]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#092824]">{client.legalName}</h3>
              <p className="text-xs text-stone-500">
                Official Company Records · Covenant Shield Managed Security Account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded font-mono flex items-center gap-1">
              <Lock className="w-3 h-3 text-stone-400" />
              <span>Read-Only Compliance Data</span>
            </span>
            <button
              onClick={() => setIsChangeModalOpen(true)}
              className="text-xs font-semibold text-[#003C35] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Request Detail Amendment</span>
            </button>
          </div>
        </div>

        {/* 6-Field Matrix */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-100">
            <span className="text-stone-400 block text-[11px]">Kenya Revenue Authority (KRA PIN)</span>
            <span className="font-bold text-stone-900 font-mono text-sm mt-0.5 block">
              {client.kraPin}
            </span>
          </div>

          <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-100">
            <span className="text-stone-400 block text-[11px]">Business Registration Number</span>
            <span className="font-bold text-stone-900 font-mono text-sm mt-0.5 block">
              {client.registrationNumber}
            </span>
          </div>

          <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-100">
            <span className="text-stone-400 block text-[11px]">Industry Sector</span>
            <span className="font-semibold text-stone-900 mt-0.5 block">
              {client.industry}
            </span>
          </div>

          <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-100">
            <span className="text-stone-400 block text-[11px]">Contract SLA Tier</span>
            <div className="mt-1">
              <ClientStatusBadge status={client.contractTier} />
            </div>
          </div>

          <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-100">
            <span className="text-stone-400 block text-[11px]">Contract Inception Date</span>
            <span className="font-medium text-stone-900 font-mono mt-0.5 block">
              {formatEAT(client.contractStartDate)}
            </span>
          </div>

          <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-100">
            <span className="text-stone-400 block text-[11px]">Contract Scheduled Renewal</span>
            <span className="font-medium text-stone-900 font-mono mt-0.5 block">
              {formatEAT(client.contractRenewalDate)}
            </span>
          </div>
        </div>

        {/* Dedicated Operations Lead Strip */}
        <div className="mt-5 p-4 bg-stone-50 rounded-lg border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#003C35] shrink-0" />
            <div>
              <span className="text-stone-500 font-medium">Assigned Operations Account Lead:</span>
              <div className="font-bold text-[#092824]">{client.operationsManager.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-stone-600 font-mono">
            <span>Direct: {client.operationsManager.phone}</span>
            <span>·</span>
            <span>{client.operationsManager.email}</span>
          </div>
        </div>
      </div>

      {/* Editable Contact Details Component */}
      <ClientContactDetails
        user={currentUser}
        onUpdate={handleUpdateContact}
      />

      {/* Field-Level Security Callout */}
      <div className="bg-stone-100/60 rounded-xl border border-stone-200 p-4 text-xs text-stone-600 flex items-start gap-3">
        <Lock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-stone-800">Security Governance Policy: </strong>
          To prevent unauthorized contract tampering or operational misconfiguration, corporate entity details, billing accounts, and guard deployment permissions cannot be directly modified through the browser. All changes are verified through your account manager.
        </div>
      </div>

      {/* Account Session Logout */}
      {onLogout && (
        <div className="bg-[var(--surface-card)] border border-red-500/20 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div>
            <h3 className="font-semibold text-sm text-[var(--text-main)]">Account Session</h3>
            <p className="text-xs text-[var(--text-sub)] mt-0.5">
              Signed in as <span className="font-medium text-[var(--text-main)]">{user.email}</span> ({user.fullName}). End your current session securely.
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Portal</span>
          </button>
        </div>
      )}

      {/* Company Change Request Modal */}
      {isChangeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-[#092824]">Request Corporate Detail Amendment</h3>
            <p className="text-xs text-stone-500 mt-1">
              Submit formal modifications for legal entity name, tax PIN, or billing address.
            </p>

            <form onSubmit={handleCompanyChangeSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Requested Change Details
                </label>
                <textarea
                  rows={3}
                  value={requestedFields}
                  onChange={e => setRequestedFields(e.target.value)}
                  placeholder="Specify fields to update (e.g. New registered postal address, KRA tax compliance certificate number)..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#003C35]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Operational / Commercial Justification
                </label>
                <input
                  type="text"
                  value={changeReason}
                  onChange={e => setChangeReason(e.target.value)}
                  placeholder="e.g. Annual corporate registry update, relocation of headquarters..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#003C35]"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsChangeModalOpen(false)}
                  className="px-3.5 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingChange}
                  className="px-4 py-1.5 bg-[#003C35] hover:bg-[#002b26] text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingChange ? 'Submitting...' : 'Dispatch Request to Compliance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
