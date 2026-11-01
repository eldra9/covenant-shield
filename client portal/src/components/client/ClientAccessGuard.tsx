/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { ClientOrganization, ClientUser } from '@/src/types/clientPortal';

interface ClientAccessGuardProps {
  user: ClientUser | null;
  client: ClientOrganization | null;
  requiredRole?: string;
  children: React.ReactNode;
  onLoginRequest?: () => void;
}

export const ClientAccessGuard: React.FC<ClientAccessGuardProps> = ({
  user,
  client,
  children,
}) => {
  if (!user || !client) {
    return <>{children}</>;
  }

  if (client.accountStatus === 'Suspended') {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-rose-50 border border-rose-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 mx-auto flex items-center justify-center text-rose-700 mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-rose-900">Account Access Suspended</h2>
          <p className="text-xs text-rose-700 mt-2">
            Access for {client.name} is currently suspended. Please contact your dedicated Operations Account Manager {client.operationsManager.name} ({client.operationsManager.phone}).
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
