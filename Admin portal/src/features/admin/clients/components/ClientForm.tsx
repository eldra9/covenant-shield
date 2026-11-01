import React, { useState } from 'react';
import { Client } from '@/types';
import { saveClient } from '@/services/store';

interface ClientFormProps {
  initialData?: Client;
  onSuccess: (savedClient: Client) => void;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [industry, setIndustry] = useState(initialData?.industry || 'Commercial Property');
  const [billingAddress, setBillingAddress] = useState(initialData?.billingAddress || '');
  const [city, setCity] = useState(initialData?.city || 'Nairobi');
  const [status, setStatus] = useState<Client['status']>(initialData?.status || 'active');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPerson.trim() || !email.trim()) {
      setError('Company name, contact person, and billing email are mandatory.');
      return;
    }

    const res = saveClient({
      id: initialData?.id,
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      industry: industry.trim(),
      billingAddress: billingAddress.trim(),
      city: city.trim(),
      status,
      notes: notes.trim(),
    });

    if (res.success && res.client) {
      onSuccess(res.client);
    } else {
      setError(res.error || 'Failed to save client account');
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
            Company Name <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Nairobi Executive Plaza Ltd"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Primary Contact Person <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            required
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="e.g. Dennis Macharia"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Official Email <span className="text-amber-400">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="billing@company.co.ke"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Telephone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254 700 000 000"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Industry Sector</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Financial Services, Commercial, Logistics..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">City / Region</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Nairobi, Mombasa, Kisumu..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Billing Address</label>
        <input
          type="text"
          value={billingAddress}
          onChange={(e) => setBillingAddress(e.target.value)}
          placeholder="Building name, street, postal code"
          className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Account Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
        >
          <option value="active">Active (Full Service Standing)</option>
          <option value="pending">Pending Onboarding</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Operational Notes</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Client-specific security stipulations, SLA requirements..."
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
          {initialData ? 'Save Changes' : 'Create Client Account'}
        </button>
      </div>
    </form>
  );
};
