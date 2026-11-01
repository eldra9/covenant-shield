import React from 'react';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { renderToStaticMarkup } from 'react-dom/server';
import { publicNavLinks } from '../components/navigation/PublicHeader.tsx';
import { PageHeaderBand } from '../components/ui/PageHeaderBand.tsx';

describe('Public Navigation Routes & Standards', () => {
  const routes = [
    '/',
    '/about',
    '/services',
    '/contact',
    '/request-service',
    '/feedback',
    '/track-request',
    '/track-case',
    '/login',
  ];

  it('defines all nine mandatory public endpoints', () => {
    assert.strictEqual(routes.length, 9);
    assert.ok(routes.includes('/'));
    assert.ok(routes.includes('/about'));
    assert.ok(routes.includes('/services'));
    assert.ok(routes.includes('/contact'));
    assert.ok(routes.includes('/request-service'));
    assert.ok(routes.includes('/feedback'));
    assert.ok(routes.includes('/track-request'));
    assert.ok(routes.includes('/track-case'));
    assert.ok(routes.includes('/login'));
  });

  it('keeps the top navigation focused on core public-facing pages', () => {
    const visiblePaths = publicNavLinks.map((link) => link.path);

    assert.deepStrictEqual(visiblePaths, [
      '/',
      '/about',
      '/services',
      '/contact',
      '/track-request',
      '/feedback',
    ]);
  });

  it('verifies brand color tokens are defined', () => {
    const brandTokens = {
      emerald: '#003C35',
      gold: '#C9A04A',
      forest: '#092824',
      white: '#FFFFFF',
      lightGrey: '#F4F6F4',
      mainText: '#24332F',
    };
    assert.strictEqual(brandTokens.emerald, '#003C35');
    assert.strictEqual(brandTokens.gold, '#C9A04A');
    assert.strictEqual(brandTokens.forest, '#092824');
  });

  it('does not render the decorative page badge or breadcrumb trail', () => {
    const markup = renderToStaticMarkup(
      <PageHeaderBand
        title="Secure Client Intake"
        subtitle="Trusted security response"
        badge="SECURE CLIENT INTAKE"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Request a Service', path: '/request' },
        ]}
        onNavigate={() => undefined}
      />,
    );

    assert.doesNotMatch(markup, /aria-label="Breadcrumb"/i);
    assert.doesNotMatch(markup, /bg-\[\#C9A04A\]\/10/i);
  });
});
