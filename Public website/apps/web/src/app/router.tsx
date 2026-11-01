import React, { useState, useEffect } from 'react';
import { HomePage } from '../features/home/pages/HomePage.tsx';
import { AboutPage } from '../features/about/pages/AboutPage.tsx';
import { ServicesPage } from '../features/services/pages/ServicesPage.tsx';
import { ContactPage } from '../features/contact/pages/ContactPage.tsx';
import { ServiceRequestPage } from '../features/requests/pages/ServiceRequestPage.tsx';
import { TrackRequestPage } from '../features/requests/pages/TrackRequestPage.tsx';
import { FeedbackComplaintPage } from '../features/cases/pages/FeedbackComplaintPage.tsx';
import { TrackCasePage } from '../features/cases/pages/TrackCasePage.tsx';
import { LoginPage } from '../features/auth/pages/LoginPage.tsx';
import { NotFoundPage } from '../features/errors/pages/NotFoundPage.tsx';
import { ServerErrorPage } from '../features/errors/pages/ServerErrorPage.tsx';
import { PublicLayout } from '../layouts/PublicLayout.tsx';
import { ServiceType } from '../../../../packages/shared/src/types/index.ts';

export interface RouteOptions {
  serviceType?: string;
  referenceNumber?: string;
  phone?: string;
  [key: string]: unknown;
}

export const Router: React.FC = () => {
  // Normalize initial route from window.location.pathname
  const getInitialPath = (): string => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname;
    return path && path !== '' ? path : '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath());
  const [routeOptions, setRouteOptions] = useState<RouteOptions>({});

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, options?: RouteOptions) => {
    if (options) {
      setRouteOptions(options);
    } else {
      setRouteOptions({});
    }

    const performNav = () => {
      setCurrentPath(path);
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    // Use native View Transitions API where available for cinematic silk wipe
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        performNav();
      });
    } else {
      performNav();
    }
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <HomePage onNavigate={navigate} />;
      case '/about':
        return <AboutPage onNavigate={navigate} />;
      case '/services':
        return <ServicesPage onNavigate={navigate} />;
      case '/contact':
        return <ContactPage onNavigate={navigate} />;
      case '/request':
      case '/request-service':
        return (
          <ServiceRequestPage
            onNavigate={navigate}
            initialServiceType={routeOptions.serviceType as ServiceType | undefined}
          />
        );
      case '/track':
      case '/track-request':
        return (
          <TrackRequestPage
            onNavigate={navigate}
            initialReference={routeOptions.referenceNumber}
            initialPhone={routeOptions.phone}
          />
        );
      case '/feedback':
      case '/complaints':
        return <FeedbackComplaintPage onNavigate={navigate} />;
      case '/track-case':
        return (
          <TrackCasePage
            onNavigate={navigate}
            initialReference={routeOptions.referenceNumber}
            initialPhone={routeOptions.phone}
          />
        );
      case '/login':
        return <LoginPage onNavigate={navigate} />;
      case '/500':
        return <ServerErrorPage onNavigate={navigate} onRetry={() => navigate('/')} />;
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <PublicLayout currentPath={currentPath} onNavigate={navigate}>
      {renderPage()}
    </PublicLayout>
  );
};

