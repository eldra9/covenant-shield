/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Target ClientLayout component combining 240px Sidebar, 64px Topbar, Bottom Tab Bar, and Security Lab.
 */

import React from 'react';
import { ClientOrganization, ClientUser } from '@/src/types/clientPortal';
import { ClientSidebar, PortalRoute } from '../components/ClientSidebar';
import { ClientTopbar } from '../components/ClientTopbar';
import { ClientBottomTabBar } from '../components/ClientBottomTabBar';
import { BreadcrumbItem } from '../components/ClientBreadcrumbs';

interface ClientLayoutProps {
  currentRoute: PortalRoute;
  onNavigate: (route: PortalRoute, id?: string) => void;
  client: ClientOrganization;
  user: ClientUser;
  unreadCount: number;
  onClientSwitch: (clientId: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
  selectedEntityReference?: string;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({
  currentRoute,
  onNavigate,
  client,
  user,
  unreadCount,
  onClientSwitch,
  onLogout,
  children,
  selectedEntityReference,
}) => {
  // Compute breadcrumbs dynamically based on route
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const list: BreadcrumbItem[] = [
      { label: 'Portal', onClick: () => onNavigate('dashboard') },
    ];

    switch (currentRoute) {
      case 'dashboard':
        list.push({ label: 'Overview', active: true });
        break;
      case 'sites':
        list.push({ label: 'Authorized Sites', active: true });
        break;
      case 'site-detail':
        list.push({ label: 'Authorized Sites', onClick: () => onNavigate('sites') });
        list.push({ label: selectedEntityReference || 'Site Specification', active: true });
        break;
      case 'requests':
        list.push({ label: 'Service Requests', active: true });
        break;
      case 'request-detail':
        list.push({ label: 'Service Requests', onClick: () => onNavigate('requests') });
        list.push({ label: selectedEntityReference || 'Request Details', active: true });
        break;
      case 'cases':
        list.push({ label: 'Cases & Feedback', active: true });
        break;
      case 'case-detail':
        list.push({ label: 'Cases & Feedback', onClick: () => onNavigate('cases') });
        list.push({ label: selectedEntityReference || 'Case Thread', active: true });
        break;
      case 'notifications':
        list.push({ label: 'Service Updates', active: true });
        break;
      case 'account':
      case 'profile':
      case 'security':
        list.push({ label: 'Account & Security', active: true });
        break;
      default:
        break;
    }

    return list;
  };

  return (
    <div className="min-h-screen flex bg-[var(--surface-bg)] text-[var(--text-main)] transition-colors duration-200">
      {/* Skip to Content for WCAG 2.1 AA Keyboard Navigation */}
      <a
        href="#main-portal-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-[#003C35] text-white px-4 py-2 rounded shadow-lg font-medium text-xs"
      >
        Skip to main portal content
      </a>

      {/* Desktop Left Rail (240px on md+) */}
      <ClientSidebar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        client={client}
        user={user}
        unreadCount={unreadCount}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Topbar (64px) */}
        <ClientTopbar
          client={client}
          user={user}
          unreadCount={unreadCount}
          breadcrumbs={getBreadcrumbs()}
          onOpenNotifications={() => onNavigate('notifications')}
          onNavigateProfile={() => onNavigate('account')}
          onLogout={onLogout}
        />

        {/* Viewport Content */}
        <main
          id="main-portal-content"
          tabIndex={-1}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto outline-none transition-all duration-300"
          style={{
            animation: 'fadeInPage 320ms var(--e-lux) both',
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (<768px, 64px) */}
      <ClientBottomTabBar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
      />

    </div>
  );
};
