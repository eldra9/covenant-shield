/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Phone, Mail, CheckCircle, Save, AlertCircle } from 'lucide-react';
import { ClientUser } from '@/src/types/clientPortal';

interface ClientContactDetailsProps {
  user: ClientUser;
  onUpdate: (updates: Partial<ClientUser> & { email?: string }) => Promise<void>;
}

export const ClientContactDetails: React.FC<ClientContactDetailsProps> = ({ user, onUpdate }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [jobTitle, setJobTitle] = useState(user.jobTitle);
  const [email, setEmail] = useState(user.email);
  const [directPhone, setDirectPhone] = useState(user.directPhone);
  const [alertPhone, setAlertPhone] = useState(user.alertPhone);
  const [preferredChannel, setPreferredChannel] = useState(user.preferredChannel);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setSaveError(null);
    try {
      await onUpdate({
        fullName,
        jobTitle,
        email,
        directPhone,
        alertPhone,
        preferredChannel,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      setSaveError(err.message || 'Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#003C35]';

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div>
          <h3 className="text-sm font-bold text-[#092824]">
            Authorized Representative Contact Details
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Personal contact points for tactical incident alerts and operational escalation
          </p>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
          Editable by Client User
        </span>
      </div>

      {savedSuccess && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Contact details successfully updated and saved to database.</span>
        </div>
      )}

      {saveError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Full Legal Name</label>
            <div className="relative">
              <User className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-400" />
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className={`${inputCls} pl-8`} />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Corporate Job Title</label>
            <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Email Address
              <span className="ml-1 text-[10px] font-normal text-[#003C35]">(editable)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value.toLowerCase())}
                className={`${inputCls} pl-8`}
                required
              />
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Changing your email will update your login credentials.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Direct Phone (Office/Mobile)</label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-400" />
              <input type="tel" value={directPhone} onChange={e => setDirectPhone(e.target.value)} required className={`${inputCls} pl-8`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">24/7 Tactical Alert Mobile (SMS/Call)</label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-400" />
              <input type="tel" value={alertPhone} onChange={e => setAlertPhone(e.target.value)} required className={`${inputCls} pl-8`} />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Preferred Escalation Channel</label>
            <select value={preferredChannel} onChange={e => setPreferredChannel(e.target.value as any)} className={inputCls}>
              <option value="Both">Both (Email &amp; SMS Instant Broadcast)</option>
              <option value="Phone Call">Direct Phone Call</option>
              <option value="SMS">SMS Fast Broadcast</option>
              <option value="WhatsApp">WhatsApp Business</option>
              <option value="Email">Email Only</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#003C35] hover:bg-[#002b26] text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 text-xs"
          >
            <Save className="w-3.5 h-3.5 text-[#C9A04A]" />
            <span>{saving ? 'Saving...' : 'Save Contact Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
