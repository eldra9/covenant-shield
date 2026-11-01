import React, { useState, useEffect } from 'react';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { BreadcrumbItem } from '../components/admin/AdminBreadcrumbs';
import { PermissionGate } from '../components/admin/PermissionGate';
import { CommandPalette } from '../components/admin/CommandPalette';
import { ToastContainer } from '../components/admin/ToastSystem';
import { getCurrentUser, subscribe } from '../services/store';

// Feature Pages
import { AdminDashboardPage } from '../features/admin/dashboard/pages/AdminDashboardPage';
import { RequestListPage } from '../features/admin/service-requests/pages/RequestListPage';
import { RequestDetailPage } from '../features/admin/service-requests/pages/RequestDetailPage';
import { ClientListPage } from '../features/admin/clients/pages/ClientListPage';
import { ClientDetailPage } from '../features/admin/clients/pages/ClientDetailPage';
import { SiteListPage } from '../features/admin/sites/pages/SiteListPage';
import { SiteDetailPage } from '../features/admin/sites/pages/SiteDetailPage';
import { EmployeeListPage } from '../features/admin/employees/pages/EmployeeListPage';
import { EmployeeDetailPage } from '../features/admin/employees/pages/EmployeeDetailPage';
import { ShiftListPage } from '../features/admin/scheduling/pages/ShiftListPage';
import { AttendanceListPage } from '../features/admin/attendance/pages/AttendanceListPage';
import { AttendanceDetailPage } from '../features/admin/attendance/pages/AttendanceDetailPage';
import { CaseListPage } from '../features/admin/cases/pages/CaseListPage';
import { CaseDetailPage } from '../features/admin/cases/pages/CaseDetailPage';
import { ReportsPage } from '../features/admin/reports/pages/ReportsPage';
import { UserManagementPage } from '../features/admin/users/pages/UserManagementPage';
import { AuditLogPage } from '../features/admin/audit/pages/AuditLogPage';
import { SettingsPage } from '../features/admin/settings/pages/SettingsPage';
import { AdminTestsPage } from '../features/admin/tests/pages/AdminTestsPage';
import { AdminMobileNavigation } from '../components/admin/AdminMobileNavigation';

interface AdminLayoutProps {
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  const [, setTick] = useState(0);

  // Subscribe to store updates (role changes, data additions, reset)
  useEffect(() => {
    return subscribe(() => setTick((t) => t + 1));
  }, []);

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // BootSequence once per session
  useEffect(() => {
    try {
      const booted = sessionStorage.getItem('cs_command_booted');
      if (!booted) {
        sessionStorage.setItem('cs_command_booted', 'true');
        const fx = document.documentElement.getAttribute('data-fx');
        if (fx !== 'off' && fx !== 'lite') {
          document.body.classList.add('booting');
          setTimeout(() => {
            document.body.classList.remove('booting');
          }, 1400);
        }
      }
    } catch (e) {
      // sessionStorage sandbox fallback
    }

    const handleCustomOpen = () => setIsCommandPaletteOpen(true);
    window.addEventListener('covenant:open-command', handleCustomOpen);
    return () => window.removeEventListener('covenant:open-command', handleCustomOpen);
  }, []);

