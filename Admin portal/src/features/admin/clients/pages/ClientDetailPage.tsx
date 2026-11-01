import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  Users,
} from 'lucide-react';
import {
  getAllUsers,
  getClientById,
  getCurrentUser,
  getServiceRequests,
  getSites,
  hasPermission,
} from '@/services/store';
import { formatEAT, formatEATDate } from '@/utils/date';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ClientForm } from '../components/ClientForm';

interface ClientDetailPageProps {
  clientId: string;
  onBack: () => void;
  onSelectSite?: (siteId: string) => void;
  onSelectRequest?: (reqId: string) => void;
}

export const ClientDetailPage: React.FC<ClientDetailPageProps> = ({
  clientId,
  onBack,
  onSelectSite,
  onSelectRequest,
}) => {
  const [, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  const [isEditing, setIsEditing] = useState(false);
  const client = getClientById(clientId);
  const currentUser = getCurrentUser();
  const canUpdate = hasPermission('clients.update', currentUser);

  if (!client) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-lg max-w-lg mx-auto">
        <h3 className="text-base font-semibold text-slate-100">Client Account Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">
          This account may have been modified or you do not have permission to view it.
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-xs bg-slate-800 text-slate-200 rounded-md hover:bg-slate-700"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  // Linked entities
  const linkedSites = getSites().filter((s) => s.clientId === client.id);
  const linkedRequests = getServiceRequests().filter((r) => r.clientId === client.id);
  const linkedUsers = getAllUsers().filter((u) => u.clientId === client.id);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
            aria-label="Back to client list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">{client.companyName}</h2>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {client.accountReference}
              </span>
              <StatusBadge status={client.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sector: {client.industry} · Enrolled {formatEATDate(client.createdAt)}
            </p>
          </div>
        </div>

        {canUpdate && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Account</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Edit Client Details</h3>
          <ClientForm
            initialData={client}
            onSuccess={() => {
              setIsEditing(false);
              reload();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Account Details & Operational Sites */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Details Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Commercial Profile & Billing</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Primary Representative</span>
                  <span className="text-slate-200 font-medium">{client.contactPerson}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Official Email</span>
                  <span className="text-slate-200 font-mono">{client.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Telephone</span>
                  <span className="text-slate-200 font-mono">{client.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Headquarters / Billing</span>
                  <span className="text-slate-200">{client.billingAddress}, {client.city}</span>
                </div>
              </div>

              {client.notes && (
                <div className="mt-3 p-3 bg-slate-950/60 rounded border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                    Operational Requirements
                  </span>
                  {client.notes}
                </div>
              )}
            </div>

            {/* Linked Security Sites */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assigned Security Sites ({linkedSites.length})</span>
                </h3>
              </div>

              {linkedSites.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center">
                  No active security posts assigned to this client yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {linkedSites.map((site) => (
                    <div
                      key={site.id}
                      onClick={() => onSelectSite?.(site.id)}
                      className="py-3 flex items-center justify-between hover:bg-slate-850/50 -mx-2 px-2 rounded cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{site.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{site.siteCode} · {site.address}, {site.city}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">
                          {site.requiredGuardCount} Post Guard(s)
                        </span>
                        <StatusBadge status={site.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Linked Service Requests */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Service Contracts & Requests ({linkedRequests.length})</span>
                </h3>
              </div>

              {linkedRequests.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center">
                  No previous or pending service inquiries logged for this account.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {linkedRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => onSelectRequest?.(req.id)}
                      className="py-3 flex items-center justify-between hover:bg-slate-850/50 -mx-2 px-2 rounded cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-xs font-semibold font-mono text-slate-200 hover:text-amber-400">
                          {req.referenceNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 capitalize">
                          {req.serviceType.replace(/_/g, ' ')} · {req.requiredGuards} Guard(s)
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {req.quotationAmountKES && (
                          <span className="text-xs font-mono text-emerald-400">
                            KES {req.quotationAmountKES.toLocaleString()}
                          </span>
                        )}
                        <StatusBadge status={req.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Authorized Portal Users */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Authorized Portal Users</span>
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Client users holding access to track cases, invoices, and active security logs for this account.
              </p>

              {linkedUsers.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">
                  No individual portal credentials assigned to this client.
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-2.5 bg-slate-950/70 border border-slate-800 rounded text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{u.name}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">Active</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      <div className="text-[10px] text-slate-500">
                        Last Active: {formatEAT(u.lastLoginAt) || 'Never'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
