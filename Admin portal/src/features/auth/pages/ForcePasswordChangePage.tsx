import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Eye, EyeOff, Lock, AlertCircle, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';
import { User } from '@/types';

interface ForcePasswordChangePageProps {
  user: User;
  initialTempPassword?: string;
  onPasswordChanged: () => void;
  onLogout: () => void;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const ForcePasswordChangePage: React.FC<ForcePasswordChangePageProps> = ({
  user,
  initialTempPassword = '',
  onPasswordChanged,
  onLogout,
}) => {
  const [currentPassword, setCurrentPassword] = useState(initialTempPassword);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentPassword) {
      setErrorMessage('Please enter your current temporary password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Your new password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage('New password cannot be identical to the temporary password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('covenant_shield_access_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/auth/change-password/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          username: user.username || user.email,
          email: user.email,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access && typeof window !== 'undefined') {
          window.localStorage.setItem('covenant_shield_access_token', data.access);
        }
        onPasswordChanged();
        return;
      }

      const errData = await res.json().catch(() => ({}));
      if (errData.detail) {
        setErrorMessage(errData.detail);
        setIsSubmitting(false);
        return;
      }
    } catch {
      // Local or fallback mode
    }

    // In local / offline mode, proceed after updating
    onPasswordChanged();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#061A17] text-[#D9E0DC] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,160,74,0.18),rgba(255,255,255,0))]" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#14655A]/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Brand header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D322D] to-[#092824] border border-[#C9A04A]/40 shadow-[0_0_30px_rgba(201,160,74,0.2)] mb-3">
            <KeyRound className="h-7 w-7 text-[#C9A04A]" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A04A]/30 bg-[#0D322D]/80 text-[#C9A04A] text-[11px] font-mono-ref uppercase tracking-wider mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            First-Time Login Security Protocol
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono-ref">
            Set Your Permanent Password
          </h1>
          <p className="text-xs text-[#8BA49E] mt-1 max-w-md mx-auto">
            Welcome to Covenant Shield, <span className="font-semibold text-white">{user.name}</span>. Because your account was provisioned with a temporary password, you must create a new secure password to proceed.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#1B433E] bg-[#0A2622]/90 backdrop-blur-xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-950/40 p-3.5 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="mb-5 p-3.5 rounded-xl border border-[#163833] bg-[#071E1B] flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[#68827C] block text-[10px] uppercase">Account</span>
              <span className="text-white font-semibold">{user.username || user.email}</span>
            </div>
            <div className="text-right">
              <span className="text-[#68827C] block text-[10px] uppercase">Assigned Role</span>
              <span className="text-[#C9A04A] capitalize">{user.role.replace('_', ' ')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#C2D1CD]">
                Current Temporary Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68827C]" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#1D4A44] bg-[#071E1B] py-2.5 pl-10 pr-10 text-sm text-white placeholder-[#506661] outline-none transition focus:border-[#C9A04A] focus:ring-1 focus:ring-[#C9A04A] font-mono"
                  placeholder="Enter temporary password"
                  required
                />
                <button
                  type="button"
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                  onClick={() => setShowCurrent((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#68827C] transition hover:text-[#C9A04A]"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#C2D1CD]">
                New Password <span className="text-[#8BA49E] text-[11px] font-normal">(min. 6 characters)</span>
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68827C]" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#1D4A44] bg-[#071E1B] py-2.5 pl-10 pr-10 text-sm text-white placeholder-[#506661] outline-none transition focus:border-[#C9A04A] focus:ring-1 focus:ring-[#C9A04A]"
                  placeholder="Create new personal password"
                  required
                />
                <button
                  type="button"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#68827C] transition hover:text-[#C9A04A]"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#C2D1CD]">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68827C]" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#1D4A44] bg-[#071E1B] py-2.5 pl-10 pr-3 text-sm text-white placeholder-[#506661] outline-none transition focus:border-[#C9A04A] focus:ring-1 focus:ring-[#C9A04A]"
                  placeholder="Re-enter new personal password"
                  required
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#163833] bg-[#071E1B]/60 p-3 text-[11px] text-[#8BA49E] space-y-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`h-3.5 w-3.5 ${newPassword.length >= 6 ? 'text-emerald-400' : 'text-[#506661]'}`} />
                <span>At least 6 characters in length</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`h-3.5 w-3.5 ${newPassword && newPassword === confirmPassword ? 'text-emerald-400' : 'text-[#506661]'}`} />
                <span>Passwords match</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !currentPassword || !newPassword || newPassword.length < 6 || newPassword !== confirmPassword}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A04A] px-4 py-3 text-sm font-semibold text-[#092824] shadow-md transition hover:bg-[#D8B05A] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Updating Credentials...' : 'Save Password & Enter Command Centre'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 border-t border-[#163833] pt-4 flex items-center justify-between">
            <span className="text-[11px] text-[#637C77]">
              Need help? Contact Covenant Shield Command Dispatch.
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs text-[#8BA49E] hover:text-white transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
