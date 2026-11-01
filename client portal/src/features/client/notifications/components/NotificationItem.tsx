/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Bell,
  FileText,
  DollarSign,
  MessageSquare,
  Shield,
  Check,
  ArrowRight,
} from 'lucide-react';
import { PortalNotification } from '@/src/types/clientPortal';
import { formatEAT } from '@/src/api/clientPortalApi';

interface NotificationItemProps {
  notification: PortalNotification;
  onMarkRead: (id: string) => void;
  onNavigateRef?: (category: string, refId: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onNavigateRef,
}) => {
  const getIcon = () => {
    switch (notification.category) {
      case 'quotation':
        return <DollarSign className="w-4 h-4 text-[#C9A04A]" />;
      case 'case':
        return <MessageSquare className="w-4 h-4 text-sky-600" />;
      case 'request':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'site':
        return <Shield className="w-4 h-4 text-[#003C35]" />;
      default:
        return <Bell className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div
      className={`p-4 transition-colors flex items-start gap-3.5 ${
        notification.read ? 'bg-white opacity-85' : 'bg-[#003C35]/5'
      }`}
    >
      <div className="p-2 rounded-lg bg-stone-100 border border-stone-200 shrink-0 mt-0.5">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-900">
              {notification.title}
            </span>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-[#C9A04A]" />
            )}
          </div>
          <span className="text-[11px] font-mono text-stone-400 tabular-nums">
            {formatEAT(notification.createdAt)}
          </span>
        </div>

        <p className="text-xs text-stone-700 mt-1 leading-relaxed">
          {notification.message}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs">
          {notification.referenceId && onNavigateRef && (
            <button
              onClick={() => onNavigateRef(notification.category, notification.referenceId!)}
              className="text-[#003C35] font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View Associated Record</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {!notification.read && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark as Read</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
