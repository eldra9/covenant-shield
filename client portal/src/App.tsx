/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ClientLayout } from './layouts/ClientLayout';
import { ClientAccessGuard } from '@/apps/web/src/features/client/components/ClientAccessGuard';
import { PortalRoute } from './components/client/ClientSidebar';
import { sessionManager, clientPortalApi } from './api/clientPortalApi';
import { ClientOrganization, ClientUser, Site } from './types/clientPortal';

// Signature Luxury Components
import { WelcomeSequence } from './components/luxury/WelcomeSequence';
import { TabIndicator } from './components/luxury/TabIndicator';
import { NewRequestModal } from './features/client/requests/components/NewRequestModal';
import { NewFeedbackModal } from './features/client/cases/components/NewFeedbackModal';

// Feature Pages
import { ClientDashboardPage } from './features/client/dashboard/pages/ClientDashboardPage';
import { ClientSitesPage } from './features/client/sites/pages/ClientSitesPage';
import { ClientSiteDetailPage } from './features/client/sites/pages/ClientSiteDetailPage';
import { ClientRequestsPage } from './features/client/requests/pages/ClientRequestsPage';
import { ClientRequestDetailPage } from './features/client/requests/pages/ClientRequestDetailPage';
import { ClientCasesPage } from './features/client/cases/pages/ClientCasesPage';
import { ClientCaseDetailPage } from './features/client/cases/pages/ClientCaseDetailPage';
import { ClientNotificationsPage } from './features/client/notifications/pages/ClientNotificationsPage';
import { ClientProfilePage } from './features/client/profile/pages/ClientProfilePage';
import { ClientSecurityPage } from './features/client/account/pages/ClientSecurityPage';
import { ClientAuthModal } from './components/client/ClientAuthModal';

