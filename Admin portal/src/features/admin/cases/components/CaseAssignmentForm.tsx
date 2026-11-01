import React, { useState } from 'react';
import { Case } from '@/types';
import {
  assignCaseOwner,
  getAllUsers,
  getCurrentUser,
  hasPermission,
} from '@/services/store';
import { UserCheck } from 'lucide-react';

interface CaseAssignmentFormProps {
  currentCase: Case;
  onSuccess: () => void;
}

export const CaseAssignmentForm: React.FC<CaseAssignmentFormProps> = ({
  currentCase,
  onSuccess,
}) => {
  const currentUser = getCurrentUser();
  const canAssign = hasPermission('cases.assign', currentUser);
  const users = getAllUsers();
  const assignableStaff = users.filter(
    (u) => u.role === 'supervisor' || u.role === 'operations_staff' || u.role === 'super_admin'
  );

  const [selectedOwnerId, setSelectedOwnerId] = useState(
    currentCase.assignedOwnerId || ''
  );

  if (!canAssign) return null;

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOwnerId) return;
    const ok = assignCaseOwner(currentCase.id, selectedOwnerId);
    if (ok) onSuccess();
  };

  return (
    <form onSubmit={handleAssign} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <h4 className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
        <span>Lead Investigator Assignment</span>
      </h4>
      <div className="flex items-center gap-2 mt-2">
        <select
          value={selectedOwnerId}
          aria-label="Lead investigator assignment"
          onChange={(e) => setSelectedOwnerId(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
        >
          <option value="">Select Investigator / Supervisor...</option>
          {assignableStaff.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role.replace('_', ' ')})
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!selectedOwnerId || selectedOwnerId === currentCase.assignedOwnerId}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700"
        >
          Assign
        </button>
      </div>
    </form>
  );
};
