import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Download,
  FileSpreadsheet,
  MapPin,
  ShieldAlert,
  Users,
} from 'lucide-react';
import {
  getAttendanceRecords,
  getCases,
  getCurrentUser,
  getEmployees,
  getServiceRequests,
  getShifts,
  getSites,
  hasPermission,
  recordAudit,
} from '@/services/store';
import { downloadCsv, generateCsv } from '@/utils/csv';
import { formatEATDate, formatEATTime } from '@/utils/date';
import { StatusBadge } from '@/components/admin/StatusBadge';

type ReportType =
  | 'attendance_summary'
  | 'shift_coverage'
  | 'site_staffing'
  | 'request_pipeline'
  | 'complaint_sla'
  | 'operational_exceptions';

export const ReportsPage: React.FC = () => {
  const currentUser = getCurrentUser();
  const canReadReports = hasPermission('reports.read', currentUser);

  const [activeReport, setActiveReport] = useState<ReportType>('attendance_summary');
  const [siteFilter, setSiteFilter] = useState('all');

  const sites = getSites();
  const employees = getEmployees();
  const shifts = getShifts();
  const attendance = getAttendanceRecords();
  const requests = getServiceRequests();
  const cases = getCases();

  // Scoped data filtering
  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => siteFilter === 'all' || a.siteId === siteFilter);
  }, [attendance, siteFilter]);

  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => siteFilter === 'all' || s.siteId === siteFilter);
  }, [shifts, siteFilter]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => siteFilter === 'all' || c.siteId === siteFilter);
  }, [cases, siteFilter]);

  const handleExportCurrentReport = () => {
    if (!canReadReports) return;

    let headers: string[] = [];
    let rows: (string | number | null | undefined)[][] = [];
    let reportFilename = `covenant_shield_report_${activeReport}_${Date.now()}.csv`;

    if (activeReport === 'attendance_summary') {
      headers = ['Date EAT', 'Officer Name', 'Site Facility', 'Scheduled Start', 'Scheduled End', 'Actual Check-In', 'Status', 'Exception Notes'];
      rows = filteredAttendance.map((a) => [
        formatEATDate(a.date),
        a.guardName,
        a.siteName,
        formatEATTime(a.scheduledStart),
        formatEATTime(a.scheduledEnd),
        a.actualCheckIn ? formatEATTime(a.actualCheckIn) : 'No signal',
        a.currentStatus,
        a.exceptionNotes || '',
      ]);
    } else if (activeReport === 'shift_coverage') {
      headers = ['Shift Code', 'Facility', 'Officer', 'Date', 'Start Time', 'End Time', 'Shift Type', 'Status'];
      rows = filteredShifts.map((s) => [
        s.shiftCode,
        s.siteName,
        s.guardName,
        s.date,
        s.startTime,
        s.endTime,
        s.shiftType,
        s.status,
      ]);
    } else if (activeReport === 'site_staffing') {
      headers = ['Site Code', 'Facility Name', 'Contracted Client', 'City', 'Required Guards', 'Status'];
      rows = sites.map((s) => [
        s.siteCode,
        s.name,
        s.clientName,
        s.city,
        s.requiredGuardCount,
        s.status,
      ]);
    } else if (activeReport === 'request_pipeline') {
      headers = ['Reference Number', 'Client Name', 'Service Type', 'Guards Required', 'Target Date', 'Status', 'Quotation KES'];
      rows = requests.map((r) => [
        r.referenceNumber,
        r.clientName,
        r.serviceType,
        r.requiredGuards,
        r.startDate,
        r.status,
        r.quotationAmountKES || 0,
      ]);
    } else if (activeReport === 'complaint_sla') {
      headers = ['Case Number', 'Title', 'Severity', 'Facility', 'Reported By', 'Due Date', 'Status', 'Resolution'];
      rows = filteredCases.map((c) => [
        c.caseNumber,
        c.title,
        c.severity,
        c.siteName,
        c.reportedBy,
        formatEATDate(c.dueDate),
        c.status,
        c.proposedResolution || '',
      ]);
    } else if (activeReport === 'operational_exceptions') {
      const exceptionsOnly = filteredAttendance.filter((a) => a.isException);
      headers = ['Date EAT', 'Officer Name', 'Facility', 'Exception Type', 'Notes', 'Resolution Status'];
      rows = exceptionsOnly.map((a) => [
        formatEATDate(a.date),
        a.guardName,
        a.siteName,
        a.exceptionType || 'late_arrival',
        a.exceptionNotes || '',
        a.currentStatus,
      ]);
    }

    const csvOutput = generateCsv(headers, rows);
    downloadCsv(reportFilename, csvOutput);

    recordAudit(
      'REPORT_EXPORT_CSV',
      'Report',
      activeReport,
      `Exported operational report for ${activeReport} (${rows.length} records)`
    );
  };

  const reportTabs: { id: ReportType; label: string; icon: any }[] = [
    { id: 'attendance_summary', label: 'Attendance Compliance', icon: CheckCircle },
    { id: 'shift_coverage', label: 'Shift Manning & Coverage', icon: Calendar },
    { id: 'site_staffing', label: 'Facility Post Strength', icon: MapPin },
    { id: 'request_pipeline', label: 'Commercial Request Pipeline', icon: FileSpreadsheet },
    { id: 'complaint_sla', label: 'Incident SLA & Resolution', icon: ShieldAlert },
    { id: 'operational_exceptions', label: 'Exceptions & Audit Log', icon: BarChart3 },
  ];

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 tracking-tight">
            Operational Intelligence & Export Suite
          </h2>
          <p className="text-xs text-slate-400">
            Generate certified operations reports, compliance records, and formula-safe CSV data exports.
          </p>
        </div>

        <button
          onClick={handleExportCurrentReport}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Scoped CSV (Formula Protected)</span>
        </button>
      </div>

      {/* Report Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${
                isActive
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scope filter toolbar */}
      <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">Facility Scope:</span>
          <select
            value={siteFilter}
            aria-label="Filter report by facility"
            onChange={(e) => setSiteFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-200"
          >
            <option value="all">All Authorized Installations ({sites.length} sites)</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.siteCode})
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          Timezone: East Africa Time (UTC+3)
        </span>
      </div>

      {/* Active Report Preview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider">
            Report Data Preview
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Covenant Shield Security Intelligence
          </span>
        </div>

        <div className="p-4 overflow-x-auto">
          {activeReport === 'attendance_summary' && (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  <th className="py-2 px-3">Date (EAT)</th>
                  <th className="py-2 px-3">Officer Name</th>
                  <th className="py-2 px-3">Facility</th>
                  <th className="py-2 px-3">Window (EAT)</th>
                  <th className="py-2 px-3">Check-In</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredAttendance.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2.5 px-3 font-mono">{formatEATDate(a.date)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-100">{a.guardName}</td>
                    <td className="py-2.5 px-3">{a.siteName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {formatEATTime(a.scheduledStart)} – {formatEATTime(a.scheduledEnd)}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {a.actualCheckIn ? formatEATTime(a.actualCheckIn) : '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={a.currentStatus} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'shift_coverage' && (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  <th className="py-2 px-3">Shift Ref</th>
                  <th className="py-2 px-3">Site</th>
                  <th className="py-2 px-3">Officer</th>
                  <th className="py-2 px-3">Hours (EAT)</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredShifts.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5 px-3 font-mono font-medium text-amber-400">{s.shiftCode}</td>
                    <td className="py-2.5 px-3">{s.siteName}</td>
                    <td className="py-2.5 px-3 font-semibold">{s.guardName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{s.startTime} – {s.endTime}</td>
                    <td className="py-2.5 px-3 capitalize">{s.shiftType.replace('_', ' ')}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={s.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'complaint_sla' && (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  <th className="py-2 px-3">Case Number</th>
                  <th className="py-2 px-3">Incident Title</th>
                  <th className="py-2 px-3">Severity</th>
                  <th className="py-2 px-3">Facility</th>
                  <th className="py-2 px-3">Resolution Target</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredCases.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-mono font-medium text-amber-400">{c.caseNumber}</td>
                    <td className="py-2.5 px-3 font-semibold">{c.title}</td>
                    <td className="py-2.5 px-3 uppercase font-mono text-[11px]">{c.severity}</td>
                    <td className="py-2.5 px-3">{c.siteName}</td>
                    <td className="py-2.5 px-3 font-mono">{formatEATDate(c.dueDate)}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={c.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'site_staffing' && (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  <th className="py-2 px-3">Site Code</th>
                  <th className="py-2 px-3">Installation</th>
                  <th className="py-2 px-3">Client</th>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3">Required Officers</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {sites.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5 px-3 font-mono font-medium">{s.siteCode}</td>
                    <td className="py-2.5 px-3 font-semibold">{s.name}</td>
                    <td className="py-2.5 px-3">{s.clientName}</td>
                    <td className="py-2.5 px-3">{s.city}</td>
                    <td className="py-2.5 px-3 font-mono">{s.requiredGuardCount} Post Guards</td>
                    <td className="py-2.5 px-3"><StatusBadge status={s.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'request_pipeline' && (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  <th className="py-2 px-3">Reference</th>
                  <th className="py-2 px-3">Client</th>
                  <th className="py-2 px-3">Service</th>
                  <th className="py-2 px-3">Post Guards</th>
                  <th className="py-2 px-3">Quotation (KES)</th>
                  <th className="py-2 px-3">Pipeline Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-3 font-mono font-medium">{r.referenceNumber}</td>
                    <td className="py-2.5 px-3 font-semibold">{r.clientName}</td>
                    <td className="py-2.5 px-3 capitalize">{r.serviceType.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 px-3 font-mono">{r.requiredGuards}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">
                      {r.quotationAmountKES ? `KES ${r.quotationAmountKES.toLocaleString()}` : 'Pending Quote'}
                    </td>
                    <td className="py-2.5 px-3"><StatusBadge status={r.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'operational_exceptions' && (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  <th className="py-2 px-3">Date (EAT)</th>
                  <th className="py-2 px-3">Officer</th>
                  <th className="py-2 px-3">Facility</th>
                  <th className="py-2 px-3">Exception Cause</th>
                  <th className="py-2 px-3">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredAttendance.filter((a) => a.isException).map((a) => (
                  <tr key={a.id}>
                    <td className="py-2.5 px-3 font-mono">{formatEATDate(a.date)}</td>
                    <td className="py-2.5 px-3 font-semibold">{a.guardName}</td>
                    <td className="py-2.5 px-3">{a.siteName}</td>
                    <td className="py-2.5 px-3 text-rose-300">{a.exceptionNotes || 'Unexcused deviation'}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={a.currentStatus} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