function extractAuthFromUrl(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash || '';
    let hashParams: URLSearchParams | null = null;
    if (hash.includes('?')) {
      hashParams = new URLSearchParams(hash.split('?')[1]);
    }

    const token =
      searchParams.get('token') ||
      searchParams.get('access_token') ||
      hashParams?.get('token') ||
      hashParams?.get('access_token');
    const refresh =
      searchParams.get('refresh') ||
      searchParams.get('refresh_token') ||
      hashParams?.get('refresh') ||
      hashParams?.get('refresh_token');
    const userStr = searchParams.get('user') || hashParams?.get('user');

    if (token) {
      localStorage.setItem('covenant_shield_access_token', token);
      if (refresh) localStorage.setItem('covenant_shield_refresh_token', refresh);
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          localStorage.setItem('covenant_shield_user', JSON.stringify(parsed));
          if (parsed.email) localStorage.setItem('covenant_shield_session_email', parsed.email);
        } catch {
          // ignore
        }
      }

      // Clean query params from URL so sensitive tokens aren't shown in address bar
      const cleanHash = hash.split('?')[0] || '#/portal/dashboard';
      window.history.replaceState(null, '', window.location.pathname + cleanHash);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return Boolean(localStorage.getItem('covenant_shield_access_token'));
  });
  const [isStaleSession, setIsStaleSession] = useState<boolean>(false);
  const [client, setClient] = useState<ClientOrganization>(() => sessionManager.getCurrentClient());
  const [user, setUser] = useState<ClientUser>(() => sessionManager.getCurrentUser());
  const [currentRoute, setCurrentRoute] = useState<PortalRoute>('dashboard');
  const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>(undefined);
  const [selectedEntityReference, setSelectedEntityReference] = useState<string | undefined>(undefined);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Authorized sites for modals
  const [sites, setSites] = useState<Site[]>([]);

  // Modals state
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isNewFeedbackOpen, setIsNewFeedbackOpen] = useState(false);

  // Account tab state (profile vs security)
  const [accountSubTab, setAccountSubTab] = useState<'profile' | 'security'>('profile');

  // Welcome sequence: once per session (sessionStorage in try/catch)
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const fx = document.documentElement.getAttribute('data-fx');
        if (fx === 'off') return false;
        const seen = sessionStorage.getItem('cs_welcome_shown');
        return !seen;
      }
    } catch {
      return false;
    }
    return false;
  });

  const handleWelcomeComplete = () => {
    try {
      sessionStorage.setItem('cs_welcome_shown', 'true');
    } catch {
      // ignore
    }
    setShowWelcome(false);
  };

  // Sync sites & notifications
  const refreshData = useCallback(async () => {
    try {
      const [notifs, siteList] = await Promise.all([
        clientPortalApi.getNotifications(),
        clientPortalApi.getSites(),
      ]);
      setUnreadCount(notifs.filter(n => !n.read).length);
      setSites(siteList);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const hasIncomingToken = extractAuthFromUrl();
    const token = typeof window !== 'undefined' ? localStorage.getItem('covenant_shield_access_token') : null;

    if (hasIncomingToken || token) {
      setIsAuthenticated(true);
      clientPortalApi.getProfile().then(res => {
        if (res.client) setClient(res.client);
        if (res.user) setUser(res.user);
        refreshData();
      }).catch(() => {
        const hydrated = sessionManager.hydrateFromStoredSession();
        setClient(hydrated.client);
        setUser(hydrated.user);
        refreshData();
      });
    } else {
      setIsAuthenticated(false);
    }
  }, [refreshData]);

  // Handle URL hash changes
  const navigate = (route: PortalRoute, id?: string, reference?: string) => {
    setCurrentRoute(route);
    setSelectedEntityId(id);
    setSelectedEntityReference(reference || id);
    let hash = `/portal/${route}`;
    if (id) hash += `/${id}`;
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash || hash === '/' || hash === '/portal' || hash === '/portal/dashboard') {
        setCurrentRoute('dashboard');
        setSelectedEntityId(undefined);
        setSelectedEntityReference(undefined);
      } else if (hash.startsWith('/portal/sites/')) {
        const id = hash.replace('/portal/sites/', '');
        setCurrentRoute('site-detail');
        setSelectedEntityId(id);
      } else if (hash === '/portal/sites') {
        setCurrentRoute('sites');
        setSelectedEntityId(undefined);
        setSelectedEntityReference(undefined);
      } else if (hash.startsWith('/portal/requests/')) {
        const id = hash.replace('/portal/requests/', '');
        setCurrentRoute('request-detail');
        setSelectedEntityId(id);
      } else if (hash === '/portal/requests') {
        setCurrentRoute('requests');
        setSelectedEntityId(undefined);
        setSelectedEntityReference(undefined);
      } else if (hash.startsWith('/portal/cases/')) {
        const id = hash.replace('/portal/cases/', '');
        setCurrentRoute('case-detail');
        setSelectedEntityId(id);
      } else if (hash === '/portal/cases') {
        setCurrentRoute('cases');
        setSelectedEntityId(undefined);
        setSelectedEntityReference(undefined);
      } else if (hash === '/portal/notifications') {
        setCurrentRoute('notifications');
        setSelectedEntityId(undefined);
        setSelectedEntityReference(undefined);
      } else if (hash === '/portal/account' || hash === '/portal/profile' || hash === '/portal/security') {
        setCurrentRoute('account');
        setSelectedEntityId(undefined);
        setSelectedEntityReference(undefined);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleClientSwitch = (clientId: string) => {
    const switched = sessionManager.setCurrentClient(clientId);
    setClient(switched.client);
    if (switched.user) setUser(switched.user);
    navigate('dashboard');
    refreshData();
  };

  const handleLogout = () => {
    sessionManager.resetDatabase();
    setIsAuthenticated(false);
    // Redirect to the Public Website login page
    const publicLoginUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '') + '/login';
    window.location.assign(publicLoginUrl);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setIsStaleSession(false);
    clientPortalApi.getProfile().then(res => {
      if (res.client) setClient(res.client);
      if (res.user) setUser(res.user);
      refreshData();
    });
  };

  const handleAuthModalSuccess = (userData: any, accessToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('covenant_shield_access_token', accessToken);
      if (userData) {
        localStorage.setItem('covenant_shield_user', JSON.stringify(userData));
        if (userData.email) {
          localStorage.setItem('covenant_shield_session_email', userData.email);
        }
      }
    }
    handleLogin();
  };

  return (
    <>
      {/* Welcome Sequence (first load after sign-in) */}
      {showWelcome && isAuthenticated && (
        <WelcomeSequence
          userName={user.fullName}
          onComplete={handleWelcomeComplete}
        />
      )}

      <ClientAccessGuard
        user={isAuthenticated ? user : null}
        client={isAuthenticated ? client : null}
        isStaleSession={isStaleSession}
        onRefreshSession={() => setIsStaleSession(false)}
        onLoginRequest={handleLogin}
      >
        <ClientLayout
          currentRoute={currentRoute}
          onNavigate={navigate}
          client={client}
          user={user}
          unreadCount={unreadCount}
          onClientSwitch={handleClientSwitch}
          onLogout={handleLogout}
          selectedEntityReference={selectedEntityReference}
        >
          {/* OVERVIEW / DASHBOARD */}
          {currentRoute === 'dashboard' && (
            <ClientDashboardPage
              client={client}
              user={user}
              onNavigate={navigate}
              onNewRequest={() => setIsNewRequestOpen(true)}
              onNewCase={() => setIsNewFeedbackOpen(true)}
            />
          )}

          {/* SITES */}
          {currentRoute === 'sites' && (
            <ClientSitesPage
              client={client}
              onSelectSite={id => navigate('site-detail', id)}
              onNewRequest={() => setIsNewRequestOpen(true)}
            />
          )}

          {currentRoute === 'site-detail' && selectedEntityId && (
            <ClientSiteDetailPage
              siteId={selectedEntityId}
              onBack={() => navigate('sites')}
              onRequestForSite={() => setIsNewRequestOpen(true)}
              onReportIncident={() => setIsNewFeedbackOpen(true)}
            />
          )}

          {/* SERVICE REQUESTS */}
          {currentRoute === 'requests' && (
            <ClientRequestsPage
              client={client}
              onSelectRequest={id => navigate('request-detail', id)}
              onRequestCreated={refreshData}
              onNewRequest={() => setIsNewRequestOpen(true)}
            />
          )}

          {currentRoute === 'request-detail' && selectedEntityId && (
            <ClientRequestDetailPage
              requestId={selectedEntityId}
              onBack={() => navigate('requests')}
              onRequestUpdated={refreshData}
              onMessageUs={(reqId, ref) => setIsNewFeedbackOpen(true)}
            />
          )}

          {/* CASES & FEEDBACK */}
          {currentRoute === 'cases' && (
            <ClientCasesPage
              client={client}
              onSelectCase={id => navigate('case-detail', id)}
              onCaseCreated={refreshData}
            />
          )}

          {currentRoute === 'case-detail' && selectedEntityId && (
            <ClientCaseDetailPage
              caseId={selectedEntityId}
              onBack={() => navigate('cases')}
              onCaseUpdated={refreshData}
            />
          )}

          {/* NOTIFICATIONS */}
          {currentRoute === 'notifications' && (
            <ClientNotificationsPage
              client={client}
              onNavigate={navigate}
              onNotificationsChanged={refreshData}
            />
          )}

          {/* ACCOUNT & SECURITY */}
          {currentRoute === 'account' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <TabIndicator
                tabs={[
                  { id: 'profile', label: 'Company Profile & Contacts' },
                  { id: 'security', label: 'Security & Active Sessions' },
                ]}
                activeTab={accountSubTab}
                onChange={tab => setAccountSubTab(tab as any)}
              />

              {accountSubTab === 'profile' ? (
                <ClientProfilePage
                  client={client}
                  user={user}
                  onLogout={handleLogout}
                  onProfileUpdated={() => {
                    setUser(sessionManager.getCurrentUser());
                    setClient(sessionManager.getCurrentClient());
                  }}
                />
              ) : (
                <ClientSecurityPage
                  client={client}
                  user={user}
                />
              )}
            </div>
          )}
        </ClientLayout>
      </ClientAccessGuard>

      {/* New Request Modal with Live Summary Ticket & SealStamp */}
      <NewRequestModal
        sites={sites}
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onSuccess={(newReq) => {
          refreshData();
          navigate('request-detail', newReq.id);
        }}
      />

      {/* New Complaint / Feedback Modal with 1-5 rating & up to 3 attachments */}
      <NewFeedbackModal
        sites={sites}
        isOpen={isNewFeedbackOpen}
        onClose={() => setIsNewFeedbackOpen(false)}
        onSuccess={(newCase) => {
          refreshData();
          navigate('case-detail', newCase.id);
        }}
      />

      {/* Authentication Modal for direct sign in / registration */}
      <ClientAuthModal
        isOpen={!isAuthenticated}
        onSuccess={handleAuthModalSuccess}
      />
    </>
  );
}
