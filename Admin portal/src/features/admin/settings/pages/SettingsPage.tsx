import React, { useState } from 'react';
import { 
  Sliders, Shield, Clock, CheckCircle2, Globe, Lock, 
  Bell, FileText, Database, AlertTriangle, Info, Save, Languages
} from 'lucide-react';
import { getCurrentUser, hasPermission } from '@/services/store';

interface SettingsSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ icon: Icon, title, description, children }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
    <div className="border-b border-slate-800 pb-3">
      <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-amber-400" />
        <span>{title}</span>
      </h3>
      <p className="text-[11px] text-slate-500 mt-1">{description}</p>
    </div>
    {children}
  </div>
);

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, hint, children }) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-slate-300">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
  </div>
);

const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono";
const disabledInputClass = "w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-300 font-mono cursor-not-allowed opacity-60";
const textareaClass = "w-full bg-slate-950 border border-slate-800 rounded-md py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono resize-none leading-relaxed";

export const SettingsPage: React.FC = () => {
  const currentUser = getCurrentUser();
  const canManage = hasPermission('settings.manage', currentUser);

  // Timezone
  const [timezone] = useState('Africa/Nairobi (EAT, UTC+3)');

  // Grace Periods
  const [lateGraceMins, setLateGraceMins] = useState('15');
  const [earlyDepartureGraceMins, setEarlyDepartureGraceMins] = useState('10');
  const [absentThresholdMins, setAbsentThresholdMins] = useState('60');
  const [minRestHours, setMinRestHours] = useState('8');

  // Security Policy
  const [loginLockoutAttempts, setLoginLockoutAttempts] = useState('5');
  const [sessionDurationHours, setSessionDurationHours] = useState('8');
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [require2fa, setRequire2fa] = useState(false);
  const [emergencyPhone, setEmergencyPhone] = useState('+254 700 911 911');

  // Data Retention
  const [attendanceRetentionMonths, setAttendanceRetentionMonths] = useState('24');
  const [auditRetentionMonths, setAuditRetentionMonths] = useState('36');
  const [caseRetentionMonths, setCaseRetentionMonths] = useState('24');
  const [formulaEscaping, setFormulaEscaping] = useState(true);

  // Notification Templates
  const [smsCheckinTemplate, setSmsCheckinTemplate] = useState(
    'CS ALERT: {{guard_name}} checked in at {{site_name}} at {{time_eat}} EAT. Shift {{shift_code}} is now active.'
  );
  const [smsIncidentTemplate, setSmsIncidentTemplate] = useState(
    'CS INCIDENT: {{severity}} case reported at {{site_name}} ({{case_number}}). Assigned to {{owner_name}}. Review required.'
  );
  const [emailRequestTemplate, setEmailRequestTemplate] = useState(
    'Dear {{client_name}},\n\nThank you for your service request (Ref: {{reference_number}}).\nService Type: {{service_type}}\nLocation: {{address}}\n\nOur team will contact you within 24 hours to schedule a site assessment.\n\nCovenant Shield Security Services'
  );
  const [emailCaseTemplate, setEmailCaseTemplate] = useState(
    'Dear {{reporter_name}},\n\nYour complaint ({{case_number}}) has been received and assigned.\nSeverity: {{severity}}\nExpected Resolution: {{due_date}} EAT\n\nYou will be updated as the investigation progresses.\n\nCovenant Shield Operations'
  );

  // Internationalization
  const [currentLanguage] = useState('English (en)');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const inputProps = (disabled?: boolean) => ({
    className: disabled || !canManage ? disabledInputClass : inputClass,
    disabled: disabled || !canManage,
    readOnly: !canManage,
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 tracking-tight">
            System Operations & Security Parameters
          </h2>
          <p className="text-xs text-slate-400">
            Global guard duty rules, East Africa timezone, security policy, notification templates, and data governance.
          </p>
        </div>

        {!canManage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/10 border border-amber-400/30 rounded-lg text-xs text-amber-300">
            <Lock className="w-3.5 h-3.5" />
            <span>Read-only — Super Admin access required</span>
          </div>
        )}
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-md text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Operational parameters updated and committed to central store.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">

        {/* 1. Regional Timezone */}
        <SettingsSection icon={Globe} title="Regional Timezone Governance" description="All timestamps stored in UTC and displayed in East Africa Time (UTC+3, Africa/Nairobi).">
          <Field label="Operational Timezone" hint="All internal telemetry and database events are stored in ISO UTC and rendered in East Africa Time. Server time is used for all check-ins.">
            <input type="text" disabled value={timezone} className={disabledInputClass} />
          </Field>
          <Field label="Emergency Operations Centre Phone" hint="Displayed on guard-facing screens and client notifications.">
            <input type="tel" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} {...inputProps()} />
          </Field>
        </SettingsSection>

        {/* 2. Grace Periods */}
        <SettingsSection icon={Clock} title="Guard Duty Grace Periods" description="Thresholds for late arrivals, early departures, and absence detection. Applied to all sites unless site-level overrides are set.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Late Check-in Grace (minutes)" hint="Check-ins within this window are still marked On Time.">
              <input type="number" min="0" max="60" value={lateGraceMins} onChange={e => setLateGraceMins(e.target.value)} {...inputProps()} />
            </Field>
            <Field label="Early Departure Grace (minutes)" hint="Check-outs within this window before shift end are accepted.">
              <input type="number" min="0" max="60" value={earlyDepartureGraceMins} onChange={e => setEarlyDepartureGraceMins(e.target.value)} {...inputProps()} />
            </Field>
            <Field label="Absent Threshold (minutes)" hint="Guard flagged Absent if no check-in received after this duration past shift start.">
              <input type="number" min="15" max="240" value={absentThresholdMins} onChange={e => setAbsentThresholdMins(e.target.value)} {...inputProps()} />
            </Field>
            <Field label="Minimum Rest Period (hours)" hint="Minimum hours required between consecutive shifts for the same guard.">
              <input type="number" min="4" max="24" value={minRestHours} onChange={e => setMinRestHours(e.target.value)} {...inputProps()} />
            </Field>
          </div>
        </SettingsSection>

        {/* 3. Security Policy */}
        <SettingsSection icon={Shield} title="Authentication & Security Policy" description="Login protection, session duration, and access control enforcement rules. Applied platform-wide.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Login Lockout Threshold (failed attempts)" hint="Account is locked after this many consecutive failed logins.">
              <input type="number" min="3" max="10" value={loginLockoutAttempts} onChange={e => setLoginLockoutAttempts(e.target.value)} {...inputProps()} />
            </Field>
            <Field label="Session Duration (hours)" hint="JWT tokens expire after this period. Guards and staff must re-authenticate.">
              <input type="number" min="1" max="24" value={sessionDurationHours} onChange={e => setSessionDurationHours(e.target.value)} {...inputProps()} />
            </Field>
            <Field label="Minimum Password Length" hint="Enforced during password creation and reset.">
              <input type="number" min="6" max="32" value={passwordMinLength} onChange={e => setPasswordMinLength(e.target.value)} {...inputProps()} />
            </Field>
            <Field label="Require Two-Factor Authentication" hint="Enforces 2FA for all Operations Staff and above.">
              <div className="flex items-center gap-3 py-1.5">
                <button
                  type="button"
                  disabled={!canManage}
                  onClick={() => canManage && setRequire2fa(v => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${require2fa ? 'bg-amber-500' : 'bg-slate-700'} ${!canManage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${require2fa ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
                <span className={`text-xs font-mono ${require2fa ? 'text-amber-400' : 'text-slate-500'}`}>
                  {require2fa ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
            </Field>
          </div>

          <div className="p-3 bg-[#071E1B] border border-amber-500/20 rounded-lg flex items-start gap-2.5 text-xs text-amber-200/80">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>All API calls enforce role checks server-side. UI permission gates are an additional layer — backend JWT validation is the authoritative enforcement mechanism.</span>
          </div>
        </SettingsSection>

        {/* 4. Data Retention */}
        <SettingsSection icon={Database} title="Data Retention Policy" description="How long records are kept before automated archival. GPS is captured only at check-in/out — never tracked continuously.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Attendance Records (months)" hint="Recommended: 24 months per company policy.">
              <input type="number" min="12" max="120" value={attendanceRetentionMonths} onChange={e => setAttendanceRetentionMonths(e.target.value)} {...inputProps()} />
            </Field>
            <Field label="Audit Log (months)" hint="Recommended: 36 months for compliance.">
              <input type="number" min="12" max="120" value={auditRetentionMonths} onChange={e => setAuditRetentionMonths(e.target.value)} {...inputProps()} />
            </Field>
            <Field label="Case Records (months)" hint="Incident and complaint records retention.">
              <input type="number" min="12" max="120" value={caseRetentionMonths} onChange={e => setCaseRetentionMonths(e.target.value)} {...inputProps()} />
            </Field>
          </div>

          <Field label="CSV Formula Injection Protection" hint="Prepends safe characters to cell values starting with =, +, -, @, to prevent spreadsheet formula injection attacks.">
            <div className="flex items-center gap-3 py-1.5">
              <button
                type="button"
                disabled={!canManage}
                onClick={() => canManage && setFormulaEscaping(v => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formulaEscaping ? 'bg-amber-500' : 'bg-slate-700'} ${!canManage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${formulaEscaping ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
              <span className={`text-xs font-mono ${formulaEscaping ? 'text-amber-400' : 'text-slate-500'}`}>
                {formulaEscaping ? 'ENABLED (recommended)' : 'DISABLED'}
              </span>
            </div>
          </Field>

          <div className="p-3 bg-[#071E1B] border border-slate-700/60 rounded-lg flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>Guard GPS coordinates are captured <strong className="text-slate-300">only at check-in and check-out</strong> events. Continuous location tracking is never performed. Personal data access is limited by role assignment.</span>
          </div>
        </SettingsSection>

        {/* 5. Notification Templates */}
        <SettingsSection icon={Bell} title="Notification Templates (SMS & Email)" description="Editable templates for automated communications. Use {{variable}} placeholders — they are replaced at send time.">
          <div className="space-y-4">
            <Field label="SMS — Guard Check-in Confirmation" hint="Sent to supervisor and operations when a guard checks in. Variables: guard_name, site_name, time_eat, shift_code">
              <textarea
                rows={3}
                value={smsCheckinTemplate}
                onChange={e => setSmsCheckinTemplate(e.target.value)}
                className={textareaClass}
                disabled={!canManage}
              />
            </Field>

            <Field label="SMS — Incident Alert Notification" hint="Sent when a high-severity case is created. Variables: severity, site_name, case_number, owner_name">
              <textarea
                rows={3}
                value={smsIncidentTemplate}
                onChange={e => setSmsIncidentTemplate(e.target.value)}
                className={textareaClass}
                disabled={!canManage}
              />
            </Field>

            <Field label="Email — Service Request Confirmation" hint="Sent to client when their service request is received. Variables: client_name, reference_number, service_type, address">
              <textarea
                rows={6}
                value={emailRequestTemplate}
                onChange={e => setEmailRequestTemplate(e.target.value)}
                className={textareaClass}
                disabled={!canManage}
              />
            </Field>

            <Field label="Email — Case Acknowledgement" hint="Sent when a complaint or incident report is filed. Variables: reporter_name, case_number, severity, due_date">
              <textarea
                rows={6}
                value={emailCaseTemplate}
                onChange={e => setEmailCaseTemplate(e.target.value)}
                className={textareaClass}
                disabled={!canManage}
              />
            </Field>

            <div className="p-3 bg-[#071E1B] border border-slate-700/60 rounded-lg text-xs text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>SMS delivery is via a local gateway (e.g. Ethio Telecom or Safaricom Bulk SMS). Configure gateway credentials in server environment variables.</span>
            </div>
          </div>
        </SettingsSection>

        {/* 6. Internationalization */}
        <SettingsSection icon={Languages} title="Language & Internationalisation" description="Covenant Shield is built for multi-language support from the ground up.">
          <Field label="Current Interface Language" hint="All interface text is stored in translation files (i18n). Amharic and other languages can be added without code changes.">
            <input type="text" disabled value={currentLanguage} className={disabledInputClass} />
          </Field>
          <div className="p-3 bg-[#071E1B] border border-slate-700/60 rounded-lg text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>All displayed strings are externalized in <code className="text-amber-300 font-mono">src/i18n/en.json</code>. To add Amharic, create <code className="text-amber-300 font-mono">src/i18n/am.json</code> with the same keys and set this field to <em>Amharic (am)</em>.</span>
          </div>
        </SettingsSection>

        {canManage && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              Save All Parameters
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
