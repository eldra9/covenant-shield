import React, { useState } from 'react';
import {
  getAllUsers,
  getCurrentUser,
  hasPermission,
  saveUser,
  updateUserRole,
  syncWithBackend,
} from '@/services/store';
import { Role, User } from '@/types';
import {
  UserCheck,
  ShieldAlert,
  Plus,
  Edit3,
  KeyRound,
  UserPlus,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { ConfirmActionDialog } from '@/components/admin/ConfirmActionDialog';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

function generateRandomUsername(fullName: string): string {
  const clean = fullName.trim().toLowerCase().replace(/[^a-z\s]/g, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  const rnd = Math.floor(100 + Math.random() * 900);
  if (parts.length === 0) return `staff${rnd}`;
  if (parts.length === 1) return `${parts[0]}${rnd}`;
  return `${parts[0][0]}${parts[parts.length - 1]}${rnd}`;
}

function generateRandomTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let randStr = '';
  for (let i = 0; i < 6; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CS-${randStr}!`;
}

export const UserManagementPage: React.FC = () => {
  const [, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  const allUsers = getAllUsers();
  const currentUser = getCurrentUser();
  const canManageUsers = hasPermission('users.manage', currentUser);
  const canManageRoles = hasPermission('roles.manage', currentUser);

  // Edit / standard create modal
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Dedicated Staff & Supervisor Adder modal
  const [isProvisioningModalOpen, setIsProvisioningModalOpen] = useState(false);
  const [provisionRole, setProvisionRole] = useState<'operations_staff' | 'supervisor'>('operations_staff');
  const [provisionName, setProvisionName] = useState('');
  const [provisionUsername, setProvisionUsername] = useState('');
  const [provisionEmail, setProvisionEmail] = useState('');
  const [provisionPhone, setProvisionPhone] = useState('');
  const [provisionTempPassword, setProvisionTempPassword] = useState('');
  const [showProvisionPassword, setShowProvisionPassword] = useState(true);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [isSubmittingProvision, setIsSubmittingProvision] = useState(false);

  // Credentials notification modal
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    username: string;
    temporaryPassword: string;
    email: string;
    role: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Standard form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('operations_staff');
  const [formError, setFormError] = useState<string | null>(null);

  // Role change confirmation
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ user: User; newRole: Role } | null>(null);

  // Open Provisioning Adder
  const handleOpenProvisionModal = (targetRole: 'operations_staff' | 'supervisor' = 'operations_staff') => {
    setProvisionRole(targetRole);
    setProvisionName('');
    setProvisionUsername('');
    setProvisionEmail('');
    setProvisionPhone('');
    setProvisionTempPassword(generateRandomTempPassword());
    setShowProvisionPassword(true);
    setProvisionError(null);
    setIsProvisioningModalOpen(true);
  };

  const handleNameChangeInProvision = (val: string) => {
    setProvisionName(val);
    if (!provisionUsername || provisionUsername === generateRandomUsername(provisionName)) {
      const generatedUname = generateRandomUsername(val);
      setProvisionUsername(generatedUname);
      if (!provisionEmail || provisionEmail.endsWith('@covenantshield.co.ke')) {
        setProvisionEmail(`${generatedUname}@covenantshield.co.ke`);
      }
    }
  };

  const handleRegeneratePassword = () => {
    setProvisionTempPassword(generateRandomTempPassword());
  };

  const handleRegenerateUsername = () => {
    const newUname = generateRandomUsername(provisionName || 'staff');
    setProvisionUsername(newUname);
    setProvisionEmail(`${newUname}@covenantshield.co.ke`);
  };

  const handleSaveProvisionedStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionError(null);

    if (!provisionName.trim()) {
      setProvisionError('Full name is required.');
      return;
    }
    if (!provisionUsername.trim()) {
      setProvisionError('Username is required.');
      return;
    }
    if (!provisionTempPassword.trim()) {
      setProvisionError('Temporary password is required.');
      return;
    }

    setIsSubmittingProvision(true);

    const emailToUse = provisionEmail.trim() || `${provisionUsername.trim()}@covenantshield.co.ke`;

    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('covenant_shield_access_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/admin-portal/provision-staff/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: provisionName.trim(),
          role: provisionRole,
          username: provisionUsername.trim(),
          email: emailToUse,
          phone: provisionPhone.trim(),
          temporaryPassword: provisionTempPassword.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await syncWithBackend();
        setIsProvisioningModalOpen(false);
        setCreatedCredentials({
          name: provisionName.trim(),
          username: data.username || provisionUsername.trim(),
          temporaryPassword: data.temporaryPassword || provisionTempPassword.trim(),
          email: data.email || emailToUse,
          role: provisionRole === 'supervisor' ? 'Field Supervisor' : 'Operations Staff',
        });
        reload();
        setIsSubmittingProvision(false);
        return;
      }

      const errData = await res.json().catch(() => ({}));
      if (errData.detail) {
        setProvisionError(errData.detail);
        setIsSubmittingProvision(false);
        return;
      }
    } catch {
      // Offline fallback
    }

    // Local fallback creation
    const localUserResult = saveUser({
      name: provisionName.trim(),
      username: provisionUsername.trim(),
      email: emailToUse,
      phone: provisionPhone.trim(),
      role: provisionRole,
      isActive: true,
      must_change_password: true,
      mustChangePassword: true,
    });

    if (localUserResult.success) {
      setIsProvisioningModalOpen(false);
      setCreatedCredentials({
        name: provisionName.trim(),
        username: provisionUsername.trim(),
        temporaryPassword: provisionTempPassword.trim(),
        email: emailToUse,
        role: provisionRole === 'supervisor' ? 'Field Supervisor' : 'Operations Staff',
      });
      reload();
    } else {
      setProvisionError(localUserResult.error || 'Failed to provision staff member.');
    }
    setIsSubmittingProvision(false);
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Covenant Shield Command Access Credentials\nRole: ${createdCredentials.role}\nName: ${createdCredentials.name}\nUsername: ${createdCredentials.username}\nCorporate Email: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.temporaryPassword}\nLogin Portal: Admin Command Centre\nNote: You will be prompted to set a permanent password upon first login.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartCreate = () => {
    setName('');
    setEmail('');
    setPhone('');
    setRole('operations_staff');
    setFormError(null);
    setIsCreating(true);
    setEditingUser(null);
  };

  const handleStartEdit = (u: User) => {
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone);
    setRole(u.role);
    setFormError(null);
    setEditingUser(u);
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError('Name and corporate email are mandatory.');
      return;
    }

    const res = saveUser({
      id: editingUser?.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
    });

    if (res.success) {
      setIsCreating(false);
      setEditingUser(null);
      reload();
    } else {
      setFormError(res.error || 'Failed to save account');
    }
  };

  const handleConfirmRoleChange = () => {
    if (!roleChangeTarget) return;
    updateUserRole(roleChangeTarget.user.id, roleChangeTarget.newRole);
    setRoleChangeTarget(null);
    reload();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Provisioner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <h2 className="text-base font-bold text-slate-100 tracking-tight">
              User Account & Command RBAC Directory
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Administrative credentials, role assignments, and single-use temporary password provisioning for Command Staff.
          </p>
        </div>

        {canManageUsers && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleOpenProvisionModal('operations_staff')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Operations Staff</span>
            </button>

            <button
              onClick={() => handleOpenProvisionModal('supervisor')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-100 bg-[#123D37] hover:bg-[#184F47] border border-[#C9A04A]/40 rounded-lg shadow-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-[#C9A04A]" />
              <span>Add Field Supervisor</span>
            </button>
          </div>
        )}
      </div>

      {/* Provision Staff & Supervisor Modal */}
      {isProvisioningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Provision {provisionRole === 'supervisor' ? 'Supervisor' : 'Operations Staff'} Account
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Assign a username and one-time temporary password. Password reset is mandatory on first login.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProvisioningModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {provisionError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span>{provisionError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProvisionedStaff} className="space-y-4">
              {/* Role selection toggle */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Account Role Type <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProvisionRole('operations_staff')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                      provisionRole === 'operations_staff'
                        ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    Operations Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvisionRole('supervisor')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                      provisionRole === 'supervisor'
                        ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Field Supervisor
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={provisionName}
                  onChange={(e) => handleNameChangeInProvision(e.target.value)}
                  placeholder="e.g. Samuel Mutisya"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Username with generate button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Assigned Username <span className="text-amber-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRegenerateUsername}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={provisionUsername}
                  onChange={(e) => setProvisionUsername(e.target.value)}
                  placeholder="e.g. smutisy24"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs font-mono text-amber-300 placeholder-slate-600 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Corporate Email */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  value={provisionEmail}
                  onChange={(e) => setProvisionEmail(e.target.value)}
                  placeholder="e.g. smutisy24@covenantshield.co.ke"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mobile / Contact Number
                </label>
                <input
                  type="text"
                  value={provisionPhone}
                  onChange={(e) => setProvisionPhone(e.target.value)}
                  placeholder="+254 711 000 000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Temporary Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Temporary Password <span className="text-amber-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRegeneratePassword}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showProvisionPassword ? 'text' : 'password'}
                    required
                    value={provisionTempPassword}
                    onChange={(e) => setProvisionTempPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-3 pr-10 text-xs font-mono text-amber-300 focus:outline-hidden focus:border-amber-500 tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProvisionPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400"
                  >
                    {showProvisionPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  ⚠️ This temporary password will only be valid for the initial sign in. The user will be required to change it immediately upon logging in.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProvisioningModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProvision}
                  className="px-4 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {isSubmittingProvision ? 'Provisioning...' : 'Provision User & Generate Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Created Credentials Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-amber-400/40 bg-slate-900 p-6 shadow-2xl text-slate-100">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Staff Account Provisioned</h3>
              <p className="text-xs text-slate-400">
                Share these temporary credentials with the staff member.
              </p>
            </div>

            <div className="space-y-3 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono mb-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-500">Role:</span>
                <span className="text-amber-400 font-semibold">{createdCredentials.role}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-500">Full Name:</span>
                <span className="text-white font-medium">{createdCredentials.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-500">Username:</span>
                <span className="text-emerald-400 font-bold select-all">{createdCredentials.username}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-500">Corporate Email:</span>
                <span className="text-slate-300 select-all">{createdCredentials.email}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Temporary Password:</span>
                <span className="text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 select-all">
                  {createdCredentials.temporaryPassword}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-200/90 mb-5 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                The user must use this username and temporary password on their first login. The system will force them to establish a new password before granting portal access.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg text-xs transition"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-950" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
              </button>
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isCreating && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            {editingUser ? `Edit User: ${editingUser.name}` : 'Provision Staff User'}
          </h3>

          {formError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-md text-xs text-rose-300 mb-3">
              {formError}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Corporate Email <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assigned RBAC Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 capitalize"
                >
                  <option value="super_admin">Super Administrator</option>
                  <option value="operations_staff">Operations Staff</option>
                  <option value="supervisor">Field Supervisor</option>
                  <option value="guard">Security Guard</option>
                  <option value="client">Client Portal User</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-md"
              >
                {editingUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-4">User Name & Login</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Role Tier</th>
                <th className="py-3 px-4">Resource Scope</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {allUsers.map((u) => {
                const isPendingPasswordChange = Boolean(u.must_change_password || u.mustChangePassword);
                return (
                  <tr key={u.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{u.name}</div>
                      <div className="text-[11px] font-mono text-amber-300">
                        @{u.username || u.email.split('@')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {u.id.slice(0, 8)}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-300">
                      <div>{u.email}</div>
                      <div className="text-slate-500 text-[11px]">{u.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      {canManageRoles ? (
                        <select
                          value={u.role}
                          aria-label={`Role for ${u.name}`}
                          onChange={(e) => {
                            const newR = e.target.value as Role;
                            if (newR !== u.role) {
                              setRoleChangeTarget({ user: u, newRole: newR });
                            }
                          }}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 capitalize font-medium focus:border-amber-500"
                        >
                          <option value="super_admin">Super Administrator</option>
                          <option value="operations_staff">Operations Staff</option>
                          <option value="supervisor">Field Supervisor</option>
                          <option value="guard">Security Guard</option>
                          <option value="client">Client Portal User</option>
                        </select>
                      ) : (
                        <span className="font-mono text-xs uppercase bg-slate-950 px-2 py-0.5 rounded text-amber-300 border border-slate-800">
                          {u.role.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">
                      {u.assignedSiteIds && u.assignedSiteIds.length > 0 ? (
                        <span>{u.assignedSiteIds.length} Assigned Site(s)</span>
                      ) : u.clientId ? (
                        <span className="text-amber-400">Client Account ({u.clientId})</span>
                      ) : (
                        <span className="text-slate-500">Universal Enterprise</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                        {isPendingPasswordChange && (
                          <div className="inline-block px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 text-[10px] font-mono text-amber-300">
                            Temp Password
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {canManageUsers && (
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Confirmation Dialog */}
      <ConfirmActionDialog
        isOpen={!!roleChangeTarget}
        title="Confirm User Authorization Change"
        description={`Are you sure you want to alter permissions for ${roleChangeTarget?.user.name} to "${roleChangeTarget?.newRole.replace('_', ' ')}"? This action modifies all capability gates and will be logged in the immutable audit trail.`}
        confirmLabel="Authorize Role Change"
        cancelLabel="Discard"
        isDestructive={roleChangeTarget?.newRole === 'client' || roleChangeTarget?.newRole === 'guard'}
        onConfirm={handleConfirmRoleChange}
        onCancel={() => setRoleChangeTarget(null)}
      />
    </div>
  );
};
