import React, { useState } from 'react';
import { Bell, CheckCircle2, ShieldAlert, ClockAlert, ClipboardList, Check, Trash2 } from 'lucide-react';
import { getAttendanceRecords, getCases, getServiceRequests } from '@/services/store';
import { formatEAT } from '@/utils/date';
import { AdminTab } from '@/components/admin/AdminSidebar';
import { GuillocheSeal } from '@/components/admin/GuillocheSeal';

interface NotificationsPageProps {
  onNavigate: (tab: AdminTab, recordId?: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const requests = getServiceRequests().filter((r) => ['new', 'under_review'].includes(r.status));
  const exceptions = getAttendanceRecords().filter((a) => a.isException);
  const overdueCases = getCases().filter((c) => c.status !== 'closed' && new Date(c.resolutionDeadline || c.dueDate) < new Date());

  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const allAlerts = [
    ...requests.map((r) => ({
      id: `req-${r.id}`,
      type: 'request',
      title: `Service Intake: ${r.requestCode || r.referenceNumber} (${r.clientName})`,
      message: `Client requested ${r.requiredGuards} guard(s) for ${r.serviceType.replace(/_/g, ' ')}. Initial survey awaiting dispatch.`,
      time: r.createdAt,
      severity: 'info',
      tab: 'requests' as AdminTab,
      recordId: r.id,
    })),
    ...exceptions.map((a) => ({
      id: `att-${a.id}`,
      type: 'attendance',
      title: `Attendance Anomaly: ${a.guardName} (${a.siteName})`,
      message: a.exceptionNotes || 'Biometric signal unconfirmed during scheduled gate deployment window.',
      time: a.scheduledStart,
      severity: 'warning',
      tab: 'attendance' as AdminTab,
      recordId: a.id,
    })),
    ...overdueCases.map((c) => {
      const code = c.caseCode || c.caseNumber;
      const deadline = c.resolutionDeadline || c.dueDate;
      return {
        id: `case-${c.id}`,
        type: 'case',
        title: `Overdue SLA Incident: ${code} (${c.title})`,
        message: `Resolution deadline of ${formatEAT(deadline)} has elapsed without documented closure.`,
        time: deadline,
        severity: 'danger',
        tab: 'cases' as AdminTab,
        recordId: c.id,
      };
    }),
  ].filter((a) => !dismissedIds.includes(a.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#003C35] pb-4">
        <div>
          <h1 className="text-[1.75rem] font-display font-bold text-[#F4F6F4] tracking-tight">
            Command Notifications
          </h1>
          <p className="text-xs text-[#A0B2AC]">
            Operational alert feed, biometric exception broadcasts, and system notifications.
          </p>
        </div>

        {allAlerts.length > 0 && (
          <button
            onClick={() => setDismissedIds(allAlerts.map((a) => a.id))}
            className="px-3 py-1.5 text-xs font-mono text-[#C9A04A] bg-[#071F1C] border border-[#003C35] rounded hover:border-[#C9A04A]/40 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {allAlerts.length === 0 ? (
        <div className="p-12 text-center bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl emboss-card flex flex-col items-center justify-center space-y-3">
          <GuillocheSeal size={100} theme="dark" />
          <h3 className="text-base font-display font-bold text-[#F4F6F4]">
            No unread notifications
          </h3>
          <p className="text-xs text-[#A0B2AC] max-w-sm mx-auto">
            All duty shifts, gate telemetry signals, and incident SLAs are in compliance.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl emboss-card flex items-start justify-between gap-4 hover:bg-[#123D37]/50 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    alert.severity === 'danger'
                      ? 'bg-[#A12B2B]/20 text-[#A12B2B] border border-[#A12B2B]/40'
                      : alert.severity === 'warning'
                      ? 'bg-[#8A5A00]/20 text-[#C9A04A] border border-[#8A5A00]/40'
                      : 'bg-[#1D4E89]/20 text-[#1D4E89] border border-[#1D4E89]/40'
                  }`}
                >
                  {alert.type === 'case' && <ShieldAlert className="w-4 h-4" />}
                  {alert.type === 'attendance' && <ClockAlert className="w-4 h-4" />}
                  {alert.type === 'request' && <ClipboardList className="w-4 h-4" />}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-bold text-[#F4F6F4] font-sans flex items-center gap-2">
                    <span>{alert.title}</span>
                    <span className="text-[10px] font-mono text-[#52625D]">
                      {formatEAT(alert.time)}
                    </span>
                  </div>
                  <p className="text-xs text-[#A0B2AC] leading-relaxed">
                    {alert.message}
                  </p>
                  <button
                    onClick={() => onNavigate(alert.tab, alert.recordId)}
                    className="text-xs font-mono text-[#C9A04A] hover:underline pt-1 inline-block"
                  >
                    Inspect in {alert.tab} →
                  </button>
                </div>
              </div>

              <button
                onClick={() => setDismissedIds((prev) => [...prev, alert.id])}
                className="p-1.5 text-[#52625D] hover:text-[#F4F6F4] rounded transition-colors shrink-0"
                title="Dismiss notification"
                aria-label="Dismiss notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
