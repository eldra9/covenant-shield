import React from 'react';
import { Permission } from '../../types';
import { getCurrentUser, hasPermission } from '../../services/store';
import { ShieldAlert } from 'lucide-react';

interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback,
}) => {
  const user = getCurrentUser();
  const allowed = hasPermission(permission, user);

  if (!allowed) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-lg max-w-xl mx-auto my-12">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-100">Access Restricted</h3>
        <p className="text-sm text-slate-400 mt-1">
          Your active role (<span className="text-amber-400 font-mono capitalize">{user.role.replace('_', ' ')}</span>) does not hold the required permission <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">{permission}</code>.
        </p>
        <p className="text-xs text-slate-500 mt-4">
          To test this capability, select a higher authorization tier (e.g. Super Administrator or Operations Staff) from the top-bar role switcher.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
