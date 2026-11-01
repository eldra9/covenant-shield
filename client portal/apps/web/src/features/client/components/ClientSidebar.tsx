/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClientSidebar:
 * Left rail 240px on md+:
 * - Official Covenant Shield emblem & wordmark
 * - Items: Overview, Requests, Cases, Sites, Account
 * - Active item has a 3px gold bar that slides smoothly
 * - Official 24/7 hotline (+254 711 002 911 EAT)
 * - Sign out CTA
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Shield,
  FileText,
  MessageSquareWarning,
  User,
  PhoneCall,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ClientOrganization, ClientUser } from '@/src/types/clientPortal';
import { GuillocheSeal } from '@/src/components/luxury/GuillocheSeal';

export type PortalRoute =
  | 'dashboard'
  | 'requests'
  | 'request-detail'
  | 'cases'
  | 'case-detail'
  | 'sites'
  | 'site-detail'
  | 'account'
  | 'profile'
  | 'security'
  | 'notifications';

interface ClientSidebarProps {
  currentRoute: PortalRoute;
  onNavigate: (route: PortalRoute, id?: string) => void;
  client: ClientOrganization;
  user: ClientUser;
  unreadCount: number;
  onLogout: () => void;
}

export const ClientSidebar: React.FC<ClientSidebarProps> = ({
  currentRoute,
  onNavigate,
  client,
  user,
  unreadCount,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Map current route to canonical 5 navigation items
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
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      route: 'dashboard' as PortalRoute,
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: FileText,
      route: 'requests' as PortalRoute,
    },
    {
      id: 'cases',
      label: 'Cases',
      icon: MessageSquareWarning,
      route: 'cases' as PortalRoute,
    },
    {
      id: 'sites',
      label: 'Sites',
      icon: Shield,
      route: 'sites' as PortalRoute,
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      route: 'account' as PortalRoute,
    },
  ];

  const activeIndex = navItems.findIndex(item => item.id === activeRailId);

  return (
    <aside
      className={`bg-[#092824] text-white flex flex-col h-screen shrink-0 border-r border-[#003C35] select-none sticky top-0 hidden md:flex z-30 transition-all duration-300 ease-[var(--e-lux)] ${
        collapsed ? 'w-[76px]' : 'w-[240px]'
      }`}
    >
      {/* Brand Header & Toggle */}
      <div className={`p-4 border-b border-[#003C35] flex items-center ${collapsed ? 'justify-center' : 'justify-between gap-3'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative shrink-0 w-9 h-9 rounded-lg overflow-hidden border border-[#C9A04A]/40 shadow-sm shadow-black/40">
            <img
              src="/src/assets/images/logo.png"
              alt="Covenant Shield Logo"
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm tracking-wide text-white leading-tight truncate">
                  COVENANT SHIELD
                </span>
              </div>
              <span className="text-[10px] font-mono-ref tracking-widest text-[#C9A04A] block uppercase truncate">
                CLIENT CONCIERGE
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#0D322D] transition-colors cursor-pointer ${
            collapsed ? 'mt-2 w-full flex justify-center' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-[#C9A04A]" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items with Sliding 3px Gold Bar */}
      <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-3'} py-6 relative`} aria-label="Client Portal Rail">
        {/* Sliding 3px Gold Bar */}
        {activeIndex !== -1 && (
          <div
            className="absolute left-0 w-[3px] bg-[#C9A04A] rounded-r transition-all duration-[320ms] ease-[var(--e-lux)] pointer-events-none"
            style={{
              top: `${24 + activeIndex * 48}px`,
              height: '40px',
              boxShadow: '0 0 10px rgba(201, 160, 74, 0.7)',
            }}
            aria-hidden="true"
          />
        )}

        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = item.id === activeRailId;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.route)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-3.5'} py-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#C9A04A] bg-[#0D322D] font-semibold'
                    : 'text-stone-300 hover:text-white hover:bg-[#0D322D]/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#C9A04A]' : 'text-stone-400 group-hover:text-stone-200'
                  }`}
                />
                {!collapsed && <span className="tracking-wide text-sm">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 24/7 Operations Desk Hotline */}
      <div className={`p-3 border-t border-[#003C35] bg-[#061E1B] ${collapsed ? 'text-center' : ''}`}>
        {!collapsed ? (
          <>
            <div className="flex items-start gap-2.5">
              <PhoneCall className="w-4 h-4 text-[#C9A04A] shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-mono-ref uppercase tracking-wider text-stone-400 block">
                  24/7 Operations Desk
                </span>
                <a
                  href="tel:+254711002911"
                  className="text-xs font-mono-ref font-bold text-white hover:text-[#C9A04A] transition-colors block truncate"
                >
                  +254 711 002 911
                </a>
                <span className="text-[9px] font-mono-ref text-[#A47F2E] block">
                  Nairobi Tactical Control (EAT)
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#003C35]/60 flex flex-col gap-2">
              <div className="flex items-center justify-between text-stone-400 text-xs">
                <span className="truncate max-w-[130px] font-medium text-stone-300">
                  {user.fullName.split(' ')[0]}
                </span>
                <span className="text-[10px] font-mono-ref text-[#C9A04A]">
                  {client.accountStatus || 'Active'}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-200 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                title="Sign out of portal"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-1">
            <a
              href="tel:+254711002911"
              className="p-2 rounded-lg bg-[#0D322D] text-[#C9A04A] hover:bg-[#003C35] transition-colors"
              title="24/7 Hotline: +254 711 002 911"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
