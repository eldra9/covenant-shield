/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import { PortalNotification, ClientOrganization } from '@/src/types/clientPortal';
import { ClientPageHeader } from '@/src/components/client/ClientPageHeader';
import { NotificationItem } from '../components/NotificationItem';
import { clientNotificationsApi } from '../api/clientNotificationsApi';
import { PortalRoute } from '@/src/components/client/ClientSidebar';

interface ClientNotificationsPageProps {
  client: ClientOrganization;
  onNavigate: (route: PortalRoute, id?: string) => void;
  onNotificationsChanged?: () => void;
}

export const ClientNotificationsPage: React.FC<ClientNotificationsPageProps> = ({
  client,
  onNavigate,
  onNotificationsChanged,
}) => {
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'quotation' | 'request' | 'case'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await clientNotificationsApi.getNotifications();
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [client.id]);

  const handleMarkRead = async (id: string) => {
    try {
      await clientNotificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      if (onNotificationsChanged) onNotificationsChanged();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await clientNotificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (onNotificationsChanged) onNotificationsChanged();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleNavigateRef = (category: string, refId: string) => {
    if (category === 'request' || category === 'quotation') {
      onNavigate('request-detail', refId);
    } else if (category === 'case') {
      onNavigate('case-detail', refId);
    } else if (category === 'site') {
      onNavigate('site-detail', refId);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'quotation') return n.category === 'quotation';
    if (filter === 'request') return n.category === 'request';
    if (filter === 'case') return n.category === 'case';
    return true;
  });

  return (
    <div className="space-y-6">
      <ClientPageHeader
        breadcrumbs={[{ label: 'Portal', active: false }, { label: 'Service Updates', active: true }]}
        title="Service Updates & Operational Notifications"
        description="Real-time alerts regarding request quotations, escort deployments, and support ticket findings."
        action={
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#003C35]" />
            <span>Mark All as Read</span>
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-stone-200 p-2.5 flex items-center gap-1.5 overflow-x-auto shadow-xs">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: 'Unread Only' },
          { id: 'quotation', label: 'Quotations' },
          { id: 'request', label: 'Requests & Escorts' },
          { id: 'case', label: 'Case Replies' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filter === tab.id
                ? 'bg-[#003C35] text-white font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List Container */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-20 bg-stone-200 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-10 h-10 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400 mb-3">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-stone-700">No Notifications</h3>
          <p className="text-xs text-stone-500 mt-1">
            You're all caught up! Relevant operational alerts will appear here as deployments progress.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs divide-y divide-stone-100">
          {filtered.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onNavigateRef={handleNavigateRef}
            />
          ))}
        </div>
      )}
    </div>
  );
};
