import React, { useState } from 'react';
import { Shield, Lock, Mail, User, Building, Phone, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import logo from '../../assets/images/logo.png';
interface ClientAuthModalProps {
  isOpen: boolean;
  onSuccess: (userData: any, accessToken: string) => void;
  apiBaseUrl?: string;
}

export const ClientAuthModal: React.FC<ClientAuthModalProps> = ({
  isOpen,
  onSuccess,
  apiBaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8000/api/v1',
}) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredChannel, setPreferredChannel] = useState('Both');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const baseUrl = apiBaseUrl.replace(/\/$/, '');

    try {
      if (isSignup) {
        // Register
        const regRes = await fetch(`${baseUrl}/auth/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            organization_name: organizationName.trim() || name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            preferred_channel: preferredChannel,
            password,
            role: 'CLIENT',
          }),
        });

        const regData = await regRes.json();
        if (!regRes.ok) {
          const msg = Array.isArray(regData?.password)
            ? regData.password[0]
            : regData?.email
            ? regData.email[0]
            : regData?.detail || regData?.message || 'Failed to create account.';
          setError(msg);
          setLoading(false);
          return;
        }

        // Auto login after registration
        const loginRes = await fetch(`${baseUrl}/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          setIsSignup(false);
          setError('Account registered. Please enter your credentials to sign in.');
          setLoading(false);
          return;
        }

        onSuccess(loginData.user || regData.user, loginData.access);
      } else {
        // Sign In
        const loginRes = await fetch(`${baseUrl}/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          setError(loginData?.detail || 'Invalid email or password. Please try again.');
          setLoading(false);
          return;
        }

        onSuccess(loginData.user, loginData.access);
      }
    } catch {
      setError('Unable to reach authentication service. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#002B26] border border-[#C9A04A]/30 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#C9A04A]/50 shadow-lg shadow-black/50">
            <img
              src={logo}
              alt="Covenant Shield Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold font-serif tracking-wide text-white">
            {isSignup ? 'Create Client Account' : 'Client Portal Sign In'}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            {isSignup
              ? 'Register your security portfolio to track requests and cases in real-time'
              : 'Enter your credentials to access your verified security dashboard'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-stone-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full pl-9 pr-3 py-2 bg-[#003C35]/60 border border-[#C9A04A]/25 rounded-lg text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#C9A04A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-300 uppercase tracking-wider mb-1">
                  Organization / Company Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={organizationName}
                    onChange={e => setOrganizationName(e.target.value)}
                    placeholder="e.g. Acacia Towers Ltd"
                    className="w-full pl-9 pr-3 py-2 bg-[#003C35]/60 border border-[#C9A04A]/25 rounded-lg text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#C9A04A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-300 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    className="w-full pl-9 pr-3 py-2 bg-[#003C35]/60 border border-[#C9A04A]/25 rounded-lg text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#C9A04A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-300 uppercase tracking-wider mb-1">
                  Preferred Escalation Channel
                </label>
                <select
                  value={preferredChannel}
                  onChange={e => setPreferredChannel(e.target.value)}
                  className="w-full px-3 py-2 bg-[#003C35]/60 border border-[#C9A04A]/25 rounded-lg text-sm text-white focus:outline-none focus:border-[#C9A04A]"
                >
                  <option value="Both" style={{background:'#002B26'}}>Both (Phone Call &amp; SMS)</option>
                  <option value="Phone Call" style={{background:'#002B26'}}>Direct Phone Call</option>
                  <option value="SMS" style={{background:'#002B26'}}>SMS Fast Alert</option>
                  <option value="WhatsApp" style={{background:'#002B26'}}>WhatsApp Business</option>
                  <option value="Email" style={{background:'#002B26'}}>Email Dispatch Only</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-medium text-stone-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full pl-9 pr-3 py-2 bg-[#003C35]/60 border border-[#C9A04A]/25 rounded-lg text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#C9A04A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-stone-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 bg-[#003C35]/60 border border-[#C9A04A]/25 rounded-lg text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#C9A04A]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-[#C9A04A] hover:bg-[#b58f3f] text-[#002B26] font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isSignup ? 'Create Account & Access Portal' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center pt-4 border-t border-[#C9A04A]/20 space-y-2">
          <div>
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError(null);
              }}
              className="text-xs text-stone-300 hover:text-[#C9A04A] transition-colors cursor-pointer"
            >
              {isSignup
                ? 'Already registered? Sign in here'
                : 'New client? Create an account to get started'}
            </button>
          </div>
          <div>
            <a
              href="http://localhost:3000/login"
              className="inline-block text-[11px] text-stone-400 hover:text-white transition-colors underline underline-offset-4"
            >
              Go to Covenant Shield Public Website & Portal Gateway →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
