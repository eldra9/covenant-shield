import React, { useState, useEffect } from 'react';
import {
  Menu,
  Clock,
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
  RefreshCw,
  LogOut,
  Smartphone,
} from 'lucide-react';
import { AppDownloadModal } from './AppDownloadModal';
import {
  getAttendanceRecords,
  getCases,
  getCurrentUser,
  getServiceRequests,
} from '../../services/store';
import { formatEATTime, nowUTC } from '../../utils/date';
import { AdminBreadcrumbs, BreadcrumbItem } from './AdminBreadcrumbs';
import { AdminTab } from './AdminSidebar';

interface AdminTopbarProps {
  breadcrumbs: BreadcrumbItem[];
  onToggleMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  onNavigate: (tab: AdminTab, recordId?: string) => void;
  onLogout: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  breadcrumbs,
  onToggleMobileSidebar,
  onOpenCommandPalette,
  onNavigate,
  onLogout,
}) => {
  const [currentTimeEAT, setCurrentTimeEAT] = useState<string>('');
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveOnline, setIsLiveOnline] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(() => {
    return (localStorage.getItem('cs_theme') as 'system' | 'light' | 'dark') || 'dark';
  });

  const currentUser = getCurrentUser();
  const websiteLabel =
    currentUser.role === 'super_admin'
      ? 'Super Admin Website'
      : currentUser.role === 'operations_staff'
        ? 'Operations Staff Website'
        : 'Supervisor Website';

  // Urgent notifications count
  const openRequests = getServiceRequests().filter((r) => ['new', 'under_review'].includes(r.status));
  const attendanceExceptions = getAttendanceRecords().filter((a) => a.isException);
  const overdueCases = getCases().filter((c) => c.status !== 'closed' && new Date(c.resolutionDeadline || c.dueDate) < new Date());
  const totalAlertsCount = openRequests.length + attendanceExceptions.length + overdueCases.length;

  // Handle theme change
  const handleSetTheme = (newTheme: 'system' | 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('cs_theme', newTheme);
    setShowThemeMenu(false);

    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  // EAT Clock & Live polling status
  useEffect(() => {
    const updateTime = () => {
      setCurrentTimeEAT(formatEATTime(nowUTC()));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);

    const onVisibilityChange = () => {
      setIsLiveOnline(!document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600); // 600ms spin
  };

  return (
    <header className="h-16 bg-[#092824]/95 backdrop-blur-md border-b border-[#C9A04A]/25 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 text-[#F4F6F4] hover:text-[#C9A04A] hover:bg-[#0D322D] rounded-md transition-colors"
          aria-label="Open mobile navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#C9A04A]/30 bg-[#0D322D] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[#E6CB8A]">
          {websiteLabel}
        </div>

        <AdminBreadcrumbs items={breadcrumbs} />
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="hidden sm:flex flex-1 max-w-xs mx-2">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#A0B2AC] bg-[#071F1C] border border-[#003C35] hover:border-[#C9A04A]/40 rounded-lg transition-colors group shadow-inner"
          aria-label="Search or jump to... (Ctrl+K)"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#C9A04A] group-hover:scale-110 transition-transform" />
            <span>Search or jump to...</span>
          </div>
          <kbd className="text-[10px] font-mono bg-[#0D322D] text-[#C9A04A] px-1.5 py-0.5 rounded border border-[#C9A04A]/20">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Live Pulse, Notifications, Theme */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Live Status Indicator & Refresh */}
        <div className="flex items-center gap-1.5 bg-[#071F1C] border border-[#003C35] px-2.5 py-1 rounded-md text-xs font-mono">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveOnline ? 'bg-[#1E6B45]' : 'bg-[#52625D]'
              }`}
            />
            {isLiveOnline && (
              <span className="absolute w-3.5 h-3.5 rounded-full bg-[#1E6B45]/40 animate-ping" />
            )}
          </div>
          <span className="text-[11px] text-[#A0B2AC]">
            {isLiveOnline ? 'Live' : 'Paused'}
          </span>
          <button
            onClick={handleManualRefresh}
            title="Refresh operations telemetry"
            className={`ml-1 text-[#A0B2AC] hover:text-[#C9A04A] transition-transform ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '600ms' }}
            aria-label="Refresh telemetry data"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Guard Mobile App Download */}
        <button
          onClick={() => setShowDownloadModal(true)}
          title="Download Guard App for Android & iOS"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#E6CB8A] bg-[#071F1C] border border-[#C9A04A]/40 hover:border-[#C9A04A] hover:bg-[#002D28] rounded-md transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#4EBA80]" />
          <span className="hidden sm:inline">Guard App</span>
        </button>

        {/* EAT Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#E6CB8A] bg-[#071F1C] border border-[#003C35] px-2.5 py-1 rounded-md font-mono tabular-nums">
          <Clock className="w-3.5 h-3.5 text-[#C9A04A]" />
          <span>{currentTimeEAT || '12:00 EAT'}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="p-1.5 text-[#A0B2AC] hover:text-[#F4F6F4] hover:bg-[#0D322D] rounded-md transition-colors relative"
            aria-label={`Attention alerts (${totalAlertsCount} urgent items)`}
          >
            <Bell className={`w-4 h-4 ${totalAlertsCount > 0 ? 'text-[#C9A04A] bell-ring' : ''}`} />
            {totalAlertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 px-1 min-w-[14px] text-[9px] font-mono font-bold bg-[#A12B2B] text-white rounded-full text-center">
                {totalAlertsCount}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotificationMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-[#0D322D] border border-[#C9A04A]/30 rounded-xl shadow-2xl z-50 p-3 space-y-2 emboss-card animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#003C35]">
                  <span className="text-xs font-bold text-[#F4F6F4] font-sans">
                    Command Attention Feed
                  </span>
                  <span className="text-[10px] font-mono text-[#C9A04A]">
                    {totalAlertsCount} pending
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                  {openRequests.length > 0 && (
                    <div
                      onClick={() => {
                        setShowNotificationMenu(false);
                        onNavigate('requests');
                      }}
                      className="p-2 bg-[#071F1C] hover:bg-[#123D37] rounded border border-[#003C35] cursor-pointer"
                    >
                      <div className="font-semibold text-[#E6CB8A]">
                        {openRequests.length} Service Request(s) Awaiting Review
                      </div>
                      <div className="text-[11px] text-[#A0B2AC]">Click to inspect and assign survey</div>
                    </div>
                  )}

                  {attendanceExceptions.length > 0 && (
                    <div
                      onClick={() => {
                        setShowNotificationMenu(false);
                        onNavigate('attendance');
                      }}
                      className="p-2 bg-[#071F1C] hover:bg-[#123D37] rounded border border-[#A12B2B]/40 cursor-pointer"
                    >
                      <div className="font-semibold text-[#A12B2B]">
                        {attendanceExceptions.length} Biometric Attendance Exception(s)
                      </div>
                      <div className="text-[11px] text-[#A0B2AC]">Unconfirmed absences & late arrivals</div>
                    </div>
                  )}

                  {overdueCases.length > 0 && (
                    <div
                      onClick={() => {
                        setShowNotificationMenu(false);
                        onNavigate('cases');
                      }}
                      className="p-2 bg-[#071F1C] hover:bg-[#123D37] rounded border border-[#A12B2B]/40 cursor-pointer"
                    >
                      <div className="font-semibold text-[#A12B2B]">
                        {overdueCases.length} Overdue Incident Case(s)
                      </div>
                      <div className="text-[11px] text-[#A0B2AC]">Resolution deadline expired</div>
                    </div>
                  )}

                  {totalAlertsCount === 0 && (
                    <div className="p-4 text-center text-xs text-[#A0B2AC]">
                      No urgent operational exceptions. All systems nominal.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle Menu */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-1.5 text-[#A0B2AC] hover:text-[#F4F6F4] hover:bg-[#0D322D] rounded-md transition-colors"
            title="Appearance Theme"
            aria-label="Appearance Theme"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-[#C9A04A]" /> : theme === 'light' ? <Sun className="w-4 h-4 text-[#C9A04A]" /> : <Laptop className="w-4 h-4" />}
          </button>

          {showThemeMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
              <div className="absolute right-0 mt-2 w-36 bg-[#0D322D] border border-[#003C35] rounded-lg shadow-xl z-50 p-1 text-xs space-y-0.5">
                <button
                  onClick={() => handleSetTheme('dark')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left ${theme === 'dark' ? 'bg-[#003C35] text-[#C9A04A] font-semibold' : 'text-[#A0B2AC] hover:bg-[#071F1C]'}`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark (Default)</span>
                </button>
                <button
                  onClick={() => handleSetTheme('light')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left ${theme === 'light' ? 'bg-[#003C35] text-[#C9A04A] font-semibold' : 'text-[#A0B2AC] hover:bg-[#071F1C]'}`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => handleSetTheme('system')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left ${theme === 'system' ? 'bg-[#003C35] text-[#C9A04A] font-semibold' : 'text-[#A0B2AC] hover:bg-[#071F1C]'}`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>System</span>
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-[#C9A04A]/30 bg-[#0D322D] px-2.5 py-1.5 text-xs font-medium text-[#F4F6F4] transition hover:bg-[#123D37]"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="h-3.5 w-3.5 text-[#C9A04A]" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>

      {/* Mobile App Download Modal */}
      <AppDownloadModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
    </header>
  );
};
