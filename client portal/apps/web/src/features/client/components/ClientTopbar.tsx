/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClientTopbar:
 * 64px Top Bar containing:
 * - Logo & Breadcrumbs
 * - Organization Context Switcher
 * - Unread Notifications counter
 * - Theme toggle (System / Light / Dark)
 * - User concierge menu & security indicators
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Laptop,
  User,
  Check,
  LogOut,
} from 'lucide-react';
import { ClientOrganization, ClientUser } from '@/src/types/clientPortal';
import { ClientBreadcrumbs, BreadcrumbItem } from './ClientBreadcrumbs';

type ThemeMode = 'system' | 'light' | 'dark';

interface ClientTopbarProps {
  client: ClientOrganization;
  user: ClientUser;
  unreadCount: number;
  breadcrumbs: BreadcrumbItem[];
  onOpenNotifications: () => void;
  onNavigateProfile: () => void;
  onLogout?: () => void;
}

export const ClientTopbar: React.FC<ClientTopbarProps> = ({
  client,
  user,
  unreadCount,
  breadcrumbs,
  onOpenNotifications,
  onNavigateProfile,
  onLogout,
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem('cs_portal_theme') as ThemeMode) || 'light';
    }
    return 'light';
  });

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', themeMode);
    }
    localStorage.setItem('cs_portal_theme', themeMode);
  }, [themeMode]);

  return (
    <header className="h-16 sticky top-0 z-20 bg-[var(--surface-card)]/90 backdrop-blur-md border-b border-[var(--surface-border)] px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Zone 1: Mobile Logo & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="md:hidden shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-[#C9A04A]/40 shadow-sm">
          <img
            src="/src/assets/images/logo.png"
            alt="Covenant Shield Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden sm:block min-w-0">
          <ClientBreadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Zone 2: Controls (Theme, Notifications, User) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Theme Mode Toggle Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="p-2 rounded-lg border border-[var(--surface-border)] hover:bg-[var(--surface-bg)] text-[var(--text-main)] transition-colors cursor-pointer"
            title={`Theme: ${themeMode}`}
          >
            {themeMode === 'dark' ? (
              <Moon className="w-4 h-4 text-[#C9A04A]" />
            ) : themeMode === 'light' ? (
              <Sun className="w-4 h-4 text-[#A47F2E]" />
            ) : (
              <Laptop className="w-4 h-4 text-[var(--text-sub)]" />
            )}
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-[var(--surface-card)] rounded-xl shadow-xl border border-[var(--surface-border)] py-1.5 z-50 text-xs">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setThemeMode(mode);
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 capitalize flex items-center justify-between cursor-pointer ${
                    themeMode === mode
                      ? 'text-[#003C35] dark:text-[#C9A04A] font-semibold bg-[var(--emerald-50)] dark:bg-[#0D322D]'
                      : 'text-[var(--text-main)] hover:bg-[var(--surface-bg)]'
                  }`}
                >
                  <span>{mode}</span>
                  {themeMode === mode && <Check className="w-3.5 h-3.5 text-[#1E6B45]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg border border-[var(--surface-border)] hover:bg-[var(--surface-bg)] text-[var(--text-main)] transition-colors cursor-pointer"
          title="Service notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#A12B2B] text-white text-[9px] font-mono-ref font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Concierge Avatar */}
        <button
          type="button"
          onClick={onNavigateProfile}
          className="flex items-center gap-2 p-1.5 rounded-lg border border-[var(--surface-border)] hover:bg-[var(--surface-bg)] transition-colors cursor-pointer text-left"
          title="Account profile and settings"
        >
          <div className="w-7 h-7 rounded-full bg-[#003C35] text-[#C9A04A] flex items-center justify-center font-display text-xs font-bold shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="hidden xl:block min-w-0 pr-1">
            <span className="text-xs font-semibold text-[var(--text-main)] block truncate leading-tight">
              {user.fullName}
            </span>
            <span className="text-[10px] text-[var(--text-sub)] font-mono-ref block truncate leading-tight">
              {user.jobTitle}
            </span>
          </div>
        </button>

        {/* Prominent Portal Logout Button */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-950/20 hover:bg-red-900/40 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-semibold transition-all cursor-pointer shadow-sm ml-1"
            title="Log out of Covenant Shield portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
