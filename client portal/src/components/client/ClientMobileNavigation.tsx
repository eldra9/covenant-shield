/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  Shield,
  FileText,
  MessageSquareWarning,
  Bell,
  Building2,
  Lock,
  PhoneCall,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { ClientOrganization, ClientUser } from '@/src/types/clientPortal';
import { PortalRoute } from './ClientSidebar';

interface ClientMobileNavigationProps {
  currentRoute: PortalRoute;
  onNavigate: (route: PortalRoute) => void;
  client: ClientOrganization;
  user: ClientUser;
  unreadCount: number;
  onOpenSecurityLab: () => void;
  onLogout: () => void;
}

export const ClientMobileNavigation: React.FC<ClientMobileNavigationProps> = ({
  currentRoute,
  onNavigate,
  client,
  user,
  unreadCount,
  onOpenSecurityLab,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sites', label: 'Authorized Sites', icon: Shield },
    { id: 'requests', label: 'Service Requests', icon: FileText },
    { id: 'cases', label: 'Cases & Feedback', icon: MessageSquareWarning },
    { id: 'notifications', label: 'Service Updates', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Company Profile', icon: Building2 },
    { id: 'security', label: 'Security & Sessions', icon: Lock },
  ];

  const handleNavClick = (route: PortalRoute) => {
    onNavigate(route);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden sticky top-0 z-30 bg-[#092824] text-white border-b border-[#003C35]">
      {/* Top Header Row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md overflow-hidden bg-[#003C35] border border-[#C9A04A]/40 shrink-0">
            <img
              src="/src/assets/images/logo.png"
              alt="Covenant Shield"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold tracking-tight text-white truncate leading-tight">
              COVENANT SHIELD
            </div>
            <div className="text-[10px] text-[#C9A04A] truncate">{client.name}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavClick('notifications')}
            className="relative p-2 text-stone-300 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C9A04A]" />
            )}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-stone-300 hover:text-white focus:outline-none"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="fixed inset-0 top-[57px] bg-black/60 z-40 backdrop-blur-xs flex flex-col">
          <div className="bg-[#092824] border-b border-[#003C35] p-4 flex-1 flex flex-col justify-between max-w-sm w-full shadow-2xl">
            <div className="space-y-1">
              <div className="px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                Portal Menu
              </div>
              {navItems.map(item => {
                const Icon = item.icon;
                const active = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id as PortalRoute)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#003C35] text-white font-semibold'
                        : 'text-stone-300 hover:text-white hover:bg-[#003C35]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-[#C9A04A]' : 'text-stone-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span className="bg-[#C9A04A] text-[#092824] text-[10px] font-bold px-1.5 py-0.2 rounded font-mono">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              <div className="pt-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenSecurityLab();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-amber-200 bg-amber-950/40 border border-amber-600/30"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Security & IDOR Audit Lab</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#003C35] space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#C9A04A]">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>24/7 Hotline: +254 711 002 911</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-white">{user.fullName}</div>
                  <div className="text-[10px] text-stone-400">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="px-3 py-1.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/40 rounded-md flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
