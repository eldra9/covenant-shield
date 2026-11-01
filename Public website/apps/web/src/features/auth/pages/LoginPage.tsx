import React, { useState } from 'react';
import { BrandLogo } from '../../../components/brand/BrandLogo.tsx';
import { GuillocheSeal } from '../../../motion/GuillocheSeal.tsx';
import { FormField } from '../../../components/forms/FormField.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { MagneticButton } from '../../../motion/MagneticButton.tsx';
import { Eye, EyeOff, Lock, ArrowRight, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';

export interface LoginPageProps {
  onNavigate: (path: string) => void;
}

type UserRole = 'CLIENT' | 'GUARD' | 'STAFF';

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || (isLocal ? 'http://localhost:8000/api/v1' : '/api/v1')).replace(/\/$/, '');
  const clientPortalBaseUrl = (import.meta.env.VITE_CLIENT_PORTAL_URL || (isLocal ? 'http://localhost:3001' : '/portal')).replace(/\/$/, '');
  const adminPortalBaseUrl = (import.meta.env.VITE_ADMIN_PORTAL_URL || (isLocal ? 'http://localhost:3002' : '/admin-portal')).replace(/\/$/, '');
  const guardPortalBaseUrl = (import.meta.env.VITE_GUARD_PORTAL_URL || (isLocal ? 'http://localhost:3003' : '/guard-portal')).replace(/\/$/, '');

  const [role, setRole] = useState<UserRole>('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPreferredChannel, setSignupPreferredChannel] = useState('Both');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  const getPasswordStrength = (value: string) => {
    if (!value) {
      return { score: 0, label: 'No password', tone: 'bg-slate-200', text: 'Enter a password to begin.' };
    }

    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 2) {
      return { score, label: 'Weak', tone: 'bg-red-500', text: 'Your password is weak.' };
    }
    if (score <= 4) {
      return { score, label: 'Medium', tone: 'bg-yellow-500', text: 'Good but add more complexity.' };
    }
    return { score, label: 'Strong', tone: 'bg-emerald-500', text: 'Strong password detected.' };
  };

  const passwordStrength = getPasswordStrength(signupPassword);

  const getPortalTarget = (portalRole: string, accessToken?: string, refreshToken?: string, userPayload?: any) => {
    const authParams = new URLSearchParams();
    if (accessToken) authParams.set('token', accessToken);
    if (refreshToken) authParams.set('refresh', refreshToken);
    if (userPayload) authParams.set('user', JSON.stringify(userPayload));
    const authQuery = authParams.toString() ? `?${authParams.toString()}` : '';

    const targetMap: Record<string, string> = {
      CLIENT: `${clientPortalBaseUrl}/${authQuery}#/portal/dashboard`,
      SUPER_ADMIN: `${adminPortalBaseUrl}/${authQuery}`,
      OPERATIONS: `${adminPortalBaseUrl}/${authQuery}`,
      SUPERVISOR: `${adminPortalBaseUrl}/${authQuery}`,
      GUARD: `${guardPortalBaseUrl}/${authQuery}`,
    };

    return targetMap[portalRole] || `${clientPortalBaseUrl}/${authQuery}#/portal/dashboard`;
  };

  const persistAuthenticatedSession = (userPayload: Record<string, any>, accessToken?: string, refreshToken?: string) => {
    const resolvedEmail = (userPayload?.email || email.trim() || signupEmail.trim() || '').toLowerCase();
    const resolvedName = userPayload?.name || userPayload?.fullName || signupName.trim() || email.trim() || 'Client User';
    const resolvedRole = String(userPayload?.role || 'CLIENT').toUpperCase();
    const normalizedUser = {
      ...(userPayload || {}),
      id: userPayload?.id || `usr-${resolvedEmail.replace(/[^a-z0-9]+/g, '-') || 'client'}`,
      email: resolvedEmail,
      name: resolvedName,
      fullName: resolvedName,
      role: resolvedRole,
      clientId: userPayload?.client_id || userPayload?.clientId || `client-${resolvedName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'portal'}`,
      organization_name: userPayload?.organization_name || userPayload?.organizationName || resolvedName,
    };

    localStorage.setItem('covenant_shield_access_token', accessToken || '');
    localStorage.setItem('covenant_shield_refresh_token', refreshToken || '');
    localStorage.setItem('covenant_shield_user', JSON.stringify(normalizedUser));
    localStorage.setItem('covenant_shield_session_email', normalizedUser.email);
    return normalizedUser;
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim() || !signupPhone.trim()) {
      setErrorMsg('Please complete all required fields including telephone number.');
      return;
    }

    if (passwordStrength.label === 'Weak') {
      setErrorMsg('Your password is weak. Use at least 8 characters with uppercase, lowercase, numbers, and symbols.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
          phone: signupPhone.trim(),
          preferred_channel: signupPreferredChannel,
          password: signupPassword,
          role: 'CLIENT',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data?.password)
          ? data.password[0]
          : data?.detail || data?.message || 'Unable to create your account.';
        setErrorMsg(message);
        return;
      }

      const loginResponse = await fetch(`${apiBaseUrl}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: signupEmail.trim().toLowerCase(), password: signupPassword }),
      });

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) {
        setSignupSuccess('Account created successfully. Please sign in with your new credentials.');
        setEmail(signupEmail.trim().toLowerCase());
        setPassword(signupPassword);
        setSignupName('');
        setSignupEmail('');
        setSignupPhone('');
        setSignupPassword('');
        setRole('CLIENT');
        setIsSignup(false);
        return;
      }

      const sessionUser = persistAuthenticatedSession(loginData.user || {
        id: data?.user?.id,
        name: signupName.trim(),
        email: signupEmail.trim().toLowerCase(),
        phone: signupPhone.trim(),
        directPhone: signupPhone.trim(),
        alertPhone: signupPhone.trim(),
        preferredChannel: signupPreferredChannel,
        role: 'CLIENT',
        client_id: `client-${signupName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'portal'}`,
        organization_name: signupName.trim() || 'Client Portal',
      }, loginData.access, loginData.refresh);

      setSignupSuccess('Account created successfully. Redirecting to your portal...');
      setEmail(signupEmail.trim().toLowerCase());
      setPassword(signupPassword);
      setSignupName('');
      setSignupEmail('');
      setSignupPhone('');
      setSignupPassword('');
      setRole('CLIENT');
      setIsSignup(false);
      window.location.assign(getPortalTarget('CLIENT', loginData.access, loginData.refresh, sessionUser));
    } catch (error) {
      setErrorMsg('Unable to connect to the secure database right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Invalid credentials provided. Please verify your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setIsLockedOut(true);
          setErrorMsg('Too many attempts. Try again later or reset your password.');
        } else {
          setErrorMsg(data?.detail || 'Invalid credentials provided. Please verify your email and password.');
        }
        return;
      }

      const sessionUser = persistAuthenticatedSession(data.user || {
        name: email.trim(),
        email: email.trim().toLowerCase(),
        role: role || 'CLIENT',
      }, data.access, data.refresh);

      const resolvedRole = String(data?.user?.role || role || 'CLIENT').toUpperCase();
      const target = getPortalTarget(resolvedRole, data.access, data.refresh, sessionUser);
      window.location.assign(target);
    } catch (error) {
      setErrorMsg('Unable to verify your account in the secure database. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F4] flex flex-col justify-center pt-[72px]">
      <header className="fixed top-0 left-0 right-0 z-40 h-[72px] bg-[#003C35] border-b border-[#C9A04A]/25 shadow-lg shadow-black/20">
        <div className="max-w-[1280px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center shrink-0">
            <BrandLogo placement="nav" onClick={() => onNavigate('/')} />
          </div>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-white/85" aria-label="Main Navigation">
            <button onClick={() => onNavigate('/')} className="text-xs xl:text-sm font-medium hover:text-white transition-colors cursor-pointer">Home</button>
            <button onClick={() => onNavigate('/about')} className="text-xs xl:text-sm font-medium hover:text-white transition-colors cursor-pointer">About</button>
            <button onClick={() => onNavigate('/services')} className="text-xs xl:text-sm font-medium hover:text-white transition-colors cursor-pointer">Services</button>
            <button onClick={() => onNavigate('/track')} className="text-xs xl:text-sm font-medium hover:text-white transition-colors cursor-pointer">Request Tracking</button>
            <button onClick={() => onNavigate('/feedback')} className="text-xs xl:text-sm font-medium hover:text-white transition-colors cursor-pointer">Feedback &amp; Complaints</button>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <button onClick={() => onNavigate('/login')} className="text-sm font-medium text-white/85 hover:text-white transition-colors cursor-pointer">Login</button>
            <button onClick={() => onNavigate('/request')} className="px-4 py-2 rounded border border-[#C9A04A] bg-[#C9A04A] text-[#003C35] text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#B38C3B] transition-colors cursor-pointer">
              Request a Service
            </button>
          </div>
        </div>
      </header>

      {/* Split screen on lg+ (left forest panel, right form card) */}
      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Deep Forest Panel (Columns 1-5 on lg+) */}
        <div
          className="hidden lg:flex lg:col-span-5 bg-[#092824] text-white p-12 flex-col justify-between relative overflow-hidden"
          style={{
            boxShadow: 'inset -1px 0 0 rgba(201,160,74,0.25)',
          }}
        >
          {/* Guilloche Seal Watermark */}
          <div
            className="absolute -bottom-20 -right-20 opacity-15 pointer-events-none select-none"
            aria-hidden="true"
          >
            <GuillocheSeal size={480} variant="gold" strokeColor="#C9A04A" />
          </div>

          <div className="space-y-8 relative z-10">
            <div className="pt-8 space-y-4">
              <span className="text-xs font-mono font-semibold tracking-widest uppercase text-[#C9A04A]">
                COMMAND LOGIN GATEWAY
              </span>
              <h2 className="font-display text-4xl xl:text-5xl font-medium text-white leading-tight">
                Welcome back to the watch. [DRAFT]
              </h2>
              <p className="text-sm text-white/70 leading-relaxed max-w-sm">
                Dedicated authorization gateway for corporate client account directors, field sentries,
                and centralized dispatch command.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-12 border-t border-white/10 text-xs text-white/50 flex items-center justify-between font-mono">
            <span>256-Bit TLS Authenticated</span>
            <span>Covenant Shield Defense</span>
          </div>
        </div>

        {/* Right Form Card (Columns 6-12 on lg+, single column below) */}
        <div className="lg:col-span-7 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-12 lg:py-20 max-w-xl mx-auto w-full">
          <div className="mb-6 lg:hidden flex justify-center">
            <BrandLogo placement="nav" onClick={() => onNavigate('/')} />
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-[#D9E0DC] shadow-xs space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-medium text-[#003C35]">
                {isSignup ? 'Create your account' : 'Sign in to your account'}
              </h1>
              <p className="text-xs text-[#52625D] mt-1">
                {isSignup
                  ? 'Register your organization and begin secure access to your client portal.'
                  : 'Select your assigned division to route directly to your portal.'}
              </p>
            </div>

            {/* Client Portal Access */}
            <div className="rounded-lg bg-[#F4F6F4] p-2 border border-[#D9E0DC] text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#003C35]">
              Client Portal Access
            </div>

            {signupSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                {signupSuccess}
              </div>
            )}

            {/* Lockout or Failure Alert */}
            {errorMsg && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-[#FBE9E9] border border-[#A12B2B]/40 text-[#A12B2B] text-xs flex items-center gap-2.5 animate-fadeIn"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isSignup ? (
              <form onSubmit={handleSignupSubmit} className="space-y-5">
                <FormField id="signup-name" label="Full Name" required>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                </FormField>

                <FormField id="signup-email" label="Email Address" required>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@company.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </FormField>

                <FormField id="signup-phone" label="Telephone / Mobile Phone" required>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="e.g. +254 700 123 456"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                  />
                </FormField>

                <FormField id="signup-channel" label="Preferred Escalation Channel" required>
                  <select
                    id="signup-channel"
                    value={signupPreferredChannel}
                    onChange={(e) => setSignupPreferredChannel(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#CCD8D2] rounded-lg text-[#003C35] font-medium focus:outline-none focus:border-[#003C35] focus:ring-1 focus:ring-[#003C35]"
                  >
                    <option value="Both">Both (Phone Call &amp; SMS Instant Broadcast)</option>
                    <option value="Phone Call">Direct Phone Call</option>
                    <option value="SMS">SMS Fast Alert</option>
                    <option value="WhatsApp">WhatsApp Business</option>
                    <option value="Email">Email Dispatch Only</option>
                  </select>
                </FormField>

                <FormField id="signup-password" label="Password" required>
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a secure password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#52625D] hover:text-[#003C35] cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </FormField>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#52625D]">
                    <span>Password strength</span>
                    <span className="font-semibold text-[#003C35]">{passwordStrength.label}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#E7ECEA] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${passwordStrength.tone}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#52625D]">{passwordStrength.text}</p>
                </div>

                <MagneticButton
                  type="submit"
                  variant="gold"
                  disabled={isLoading}
                  className="w-full !py-3.5 font-bold uppercase text-xs tracking-wider shadow-md"
                >
                  <span className="flex items-center justify-center gap-2">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
                  </span>
                </MagneticButton>

                <div className="text-center text-xs text-[#52625D]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignup(false);
                      setErrorMsg(null);
                    }}
                    className="text-[#003C35] font-semibold hover:text-[#C9A04A] underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField id="login-email" label="Email Address" required>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={
                      role === 'CLIENT'
                        ? 'client.director@enterprise.com'
                        : role === 'GUARD'
                        ? 'operative.badge@covenantshield.com'
                        : 'dispatch.officer@covenantshield.com'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormField>

                <FormField id="login-password" label="Password" required>
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#52625D] hover:text-[#003C35] cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </FormField>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#52625D]">
                    {failedAttempts > 0 && failedAttempts < 5
                      ? `${5 - failedAttempts} attempts remaining`
                      : 'Role-based access'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[#003C35] font-semibold hover:text-[#C9A04A] underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <MagneticButton
                  type="submit"
                  variant="gold"
                  disabled={isLoading || isLockedOut}
                  className="w-full !py-3.5 font-bold uppercase text-xs tracking-wider shadow-md"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                  </span>
                </MagneticButton>

                <div className="text-center text-xs text-[#52625D]">
                  New here?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignup(true);
                      setErrorMsg(null);
                    }}
                    className="text-[#003C35] font-semibold hover:text-[#C9A04A] underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </div>
              </form>
            )}

            <div className="pt-4 border-t border-[#D9E0DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#52625D]">
              <span>Need to track without logging in?</span>
              <button
                type="button"
                onClick={() => onNavigate('/track')}
                className="text-[#003C35] font-semibold hover:text-[#C9A04A] underline cursor-pointer"
              >
                Track with reference identifier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-[#D9E0DC] p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl animate-fadeIn">
            <div>
              <h3 className="font-display text-xl font-semibold text-[#003C35]">
                Reset Access Password
              </h3>
              <p className="text-xs text-[#52625D] mt-1">
                Enter your authorized address. Instructions will be dispatched to your registered recovery desk.
              </p>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 text-xs space-y-3">
                <p>Recovery email dispatched to <strong>{forgotEmail}</strong>.</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSent(false);
                    setForgotEmail('');
                  }}
                  className="w-full py-2.5 rounded bg-[#003C35] text-white text-xs font-semibold uppercase"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <FormField id="forgot-email" label="Authorized Email" required>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="e.g. director@enterprise.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </FormField>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-4 py-2 text-xs font-medium text-[#52625D] hover:text-[#003C35]"
                  >
                    Cancel
                  </button>
                  <MagneticButton
                    type="submit"
                    variant="gold"
                    className="!px-5 !py-2.5 text-xs font-bold uppercase"
                  >
                    Send Reset Link
                  </MagneticButton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
