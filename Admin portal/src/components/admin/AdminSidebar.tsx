import React, { useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  MapPin,
  Users2,
  CalendarDays,
  ClockAlert,
  ShieldAlert,
  BarChart3,
  UserCog,
  KeyRound,
  History,
  Sliders,
  ChevronRight,
  Shield,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  Compass,
  ShieldCheck,
  UserCheck,
  Briefcase,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { BRAND_ASSETS } from '../../services/mockData';
import { Permission, Role } from '../../types';
import {
  getAttendanceRecords,
  getCases,
  getCurrentUser,
  getServiceRequests,
  hasPermission,
} from '../../services/store';

export type AdminTab =
  | 'dashboard'
  | 'clients'
  | 'sites'
  | 'employees'
  | 'requests'
  | 'cases'
  | 'attendance'
  | 'shifts'
  | 'reports'
  | 'users'
  | 'audit-log'
  | 'settings'
  | 'tests';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  badge?: () => number;
  badgeColor?: string;
  supervisorOnly?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const currentUser = getCurrentUser();
  const isSupervisor = currentUser.role === 'supervisor' || (currentUser.role as string) === 'field_supervisor';

  const openRequestsCount = () => {
    return getServiceRequests().filter((r) => ['new', 'under_review'].includes(r.status)).length;
  };

  const attendanceExceptionsCount = () => {
    return getAttendanceRecords().filter((a) => a.isException).length;
  };

  const activeCasesCount = () => {
    return getCases().filter((c) => ['submitted', 'assigned', 'in_progress'].includes(c.status)).length;
  };

  // Nav items based on role specifications
  const getNavSections = () => {
    if (isSupervisor) {
      return [
        {
          section: 'SUPERVISOR DISPATCH',
          items: [
            {
              id: 'dashboard' as AdminTab,
              label: 'Command Overview',
              icon: LayoutDashboard,
              permission: 'dashboard.read' as Permission,
            },
            {
              id: 'sites' as AdminTab,
              label: 'My Sites',
              icon: MapPin,
              permission: 'sites.read' as Permission,
            },
            {
              id: 'shifts' as AdminTab,
              label: 'Roster Schedule',
              icon: CalendarDays,
              permission: 'shifts.read' as Permission,
            },
            {
              id: 'attendance' as AdminTab,
              label: 'Attendance Exceptions',
              icon: ClockAlert,
              permission: 'attendance.read' as Permission,
              badge: attendanceExceptionsCount,
              badgeColor: 'bg-[#A12B2B]/20 text-[#FBE9E9] border-[#A12B2B]/40',
            },
            {
              id: 'cases' as AdminTab,
              label: 'Incidents & Cases',
              icon: ShieldAlert,
              permission: 'cases.read' as Permission,
              badge: activeCasesCount,
              badgeColor: 'bg-[#1D4E89]/20 text-[#E8F0FA] border-[#1D4E89]/40',
            },
          ],
        },
      ];
    }

    return [
      {
        section: 'OPERATIONS',
        items: [
          {
            id: 'dashboard' as AdminTab,
            label: 'Command Center',
            icon: Compass,
            permission: 'dashboard.read' as Permission,
          },
          {
            id: 'sites' as AdminTab,
            label: 'Security Sites',
            icon: MapPin,
            permission: 'sites.read' as Permission,
          },
          {
            id: 'employees' as AdminTab,
            label: 'Staff & Guards',
            icon: Users2,
            permission: 'employees.read' as Permission,
          },
          {
            id: 'attendance' as AdminTab,
            label: 'Attendance',
            icon: ClockAlert,
            permission: 'attendance.read' as Permission,
            badge: attendanceExceptionsCount,
            badgeColor: 'bg-[#A12B2B]/20 text-[#FBE9E9] border-[#A12B2B]/40',
          },
          {
            id: 'shifts' as AdminTab,
            label: 'Rosters & Shifts',
            icon: CalendarDays,
            permission: 'shifts.read' as Permission,
          },
          {
            id: 'requests' as AdminTab,
            label: 'Service Requests',
            icon: ClipboardList,
            permission: 'requests.read' as Permission,
            badge: openRequestsCount,
            badgeColor: 'bg-[#C9A04A]/20 text-[#E6CB8A] border-[#C9A04A]/40',
          },
          {
            id: 'cases' as AdminTab,
            label: 'Complaints & Incidents',
            icon: ShieldAlert,
            permission: 'cases.read' as Permission,
            badge: activeCasesCount,
            badgeColor: 'bg-[#1D4E89]/20 text-[#E8F0FA] border-[#1D4E89]/40',
          },
          {
            id: 'reports' as AdminTab,
            label: 'Reports & Analytics',
            icon: BarChart3,
            permission: 'reports.read' as Permission,
          },
        ],
      },
      {
        section: 'MANAGEMENT',
        items: [
          {
            id: 'clients' as AdminTab,
            label: 'Client Accounts',
            icon: Building2,
            permission: 'clients.read' as Permission,
          },
          {
            id: 'users' as AdminTab,
            label: 'User Accounts',
            icon: UserCog,
            permission: 'users.manage' as Permission,
          },
          {
            id: 'audit-log' as AdminTab,
            label: 'Audit Trail',
            icon: History,
            permission: 'audit.read' as Permission,
          },
          {
            id: 'settings' as AdminTab,
            label: 'System Settings',
            icon: Sliders,
            permission: 'settings.manage' as Permission,
          },
        ],
      },
    ];
  };

  const navSections = getNavSections();
  const sidebarWidthClass = isCollapsed ? 'w-[72px]' : 'w-[264px]';

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#003C35] border-r border-[#C9A04A]/25 flex flex-col transition-all duration-240 ease-[var(--e-silk)] lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 w-[264px]' : '-translate-x-full lg:translate-x-0'
        } ${sidebarWidthClass}`}
        aria-label="Covenant Shield Command Navigation"
      >
        {/* Brand Header with Official Crest */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#0B5247] bg-[#002D28]">
          <div className="flex items-center gap-3 min-w-0">
            {/* White Plate for official crest legibility */}
            <div className="w-10 h-10 rounded-md overflow-hidden border border-[#C9A04A] shadow-md flex items-center justify-center shrink-0">
              <img
                src={BRAND_ASSETS.logoUrl}
                alt="Covenant Shield Crest"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight text-[#FFFFFF] truncate font-sans">
                  COVENANT SHIELD
                </span>
                <span className="text-[10px] tracking-widest text-[#E6CB8A] font-mono uppercase truncate">
                  Command Centre
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && !isOpenMobile && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1 text-[#A0B2AC] hover:text-[#FFFFFF] rounded hover:bg-[#0B5247] transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
          {navSections.map((group, gIdx) => {
            const visibleItems = group.items.filter((item) => {
              if (!item.permission) return true;
              return hasPermission(item.permission, currentUser);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-semibold tracking-widest text-[#E6CB8A]/80 uppercase font-mono mb-1">
                    {group.section}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  const count = item.badge ? item.badge() : 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full relative flex items-center ${
                        isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                      } py-2.5 text-xs font-medium rounded-md transition-all duration-200 group ${
                        isActive
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-[#E6EFEC] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {/* 3px Gold Bar that slides between active items (240ms) */}
                      {isActive && (
                        <div
                          className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#C9A04A] rounded-r transition-all duration-240 ease-[var(--e-silk)] shadow-[0_0_8px_#C9A04A]"
                        />
                      )}

                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-[#E6CB8A]' : 'text-[#A0B2AC] group-hover:text-white'
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate whitespace-nowrap">{item.label}</span>
                        )}
                      </div>

                      {!isCollapsed && count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full border font-mono tabular-nums ${
                            item.badgeColor || 'bg-[#002D28] text-white border-[#C9A04A]/30'
                          }`}
                        >
                          {count}
                        </span>
                      )}

                      {isCollapsed && count > 0 && (
                        <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#A12B2B]" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-3 border-t border-[#0B5247] bg-[#002D28]">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
            <div className="w-8 h-8 rounded-full bg-[#0B5247] border border-[#C9A04A]/40 overflow-hidden shrink-0 flex items-center justify-center">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Shield className="w-4 h-4 text-[#C9A04A]" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-[#E6CB8A] font-mono uppercase truncate">
                  {currentUser.role.replace(/_/g, ' ')}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
