import React, { useState } from 'react';
import { Site } from '@/types';
import { getClients, getEmployees, saveSite } from '@/services/store';

interface SiteFormProps {
  initialData?: Site;
  onSuccess: (savedSite: Site) => void;
  onCancel: () => void;
}

export const SiteForm: React.FC<SiteFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const clients = getClients();
  const supervisors = getEmployees().filter((e) => e.role === 'supervisor');

  const [name, setName] = useState(initialData?.name || '');
  const [clientId, setClientId] = useState(initialData?.clientId || clients[0]?.id || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [city, setCity] = useState(initialData?.city || 'Nairobi');
  const [lat, setLat] = useState<string>(
    initialData?.coordinates?.lat ? String(initialData.coordinates.lat) : ''
  );
  const [lng, setLng] = useState<string>(
    initialData?.coordinates?.lng ? String(initialData.coordinates.lng) : ''
  );
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || '');
  const [requiredGuardCount, setRequiredGuardCount] = useState<number>(
    initialData?.requiredGuardCount || 3
  );
  const [assignedSupervisorIds, setAssignedSupervisorIds] = useState<string[]>(
    initialData?.assignedSupervisorIds || []
  );
  const [status, setStatus] = useState<Site['status']>(initialData?.status || 'active');
  const [operationalNotes, setOperationalNotes] = useState(initialData?.operationalNotes || '');
  const [error, setError] = useState<string | null>(null);

  const handleToggleSupervisor = (supId: string) => {
    if (assignedSupervisorIds.includes(supId)) {
      setAssignedSupervisorIds(assignedSupervisorIds.filter((id) => id !== supId));
    } else {
      setAssignedSupervisorIds([...assignedSupervisorIds, supId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientId || !address.trim()) {
      setError('Site name, client account, and physical address are required.');
      return;
    }

    const coordinates =
      lat && lng
        ? {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
          }
        : undefined;

    const res = saveSite({
      id: initialData?.id,
      name: name.trim(),
      clientId,
      address: address.trim(),
      city: city.trim(),
      coordinates,
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      requiredGuardCount: Number(requiredGuardCount),
      assignedSupervisorIds,
      status,
      operationalNotes: operationalNotes.trim(),
    });

    if (res.success && res.site) {
      onSuccess(res.site);
    } else {
      setError(res.error || 'Failed to save security site');
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
            Site Facility Name <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Westlands Corporate Center"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Contracted Client Account <span className="text-amber-400">*</span>
          </label>
          <select
            value={clientId}
            aria-label="Contracted client account"
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName} ({c.accountReference})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Physical Address <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Road, building, wing"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">City / Hub</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Site Manager / On-Site Contact
          </label>
          <input
            type="text"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="e.g. Facilities Officer"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Emergency On-Site Telephone
          </label>
          <input
            type="text"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+254 700 000 000"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Required Post Guard Count
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={requiredGuardCount}
            onChange={(e) => setRequiredGuardCount(parseInt(e.target.value) || 1)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Site Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          >
            <option value="active">Active Guarding</option>
            <option value="under_assessment">Under Assessment</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* GPS Coordinates */}
      <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950/60 rounded border border-slate-800">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Latitude (GPS)</label>
          <input
            type="text"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="-1.2641"
            className="w-full bg-slate-900 border border-slate-800 rounded py-1 px-2.5 text-xs text-slate-200 font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Longitude (GPS)</label>
          <input
            type="text"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="36.8045"
            className="w-full bg-slate-900 border border-slate-800 rounded py-1 px-2.5 text-xs text-slate-200 font-mono"
          />
        </div>
      </div>

      {/* Assigned Supervisors */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Assigned Field Supervisors (Scope Enforcement)
        </label>
        <div className="flex flex-wrap gap-2 mt-1">
          {supervisors.map((s) => {
            const isAssigned = assignedSupervisorIds.includes(s.id);
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => handleToggleSupervisor(s.id)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  isAssigned
                    ? 'bg-amber-400/20 text-amber-300 border-amber-500/40 font-medium'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {s.name} ({s.employeeNumber})
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Operational Security Notes & Protocols
        </label>
        <textarea
          rows={3}
          value={operationalNotes}
          onChange={(e) => setOperationalNotes(e.target.value)}
          placeholder="Access control rules, gate pass policies, biometric checkpoints..."
          className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
        />
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
          {initialData ? 'Update Site' : 'Register Security Site'}
        </button>
      </div>
    </form>
  );
};
