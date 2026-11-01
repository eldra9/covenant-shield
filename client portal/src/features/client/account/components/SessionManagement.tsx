/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Laptop, Smartphone, Globe, Shield, Trash2, CheckCircle2 } from 'lucide-react';
import { SecuritySession } from '@/src/types/clientPortal';

interface SessionManagementProps {
  sessions: SecuritySession[];
  onRevokeSession: (sessionId: string) => Promise<void>;
}

export const SessionManagement: React.FC<SessionManagementProps> = ({
  sessions,
  onRevokeSession,
}) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div>
          <h3 className="text-sm font-bold text-[#092824]">Active Authenticated Sessions</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Devices and locations authorized to access this client portal account
          </p>
        </div>
        <span className="text-[11px] font-mono text-stone-400">
          {sessions.length} session{sessions.length === 1 ? '' : 's'} active
        </span>
      </div>

      <div className="divide-y divide-stone-100 mt-2">
        {sessions.map(sess => {
          const isMobile = sess.device.toLowerCase().includes('phone') || sess.device.toLowerCase().includes('android');
          return (
            <div key={sess.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 mt-0.5">
                  {isMobile ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{sess.device}</span>
                    {sess.isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded font-sans">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Current Device
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-stone-600 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span>{sess.browser}</span>
                    <span>·</span>
                    <span className="font-mono text-stone-500">{sess.ipAddress}</span>
                    <span>·</span>
                    <span>{sess.location}</span>
                  </div>

                  <div className="text-[10px] text-stone-400 mt-1 font-mono">
                    Activity: {sess.lastActive}
                  </div>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => onRevokeSession(sess.id)}
                  className="px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Revoke</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
