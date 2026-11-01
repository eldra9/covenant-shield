import React, { useState } from 'react';
import { Employee } from '@/types';
import { getSites, saveEmployee } from '@/services/store';

interface EmployeeFormProps {
  initialData?: Employee;
  onSuccess: (savedEmployee: Employee) => void;
  onCancel: () => void;
}

const AVAILABLE_QUALIFICATIONS = [
  'PSRA Certified',
  'Armed Escort Endorsed',
  'First Aid Level 2',
  'Fire Safety & Evacuation',
  'K9 Bomb & Narcotics Detection',
  'CCTV Control Room Specialist',
  'VIP Close Defense & Tactical Driving',
  'Incident Command Level 3',
  'Physical Access Barrier Security',
];

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const sites = getSites();

  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [nationalIdMasked, setNationalIdMasked] = useState(
    initialData?.nationalIdMasked || '•••• 0000'
  );
  const [role, setRole] = useState<Employee['role']>(initialData?.role || 'guard');
  const [employmentStatus, setEmploymentStatus] = useState<Employee['employmentStatus']>(
    initialData?.employmentStatus || 'active'
  );
  const [qualifications, setQualifications] = useState<string[]>(
    initialData?.qualifications || ['PSRA Certified']
  );
  const [assignedSiteIds, setAssignedSiteIds] = useState<string[]>(
    initialData?.assignedSiteIds || []
  );
  const [emergencyContact, setEmergencyContact] = useState(initialData?.emergencyContact || '');
  const [dateHired, setDateHired] = useState(
    initialData?.dateHired || new Date().toISOString().split('T')[0]
  );
  const [error, setError] = useState<string | null>(null);

  const toggleQual = (q: string) => {
    if (qualifications.includes(q)) {
      setQualifications(qualifications.filter((item) => item !== q));
    } else {
      setQualifications([...qualifications, q]);
    }
  };

  const toggleSite = (sId: string) => {
    if (assignedSiteIds.includes(sId)) {
      setAssignedSiteIds(assignedSiteIds.filter((id) => id !== sId));
    } else {
      setAssignedSiteIds([...assignedSiteIds, sId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Employee name and official phone contact are required.');
      return;
    }

    const res = saveEmployee({
      id: initialData?.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      nationalIdMasked: nationalIdMasked.trim(),
      role,
      employmentStatus,
      qualifications,
      assignedSiteIds,
      emergencyContact: emergencyContact.trim(),
      dateHired,
    });

    if (res.success && res.employee) {
      onSuccess(res.employee);
    } else {
      setError(res.error || 'Failed to save employee profile');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-md text-xs text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Full Officer Name <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. David Kiptoo"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Official Contact Phone <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254 700 000 000"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Covenant Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="d.kiptoo@covenantshield.co.ke"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            National ID (Privacy Masked)
          </label>
          <input
            type="text"
            value={nationalIdMasked}
            onChange={(e) => setNationalIdMasked(e.target.value)}
            placeholder="•••• 4892"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Operational Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 capitalize"
          >
            <option value="guard">Security Guard</option>
            <option value="supervisor">Field Supervisor</option>
            <option value="k9_specialist">K9 Canine Specialist</option>
            <option value="cctv_operator">CCTV Control Operator</option>
            <option value="close_protection">VIP Close Protection Officer</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Employment Standing
          </label>
          <select
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 capitalize"
          >
            <option value="active">Active Duty</option>
            <option value="on_leave">On Authorized Leave</option>
            <option value="suspended">Suspended (Investigation)</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Date Enrolled</label>
          <input
            type="date"
            value={dateHired}
            onChange={(e) => setDateHired(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Emergency Next-of-Kin Contact
          </label>
          <input
            type="text"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="Name & Contact number"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Qualifications */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Vetting & Certifications (Click to toggle)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_QUALIFICATIONS.map((q) => {
            const hasQ = qualifications.includes(q);
            return (
              <button
                type="button"
                key={q}
                onClick={() => toggleQual(q)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  hasQ
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-700/60 font-medium'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {hasQ ? '✓ ' : '+ '}
                {q}
              </button>
            );
          })}
        </div>
      </div>

      {/* Assigned Sites */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Designated Security Posts / Sites
        </label>
        <div className="flex flex-wrap gap-1.5">
          {sites.map((s) => {
            const isAssigned = assignedSiteIds.includes(s.id);
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleSite(s.id)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  isAssigned
                    ? 'bg-amber-400/20 text-amber-300 border-amber-500/40 font-medium'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {s.name} ({s.siteCode})
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-md transition-colors"
        >
          {initialData ? 'Update Profile' : 'Enroll Officer'}
        </button>
      </div>
    </form>
  );
};
