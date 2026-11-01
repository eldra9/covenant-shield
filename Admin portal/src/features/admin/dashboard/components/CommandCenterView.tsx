import React, { useState, useEffect, useMemo } from 'react';
import {
  getSites,
  getEmployees,
  getAttendanceRecords,
  getCases,
  getServiceRequests,
  getCurrentUser,
  subscribe,
} from '@/services/store';
import { AdminTab } from '@/components/admin/AdminSidebar';
import { ActiveGuardWithGPS } from '@/types';
import {
  Radio,
  Clock,
  RefreshCw,
  Shield,
  Smartphone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Users,
  Building2,
  Search,
  PlusCircle,
  Battery,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Activity,
} from 'lucide-react';

interface CommandCenterViewProps {
  onNavigate: (tab: AdminTab, recordId?: string) => void;
}

const DEFAULT_ACTIVE_GUARDS: ActiveGuardWithGPS[] = [
  {
    id: 'grd-1',
    guardId: 'emp-101',
    guardName: 'David Kiptoo',
    badgeNumber: 'CS-GRD-041',
    siteId: 'site-1',
    siteName: 'Westlands Commercial HQ',
    phone: '+254 712 345 678',
    checkInTime: '07:45 EAT',
    lat: -1.2683,
    lng: 36.8041,
    accuracyMeters: 4.5,
    batteryLevel: 91,
    appSignedIn: true,
    gpsEnabled: true,
    status: 'on_time',
  },
  {
    id: 'grd-2',
    guardId: 'emp-102',
    guardName: 'Samuel Okello',
    badgeNumber: 'CS-GRD-055',
    siteId: 'site-2',
    siteName: 'Upper Hill Financial Hub',
    phone: '+254 722 890 123',
    checkInTime: '07:50 EAT',
    lat: -1.2995,
    lng: 36.8150,
    accuracyMeters: 5.2,
    batteryLevel: 84,
    appSignedIn: true,
    gpsEnabled: true,
    status: 'on_time',
  },
  {
    id: 'grd-3',
    guardId: 'emp-103',
    guardName: 'Erick Ochieng',
    badgeNumber: 'CS-GRD-062',
    siteId: 'site-1',
    siteName: 'Westlands Commercial HQ',
    phone: '+254 733 456 789',
    checkInTime: '08:02 EAT',
    lat: -1.2691,
    lng: 36.8048,
    accuracyMeters: 6.8,
    batteryLevel: 76,
    appSignedIn: true,
    gpsEnabled: true,
    status: 'on_time',
  },
  {
    id: 'grd-4',
    guardId: 'emp-104',
    guardName: 'Brian Kiprop',
    badgeNumber: 'CS-GRD-078',
    siteId: 'site-3',
    siteName: 'Industrial Area Logistics Depo',
    phone: '+254 799 112 233',
    checkInTime: '08:10 EAT',
    lat: -1.3120,
    lng: 36.8520,
    accuracyMeters: 4.1,
    batteryLevel: 89,
    appSignedIn: true,
    gpsEnabled: true,
    status: 'on_time',
  },
  {
    id: 'grd-5',
    guardId: 'emp-105',
    guardName: 'Faith Wangari',
    badgeNumber: 'CS-GRD-089',
    siteId: 'site-2',
    siteName: 'Upper Hill Financial Hub',
    phone: '+254 744 556 677',
    checkInTime: '08:15 EAT',
    lat: -1.3002,
    lng: 36.8142,
    accuracyMeters: 12.0,
    batteryLevel: 65,
    appSignedIn: true,
    gpsEnabled: true,
    status: 'on_time',
  },
  {
    id: 'grd-6',
    guardId: 'emp-106',
    guardName: 'Kevin Mutiso',
    badgeNumber: 'CS-GRD-094',
    siteId: 'site-3',
    siteName: 'Industrial Area Logistics Depo',
    phone: '+254 755 667 788',
    checkInTime: 'Scheduled 18:00',
    lat: -1.3130,
    lng: 36.8530,
    accuracyMeters: 0,
    batteryLevel: 0,
    appSignedIn: false,
    gpsEnabled: false,
    status: 'offline',
  },
];

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({ onNavigate }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribe(() => setTick((t) => t + 1));
  }, []);

  const rawSites = getSites();
  const rawEmployees = getEmployees();
  const cases = getCases();
  const requests = getServiceRequests();
  const currentUser = getCurrentUser();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'signed_in' | 'offline'>('all');

  // Guards telemetry state
  const [guards, setGuards] = useState<ActiveGuardWithGPS[]>(() => {
    try {
      const saved = localStorage.getItem('cs_command_guards_gps');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ACTIVE_GUARDS;
  });

  const updateGuards = (newGuards: ActiveGuardWithGPS[]) => {
    setGuards(newGuards);
    try {
      localStorage.setItem('cs_command_guards_gps', JSON.stringify(newGuards));
    } catch {}
  };

  // Sync registered employees into active guards board
  useEffect(() => {
    const registeredGuards = rawEmployees.filter((e) => e.role === 'guard' || !e.role);
    if (registeredGuards.length > 0) {
      setGuards((prev) => {
        const existingIds = new Set(prev.map((g) => g.guardId));
        const newOnes: ActiveGuardWithGPS[] = [];

        registeredGuards.forEach((emp, i) => {
          if (!existingIds.has(emp.id)) {
            newOnes.push({
              id: `grd-${emp.id}`,
              guardId: emp.id,
              guardName: emp.name,
              badgeNumber: emp.badgeNumber || `CS-GRD-${200 + i}`,
              siteId: emp.assignedSiteIds?.[0] || 'site-1',
              siteName: emp.assignedSiteName || 'Main Security Post',
              phone: emp.phone || '+254 700 000 000',
              checkInTime: '08:00 EAT',
              lat: -1.2921,
              lng: 36.8219,
              accuracyMeters: 5.0,
              batteryLevel: 85,
              appSignedIn: true,
              gpsEnabled: true,
              status: 'on_time',
            });
          }
        });

        if (newOnes.length > 0) {
          const merged = [...prev, ...newOnes];
          try {
            localStorage.setItem('cs_command_guards_gps', JSON.stringify(merged));
          } catch {}
          return merged;
        }
        return prev;
      });
    }
  }, [rawEmployees]);

  // Fallback sites
  const sites = useMemo(() => {
    if (rawSites.length > 0) return rawSites;
    return [
      {
        id: 'site-1',
        siteCode: 'CS-STE-001',
        name: 'Westlands Commercial HQ',
        clientId: 'cl-1',
        clientName: 'Safaricom Plaza PLC',
        address: 'Waiyaki Way, Westlands',
        city: 'Nairobi',
        contactPerson: 'David Kiptoo',
        contactPhone: '+254 712 345 678',
        status: 'active' as const,
        operationalNotes: '24/7 armed gate checkpoint with biometric turnstile',
        assignedSupervisorIds: [],
        requiredGuardCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'site-2',
        siteCode: 'CS-STE-002',
        name: 'Upper Hill Financial Hub',
        clientId: 'cl-2',
        clientName: 'Equity Centre',
        address: 'Hospital Road, Upper Hill',
        city: 'Nairobi',
        contactPerson: 'Samuel Okello',
        contactPhone: '+254 722 890 123',
        status: 'active' as const,
        operationalNotes: 'Executive office towers with strict visitor screening',
        assignedSupervisorIds: [],
        requiredGuardCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'site-3',
        siteCode: 'CS-STE-003',
        name: 'Industrial Area Logistics Depo',
        clientId: 'cl-3',
        clientName: 'Bamburi Logistics',
        address: 'Enterprise Road, Industrial Area',
        city: 'Nairobi',
        contactPerson: 'Brian Kiprop',
        contactPhone: '+254 799 112 233',
        status: 'active' as const,
        operationalNotes: 'Heavy freight warehouse perimeter patrols',
        assignedSupervisorIds: [],
        requiredGuardCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }, [rawSites]);

  // Clock
  const [liveTime, setLiveTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const eatFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Nairobi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setLiveTime(`${eatFormatter.format(now)} EAT (UTC+3)`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtered guards
  const filteredGuards = useMemo(() => {
    return guards.filter((g) => {
      const matchSearch =
        g.guardName.toLowerCase().includes(search.toLowerCase()) ||
        g.siteName.toLowerCase().includes(search.toLowerCase()) ||
        g.badgeNumber.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (filter === 'signed_in') return g.appSignedIn;
      if (filter === 'offline') return !g.appSignedIn;
      return true;
    });
  }, [guards, search, filter]);

  // Metrics
  const signedInCount = guards.filter((g) => g.appSignedIn).length;
  const sitesMannedCount = sites.filter((s) =>
    guards.some((g) => g.siteId === s.id && g.appSignedIn)
  ).length;

  // Simulate a guard checking in
  const handleSimulateCheckIn = () => {
    const names = ['Victor Mwangi', 'Hassan Abdi', 'Peter Kamau', 'Collins Kipruto', 'Dennis Wekesa'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomSite = sites[Math.floor(Math.random() * sites.length)];

    const newGuard: ActiveGuardWithGPS = {
      id: `grd-sim-${Date.now()}`,
      guardId: `emp-sim-${Date.now()}`,
      guardName: randomName,
      badgeNumber: `CS-GRD-${Math.floor(100 + Math.random() * 900)}`,
      siteId: randomSite.id,
      siteName: randomSite.name,
      phone: `+254 7${Math.floor(10000000 + Math.random() * 90000000)}`,
      checkInTime: 'Just Now',
      lat: -1.2921,
      lng: 36.8219,
      accuracyMeters: 4.5,
      batteryLevel: Math.floor(75 + Math.random() * 20),
      appSignedIn: true,
      gpsEnabled: true,
      status: 'on_time',
    };

    updateGuards([newGuard, ...guards]);
  };

  return (
    <div className="space-y-6">
      {/* ── TOP COMMAND DESK HEADER ── */}
      <div className="bg-[#15171B] border border-[#30343B] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20C997] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#20C997]" />
            </span>
            <h1 className="text-base font-bold font-mono tracking-wider text-[#F5F5F5]">
              SUPER ADMIN COMMAND CENTER
            </h1>
          </div>
          <p className="text-xs text-[#A5A9B0] mt-1">
            Operations control · Real-time guard app sign-ins · Post coverage & dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1C1F24] border border-[#30343B] font-mono text-xs text-[#20C997]">
            <Clock className="w-3.5 h-3.5" />
            <span>{liveTime || '00:00:00 EAT (UTC+3)'}</span>
          </div>

          <button
            onClick={handleSimulateCheckIn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#20C997] hover:bg-[#20C997]/90 text-[#090A0D] font-mono font-bold text-xs transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Simulate Check-In</span>
          </button>
        </div>
      </div>

      {/* ── 4 PRIMARY KPI METRIC CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[#15171B] border border-[#30343B] rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A5A9B0] font-mono">Guards Signed In</span>
            <Smartphone className="w-4 h-4 text-[#20C997]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#20C997]">
            {signedInCount}/{guards.length}
          </div>
          <div className="text-[11px] text-[#A5A9B0]">Active on Mobile App</div>
        </div>

        <div className="p-4 bg-[#15171B] border border-[#30343B] rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A5A9B0] font-mono">Sites Manned</span>
            <ShieldCheck className="w-4 h-4 text-[#398BFF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#398BFF]">
            {sitesMannedCount}/{sites.length}
          </div>
          <div className="text-[11px] text-[#A5A9B0]">Guarded Security Posts</div>
        </div>

        <div className="p-4 bg-[#15171B] border border-[#30343B] rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A5A9B0] font-mono">Pending Requests</span>
            <Building2 className="w-4 h-4 text-[#FF8A35]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#FF8A35]">
            {requests.filter((r) => ['new', 'under_review'].includes(r.status)).length}
          </div>
          <div className="text-[11px] text-[#A5A9B0]">Service Intakes</div>
        </div>

        <div className="p-4 bg-[#15171B] border border-[#30343B] rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A5A9B0] font-mono">Open Cases</span>
            <AlertCircle className="w-4 h-4 text-[#F04444]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F04444]">
            {cases.filter((c) => c.status !== 'closed').length}
          </div>
          <div className="text-[11px] text-[#A5A9B0]">Incidents & Inquiries</div>
        </div>
      </div>

      {/* ── TWO-COLUMN COMMAND OPERATIONS SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT (2 COLUMNS): LIVE GUARD DUTY & APP TELEMETRY BOARD ── */}
        <div className="lg:col-span-2 bg-[#15171B] border border-[#30343B] rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#30343B]">
            <div>
              <h2 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#20C997]" />
                <span>Guard App Status & Duty Telemetry</span>
              </h2>
              <p className="text-xs text-[#A5A9B0] mt-0.5">
                Personnel logged into the mobile application
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#1C1F24] border border-[#30343B] rounded-lg text-xs font-mono">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded transition-colors ${
                  filter === 'all' ? 'bg-[#30343B] text-white font-bold' : 'text-[#A5A9B0]'
                }`}
              >
                All ({guards.length})
              </button>
              <button
                onClick={() => setFilter('signed_in')}
                className={`px-3 py-1 rounded transition-colors ${
                  filter === 'signed_in' ? 'bg-[#20C997]/20 text-[#20C997] font-bold' : 'text-[#A5A9B0]'
                }`}
              >
                Signed In ({signedInCount})
              </button>
              <button
                onClick={() => setFilter('offline')}
                className={`px-3 py-1 rounded transition-colors ${
                  filter === 'offline' ? 'bg-[#30343B] text-white font-bold' : 'text-[#A5A9B0]'
                }`}
              >
                Offline ({guards.length - signedInCount})
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#A5A9B0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guards by name, site, or badge number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#1C1F24] border border-[#30343B] rounded-lg text-[#F5F5F5] placeholder-[#A5A9B0]/60 focus:outline-none focus:border-[#20C997]"
            />
          </div>

          {/* Guards Roster Cards */}
          <div className="divide-y divide-[#30343B] max-h-[480px] overflow-y-auto custom-scrollbar">
            {filteredGuards.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#A5A9B0] font-mono">
                No guards found matching your filter criteria.
              </div>
            ) : (
              filteredGuards.map((guard) => (
                <div
                  key={guard.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1C1F24]/50 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#1C1F24] border border-[#30343B] flex items-center justify-center shrink-0">
                      <span className="font-mono text-xs font-bold text-[#20C997]">
                        {guard.guardName.charAt(0)}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F5F5F5] truncate">
                          {guard.guardName}
                        </span>
                        <span className="text-[10px] text-[#A5A9B0] font-mono">
                          {guard.badgeNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#A5A9B0] mt-0.5">
                        <span className="flex items-center gap-1 truncate text-[#F5F5F5]">
                          <MapPin className="w-3 h-3 text-[#398BFF] shrink-0" />
                          <span className="truncate">{guard.siteName}</span>
                        </span>
                        <span>·</span>
                        <span className="font-mono">{guard.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: App & Check-In Status */}
                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-right font-mono text-[11px]">
                      <div className="text-[#A5A9B0] flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-[#20C997]" />
                        <span>{guard.checkInTime}</span>
                      </div>
                      {guard.appSignedIn && (
                        <div className="text-[10px] text-[#20C997] mt-0.5">
                          Battery: {guard.batteryLevel}%
                        </div>
                      )}
                    </div>

                    <div>
                      {guard.appSignedIn ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#20C997] animate-pulse" />
                          SIGNED IN
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-[#30343B] text-[#A5A9B0]">
                          OFFLINE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT (1 COLUMN): SITE COVERAGE & LIVE ACTIVITY STREAM ── */}
        <div className="space-y-6">
          {/* Sites Manned Status */}
          <div className="bg-[#15171B] border border-[#30343B] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#30343B]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#F5F5F5]">
                <ShieldCheck className="w-4 h-4 text-[#398BFF]" />
                <span>Security Sites Coverage</span>
              </div>
              <button
                onClick={() => onNavigate('sites')}
                className="text-xs font-mono text-[#398BFF] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
              {sites.map((site) => {
                const guardsAtSite = guards.filter(
                  (g) => g.siteId === site.id && g.appSignedIn
                );
                const isManned = guardsAtSite.length > 0;

                return (
                  <div
                    key={site.id}
                    onClick={() => onNavigate('sites', site.id)}
                    className="p-2.5 bg-[#1C1F24] border border-[#30343B] hover:border-[#398BFF] rounded-lg transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-[#F5F5F5] truncate">
                        {site.name}
                      </div>
                      <div className="text-[10px] text-[#A5A9B0] font-mono truncate">
                        {site.address}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {isManned ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/40">
                          {guardsAtSite.length} on post
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F04444]/20 text-[#F04444] border border-[#F04444]/40">
                          Unmanned
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Mobile App Check-In Stream */}
          <div className="bg-[#15171B] border border-[#30343B] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#30343B]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#F5F5F5]">
                <Activity className="w-4 h-4 text-[#20C997]" />
                <span>Live App Activity Feed</span>
              </div>
              <span className="text-[10px] text-[#20C997] font-mono">LIVE FEED</span>
            </div>

            <div className="space-y-2.5 max-h-[240px] overflow-y-auto custom-scrollbar">
              {guards
                .filter((g) => g.appSignedIn)
                .map((g) => (
                  <div
                    key={g.id}
                    className="p-2.5 bg-[#1C1F24] border border-[#30343B] rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F5F5F5]">{g.guardName}</span>
                      <span className="text-[10px] font-mono text-[#A5A9B0]">{g.checkInTime}</span>
                    </div>
                    <div className="text-[11px] text-[#20C997] flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-[#20C997]" />
                      <span>Mobile app check-in verified at {g.siteName}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