  const currentUser = getCurrentUser();

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setSelectedEntityId(null);
  };

  const handleNavigate = (tab: AdminTab, recordId?: string) => {
    setActiveTab(tab);
    setSelectedEntityId(recordId || null);
  };

  // Build breadcrumbs dynamically
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const list: BreadcrumbItem[] = [
      {
        label: 'Command Centre',
        onClick: () => handleSelectTab('dashboard'),
      },
    ];

    const tabLabels: Record<AdminTab, string> = {
      dashboard: 'Command Center',
      clients: 'Client Accounts',
      sites: 'Security Sites',
      employees: 'Staff & Guards',
      requests: 'Service Requests',
      cases: 'Complaints & Incidents',
      attendance: 'Attendance',
      shifts: 'Rosters & Shifts',
      reports: 'Reports & Analytics',
      users: 'User Accounts',
      'audit-log': 'Audit Trail',
      settings: 'System Settings',
      tests: 'Acceptance Tests',
    };

    if (activeTab === 'dashboard') {
      return list;
    }

    list.push({
      label: tabLabels[activeTab] || activeTab,
      onClick: selectedEntityId ? () => setSelectedEntityId(null) : undefined,
    });

    if (selectedEntityId) {
      list.push({
        label: selectedEntityId,
      });
    }

    return list;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <PermissionGate permission="dashboard.read">
            <AdminDashboardPage onNavigate={handleNavigate} />
          </PermissionGate>
        );

      case 'requests':
        return (
          <PermissionGate permission="requests.read">
            {selectedEntityId ? (
              <RequestDetailPage
                requestId={selectedEntityId}
                onBack={() => setSelectedEntityId(null)}
                onSelectSite={(sId) => handleNavigate('sites', sId)}
                onSelectClient={(cId) => handleNavigate('clients', cId)}
              />
            ) : (
              <RequestListPage onSelectRequest={(id) => setSelectedEntityId(id)} />
            )}
          </PermissionGate>
        );

      case 'clients':
        return (
          <PermissionGate permission="clients.read">
            {selectedEntityId ? (
              <ClientDetailPage
                clientId={selectedEntityId}
                onBack={() => setSelectedEntityId(null)}
                onSelectSite={(sId) => handleNavigate('sites', sId)}
                onSelectRequest={(rId) => handleNavigate('requests', rId)}
              />
            ) : (
              <ClientListPage onSelectClient={(id) => setSelectedEntityId(id)} />
            )}
          </PermissionGate>
        );

      case 'sites':
        return (
          <PermissionGate permission="sites.read">
            {selectedEntityId ? (
              <SiteDetailPage
                siteId={selectedEntityId}
                onBack={() => setSelectedEntityId(null)}
                onSelectShift={(shId) => handleNavigate('shifts', shId)}
                onSelectCase={(cId) => handleNavigate('cases', cId)}
              />
            ) : (
              <SiteListPage onSelectSite={(id) => setSelectedEntityId(id)} />
            )}
          </PermissionGate>
        );

      case 'employees':
        return (
          <PermissionGate permission="employees.read">
            {selectedEntityId ? (
              <EmployeeDetailPage
                employeeId={selectedEntityId}
                onBack={() => setSelectedEntityId(null)}
                onSelectSite={(sId) => handleNavigate('sites', sId)}
              />
            ) : (
              <EmployeeListPage onSelectEmployee={(id) => setSelectedEntityId(id)} />
            )}
          </PermissionGate>
        );

      case 'shifts':
        return (
          <PermissionGate permission="shifts.read">
            <ShiftListPage onSelectSite={(sId) => handleNavigate('sites', sId)} />
          </PermissionGate>
        );

      case 'attendance':
        return (
          <PermissionGate permission="attendance.read">
            {selectedEntityId ? (
              <AttendanceDetailPage
                attendanceId={selectedEntityId}
                onBack={() => setSelectedEntityId(null)}
              />
            ) : (
              <AttendanceListPage onSelectAttendance={(id) => setSelectedEntityId(id)} />
            )}
          </PermissionGate>
        );

      case 'cases':
        return (
          <PermissionGate permission="cases.read">
            {selectedEntityId ? (
              <CaseDetailPage
                caseId={selectedEntityId}
                onBack={() => setSelectedEntityId(null)}
                onSelectSite={(sId) => handleNavigate('sites', sId)}
              />
            ) : (
              <CaseListPage onSelectCase={(id) => setSelectedEntityId(id)} />
            )}
          </PermissionGate>
        );

      case 'reports':
        return (
          <PermissionGate permission="reports.read">
            <ReportsPage />
          </PermissionGate>
        );

      case 'users':
        return (
          <PermissionGate permission="users.manage">
            <UserManagementPage />
          </PermissionGate>
        );

      case 'audit-log':
        return (
          <PermissionGate permission="audit.read">
            <AuditLogPage />
          </PermissionGate>
        );

      case 'settings':
        return (
          <PermissionGate permission="settings.manage">
            <SettingsPage />
          </PermissionGate>
        );

      case 'tests':
        return (
          <PermissionGate permission="dashboard.read">
            <AdminTestsPage />
          </PermissionGate>
        );

      default:
        return <AdminDashboardPage onNavigate={handleNavigate} />;
    }
  };

  const mainPaddingLeftClass = isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[264px]';

  return (
    <div className="min-h-screen bg-[#090A0D] text-[#F5F5F5] flex flex-col font-sans transition-colors duration-200">
      {/* WCAG 2.1 Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 bg-[#C9A04A] text-[#092824] font-semibold px-3 py-1.5 rounded shadow-lg text-xs"
      >
        Skip to main operations content
      </a>

      {/* Collapsible Sidebar (264px / 72px) */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`${mainPaddingLeftClass} flex flex-col flex-1 min-h-screen transition-all duration-240 ease-[var(--e-silk)]`}>
        <AdminTopbar
          breadcrumbs={getBreadcrumbs()}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onNavigate={handleNavigate}
          onLogout={onLogout}
        />

        <main
          id="main-content"
          className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1440px] w-full mx-auto"
        >
          {renderContent()}
        </main>

        {/* Quiet Minimal Footer */}
        <footer className="border-t border-[#003C35] bg-[#071F1C] px-6 py-4 text-center text-xs text-[#52625D] font-mono mb-14 lg:mb-0">
          Covenant Shield Command · Operations Centre & Guard Force Administration System · East Africa Time (UTC+3)
        </footer>
      </div>

      {/* Mobile Bottom Navigation Touch Bar */}
      <AdminMobileNavigation
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenFullMenu={() => setIsMobileSidebarOpen(true)}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Optimistic Updates Toast Container with Undo & Rollback */}
      <ToastContainer />
    </div>
  );
};
