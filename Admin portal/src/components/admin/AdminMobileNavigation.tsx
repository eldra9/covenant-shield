import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  ClockAlert,
  ShieldAlert,
  Menu,
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';
import { getAttendanceRecords, getCases, getServiceRequests } from '@/services/store';

interface AdminMobileNavigationProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onOpenFullMenu: () => void;
}

export const AdminMobileNavigation: React.FC<AdminMobileNavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenFullMenu,
}) => {
  const exceptionsCount = getAttendanceRecords().filter((a) => a.isException).length;
  const openRequestsCount = getServiceRequests().filter((r) => ['new', 'under_review'].includes(r.status)).length;
  const activeCasesCount = getCases().filter((c) => c.status !== 'closed').length;

  const quickNav = [
    { id: 'dashboard' as AdminTab, label: 'Command', icon: LayoutDashboard },
    { id: 'requests' as AdminTab, label: 'Requests', icon: ClipboardList, badge: openRequestsCount },
    { id: 'shifts' as AdminTab, label: 'Shifts', icon: CalendarDays },
    { id: 'attendance' as AdminTab, label: 'Attendance', icon: ClockAlert, badge: exceptionsCount },
    { id: 'cases' as AdminTab, label: 'Cases', icon: ShieldAlert, badge: activeCasesCount },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-slate-950/95 backdrop-blur-md border-t border-emerald-950/80 px-2 py-1.5 flex items-center justify-around"
      aria-label="Mobile Navigation Bar"
    >
      {quickNav.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-md transition-colors relative ${
              isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 px-1 text-[9px] font-mono font-bold bg-rose-500 text-white rounded-full min-w-[14px] text-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenFullMenu}
        className="flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-md text-slate-400 hover:text-slate-200"
        aria-label="More navigation modules"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Menu</span>
      </button>
    </nav>
  );
};
