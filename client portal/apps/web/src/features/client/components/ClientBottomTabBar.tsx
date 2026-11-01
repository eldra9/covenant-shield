/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClientBottomTabBar:
 * Bottom tab bar below 768px (64px, safe-area padding):
 * - Items: Overview, Requests, Cases, Sites, Account
 * - Gold indicator for active tab
 */

import React from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquareWarning,
  Shield,
  User,
} from 'lucide-react';
import { PortalRoute } from './ClientSidebar';

interface ClientBottomTabBarProps {
  currentRoute: PortalRoute;
  onNavigate: (route: PortalRoute) => void;
}

export const ClientBottomTabBar: React.FC<ClientBottomTabBarProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const activeRailId =
    currentRoute === 'dashboard'
      ? 'overview'
      : currentRoute === 'requests' || currentRoute === 'request-detail'
      ? 'requests'
      : currentRoute === 'cases' || currentRoute === 'case-detail'
      ? 'cases'
      : currentRoute === 'sites' || currentRoute === 'site-detail'
      ? 'sites'
      : 'account';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, route: 'dashboard' as PortalRoute },
    { id: 'requests', label: 'Requests', icon: FileText, route: 'requests' as PortalRoute },
    { id: 'cases', label: 'Cases', icon: MessageSquareWarning, route: 'cases' as PortalRoute },
    { id: 'account', label: 'Account', icon: User, route: 'account' as PortalRoute },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#092824] border-t border-[#003C35] z-40 px-2 flex items-center justify-around select-none pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile Bottom Navigation"
    >
      {navItems.map((item) => {
        const isActive = item.id === activeRailId;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.route)}
            className={`flex flex-col items-center justify-center w-full h-full relative cursor-pointer ${
              isActive ? 'text-[#C9A04A]' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {/* Top gold indicator on active item */}
            {isActive && (
              <span
                className="absolute top-0 w-8 h-[2px] bg-[#C9A04A] rounded-full shadow-[0_0_8px_rgba(201,160,74,0.8)]"
                aria-hidden="true"
              />
            )}
            <Icon className="w-4 h-4 mb-1" />
            <span className="text-[10px] font-mono-ref tracking-wider leading-none">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
