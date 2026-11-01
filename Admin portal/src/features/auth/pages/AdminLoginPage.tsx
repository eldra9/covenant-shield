import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, ShieldCheck, LockKeyhole, User, AlertCircle } from 'lucide-react';

interface AdminLoginPageProps {
  onLogin: (identifier: string, password: string) => void;
  errorMessage?: string;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, errorMessage }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password) return;
    setIsSubmitting(true);
    onLogin(identifier.trim(), password);
    setTimeout(() => setIsSubmitting(false), 500);
  };

  return (
    <div className="min-h-screen bg-[#061A17] text-[#D9E0DC] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,160,74,0.18),rgba(255,255,255,0))]" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#14655A]/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D322D] to-[#092824] border border-[#C9A04A]/40 shadow-[0_0_30px_rgba(201,160,74,0.2)] mb-4">
            <ShieldCheck className="h-7 w-7 text-[#C9A04A]" />
          </div>
          <h1 className="text-xl font-bold tracking-[0.18em] uppercase text-white font-mono-ref">
            Covenant Shield
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-[#C9A04A] mt-1 font-mono-ref">
            Command & Operations Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#1B433E] bg-[#0A2622]/90 backdrop-blur-xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Sign In</h2>
            <p className="text-xs text-[#8BA49E] mt-1">
              Enter your administrative username or corporate credentials to proceed.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-950/40 p-3.5 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#C2D1CD]">
                Username or Email
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68827C]" />
                <input
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-[#1D4A44] bg-[#071E1B] py-2.5 pl-10 pr-3 text-sm text-white placeholder-[#506661] outline-none transition focus:border-[#C9A04A] focus:ring-1 focus:ring-[#C9A04A]"
                  placeholder="e.g. operations or mr x"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#C2D1CD]">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68827C]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#1D4A44] bg-[#071E1B] py-2.5 pl-10 pr-10 text-sm text-white placeholder-[#506661] outline-none transition focus:border-[#C9A04A] focus:ring-1 focus:ring-[#C9A04A]"
                  placeholder="Enter your account password"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#68827C] transition hover:text-[#C9A04A]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !identifier.trim() || !password}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A04A] px-4 py-3 text-sm font-semibold text-[#092824] shadow-md transition hover:bg-[#D8B05A] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign in to Command Centre'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-[#163833] pt-4 text-center">
            <p className="text-[11px] text-[#637C77]">
              Authorized personnel only. Access is tracked and audited under Covenant Shield Security Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
