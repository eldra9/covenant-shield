/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClientAccessGuard with authentication, stale session, network failure, and role verification.
 */

import React from 'react';
import { ShieldAlert, Lock, ArrowRight, RefreshCw, WifiOff, Clock } from 'lucide-react';
import { ClientOrganization, ClientUser } from '@/src/types/clientPortal';

interface ClientAccessGuardProps {
  user: ClientUser | null;
  client: ClientOrganization | null;
  isStaleSession?: boolean;
  networkError?: string | null;
  onRetryNetwork?: () => void;
  onRefreshSession?: () => void;
  onLoginRequest?: () => void;
  children: React.ReactNode;
}

export const ClientAccessGuard: React.FC<ClientAccessGuardProps> = ({
  user,
  client,
  isStaleSession,
  networkError,
  onRetryNetwork,
  onRefreshSession,
  onLoginRequest,
  children,
}) => {
  // 1. Network Failure State with Retry
  if (networkError) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 mx-auto flex items-center justify-center text-rose-600 mb-4">
            <WifiOff className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-[#092824]">Connectivity Interrupted</h2>
          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
            {networkError || 'Unable to establish secure handshake with Covenant Shield gateway. Please verify your connection or retry.'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onRetryNetwork}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#003C35] hover:bg-[#002b26] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Stale Session State
  if (isStaleSession) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-amber-200 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 mx-auto flex items-center justify-center text-amber-700 mb-4">
            <Clock className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-[#092824]">Stale Session Detected</h2>
          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
            Your client authentication token has expired due to inactivity. Re-verify your session to continue managing operational records.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={onRefreshSession}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003C35] hover:bg-[#002b26] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#C9A04A]" />
              <span>Refresh Portal Authentication</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthenticated State
  if (!user || !client) {
    return <>{children}</>;
  }

  // 4. Suspended Account State
  if (client.accountStatus === 'Suspended') {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-100 mx-auto flex items-center justify-center text-rose-700 mb-4">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-rose-900">Account Access Suspended</h2>
          <p className="text-xs text-rose-700 mt-2 leading-relaxed">
            Access for <strong className="font-semibold">{client.name}</strong> is currently suspended. Please contact your dedicated Operations Account Manager {client.operationsManager.name} ({client.operationsManager.phone}).
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
