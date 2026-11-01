import React from 'react';
import '../lib/i18n.ts';
import { Providers } from './providers.tsx';
import { Router } from './router.tsx';
import { ErrorBoundary } from '../components/ui/ErrorBoundary.tsx';

export default function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <Router />
      </Providers>
    </ErrorBoundary>
  );
}
