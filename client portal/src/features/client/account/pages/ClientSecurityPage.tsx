/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  Smartphone,
  KeyRound,
  History,
  AlertOctagon,
  CheckCircle,
} from 'lucide-react';
import { SecuritySession, SecurityAuditLog, ClientOrganization, ClientUser } from '@/src/types/clientPortal';
import { ClientPageHeader } from '@/src/components/client/ClientPageHeader';
import { SessionManagement } from '../components/SessionManagement';
import { clientPortalApi, formatEAT, sessionManager } from '@/src/api/clientPortalApi';

interface ClientSecurityPageProps {
  client: ClientOrganization;
  user: ClientUser;
}

export const ClientSecurityPage: React.FC<ClientSecurityPageProps> = ({ client, user }) => {
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(user.mfaEnabled);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sessList, logs] = await Promise.all([
        clientPortalApi.getSessions(),
        clientPortalApi.getAuditLogs(),
      ]);
      setSessions(sessList);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load security info', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [client.id, user.id]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await clientPortalApi.revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      await loadData();
    } catch (err: any) {
      alert(`Error revoking session: ${err.message}`);
    }
  };

  const handleToggleMfa = () => {
    const next = !mfaEnabled;
    setMfaEnabled(next);
    sessionManager.logAudit('MFA Policy Adjusted', `User toggled two-factor authentication to: ${next ? 'Enforced' : 'Optional'}`);
    loadData();
  };

  return (
    <div className="space-y-6">
      <ClientPageHeader
        breadcrumbs={[{ label: 'Portal', active: false }, { label: 'Security & Sessions', active: true }]}
        title="Security, Authentication & Audit Logs"
        description="Enterprise session monitoring, multi-factor token verification, and security audit event trail."
      />

      {/* MFA & Password Policy Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Two-Factor Authentication Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#003C35]" />
                <h3 className="text-sm font-bold text-[#092824]">Two-Factor Authentication (2FA)</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  mfaEnabled
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {mfaEnabled ? 'Enforced' : 'Optional'}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              Require a time-based one-time password (TOTP via Google Authenticator or SMS verification) for every client portal login attempt.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500">MFA Policy Enforcement</span>
            <button
              onClick={handleToggleMfa}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mfaEnabled
                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  : 'bg-[#003C35] hover:bg-[#002b26] text-white'
              }`}
            >
              {mfaEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
        </div>

        {/* Security Architecture Invariants */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <ShieldCheck className="w-4 h-4 text-[#003C35]" />
              <h3 className="text-sm font-bold text-[#092824]">Client Authorization Invariants</h3>
            </div>
            <ul className="text-xs text-stone-600 mt-3 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero sequential integer DB IDs exposed in browser URLs.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Multi-tenant IDOR protection enforced on every entity fetch.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Internal staff notes and tactical rosters excluded from API responses.</span>
              </li>
            </ul>
          </div>

          <div className="mt-5 pt-4 border-t border-stone-100 text-[11px] text-stone-400 font-mono">
            Encrypted Session: TLS 1.3 · Nairobi Primary DC
          </div>
        </div>
      </div>

      {/* Active Session Management */}
      <SessionManagement
        sessions={sessions}
        onRevokeSession={handleRevokeSession}
      />

      {/* Security Audit Log */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-[#092824]">Client Security Audit Trail</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Immutable ledger of client portal authentications, quotation approvals, and authorization checks
            </p>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            {auditLogs.length} events logged
          </span>
        </div>

        <div className="divide-y divide-stone-100 mt-2">
          {auditLogs.map(log => (
            <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900">{log.action}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      log.status === 'Success'
                        ? 'bg-emerald-50 text-emerald-800'
                        : log.status === 'Denied'
                        ? 'bg-rose-50 text-rose-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
                <div className="text-[11px] text-stone-600 mt-0.5 truncate">{log.details}</div>
              </div>

              <div className="shrink-0 flex items-center gap-3 text-stone-400 text-[11px] font-mono">
                <span>IP: {log.ipAddress}</span>
                <span>·</span>
                <span>{formatEAT(log.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
