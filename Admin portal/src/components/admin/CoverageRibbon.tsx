import React, { useState, useEffect, useMemo } from 'react';
import { Shift, Site } from '@/types';
import { getShifts, getSites } from '@/services/store';
import { Clock, ShieldAlert, CheckCircle2, AlertTriangle, Eye, Table as TableIcon } from 'lucide-react';
import { formatEATTime } from '@/utils/date';

interface CoverageRibbonProps {
  onSelectShift?: (shiftId: string) => void;
  onNavigateToRoster?: () => void;
}

interface SiteCoverageData {
  site: Site;
  shifts: Shift[];
  hourlyCoverage: Array<{
    hour: number; // 0..23
    coverageStatus: 'covered' | 'partial' | 'gap';
    assignedGuards: string[];
    isOvernightContinuing: boolean;
  }>;
  gaps: Array<{
    startHour: number;
    endHour: number;
    description: string;
  }>;
}

export const CoverageRibbon: React.FC<CoverageRibbonProps> = ({
  onSelectShift,
  onNavigateToRoster,
}) => {
  const [viewMode, setViewMode] = useState<'ribbon' | 'table'>('ribbon');
  const [nowMinutePercent, setNowMinutePercent] = useState<number>(0);
  const [activeTooltip, setActiveTooltip] = useState<{
    siteName: string;
    hour: number;
    status: string;
    guards: string[];
    continues: boolean;
    x: number;
    y: number;
  } | null>(null);

  const sites = getSites();
  const allShifts = getShifts();

  // Compute current minute in EAT (UTC+3)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
      const eatMinutes = (utcMinutes + 3 * 60) % (24 * 60);
      const percent = (eatMinutes / (24 * 60)) * 100;
      setNowMinutePercent(percent);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Glides each minute
    return () => clearInterval(interval);
  }, []);

  const coverageData: SiteCoverageData[] = useMemo(() => {
    return sites.map((site) => {
      const siteShifts = allShifts.filter(
        (s) => s.siteId === site.id && s.status !== 'cancelled'
      );

      const hourlyCoverage: SiteCoverageData['hourlyCoverage'] = [];
      const gaps: SiteCoverageData['gaps'] = [];

      for (let hour = 0; hour < 24; hour++) {
        const activeGuards: string[] = [];
        let isOvernightContinuing = false;

        siteShifts.forEach((s) => {
          const [startH] = s.startTime.split(':').map(Number);
          const [endH] = s.endTime.split(':').map(Number);

          let isActive = false;
          if (startH <= endH) {
            // Standard daytime shift
            if (hour >= startH && hour < endH) {
              isActive = true;
            }
          } else {
            // Overnight shift crossing midnight (e.g. 18:00 to 06:00)
            if (hour >= startH || hour < endH) {
              isActive = true;
              if (hour < endH) {
                isOvernightContinuing = true;
              }
            }
          }

          if (isActive) {
            activeGuards.push(s.guardName);
          }
        });

        let status: 'covered' | 'partial' | 'gap' = 'gap';
        if (activeGuards.length >= site.requiredGuardCount) {
          status = 'covered';
        } else if (activeGuards.length > 0) {
          status = 'partial';
        } else {
          status = 'gap';
        }

        hourlyCoverage.push({
          hour,
          coverageStatus: status,
          assignedGuards: activeGuards,
          isOvernightContinuing,
        });
      }

      // Detect contiguous gaps
      let currentGapStart: number | null = null;
      for (let h = 0; h < 24; h++) {
        if (hourlyCoverage[h].coverageStatus === 'gap') {
          if (currentGapStart === null) currentGapStart = h;
        } else {
          if (currentGapStart !== null) {
            gaps.push({
              startHour: currentGapStart,
              endHour: h,
              description: `Unmanned post between ${String(currentGapStart).padStart(2, '0')}:00 and ${String(h).padStart(2, '0')}:00 EAT`,
            });
            currentGapStart = null;
          }
        }
      }
      if (currentGapStart !== null) {
        gaps.push({
          startHour: currentGapStart,
          endHour: 24,
          description: `Unmanned post from ${String(currentGapStart).padStart(2, '0')}:00 to midnight EAT`,
        });
      }

      return {
        site,
        shifts: siteShifts,
        hourlyCoverage,
        gaps,
      };
    });
  }, [sites, allShifts]);

  // Overall gaps count across all facilities
  const totalGapsCount = coverageData.reduce((acc, curr) => acc + curr.gaps.length, 0);

  return (
    <div className="bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl p-5 emboss-card space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#003C35] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#F4F6F4] font-sans tracking-wide">
              24-Hour Guard Force Coverage Ribbon
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#071F1C] text-[#C9A04A] border border-[#C9A04A]/20">
              EAT (UTC+3)
            </span>
          </div>
          <p className="text-xs text-[#A0B2AC]">
            Continuous timeline tracking post allocations, cross-midnight shifts, and security vulnerabilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#1E6B45] inline-block" />
              <span className="text-[#A0B2AC]">Covered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#C9A04A] inline-block" />
              <span className="text-[#A0B2AC]">Partial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#A12B2B] inline-block" />
              <span className="text-[#A0B2AC]">Coverage Gap</span>
            </div>
          </div>

          {/* Toggle view mode */}
          <button
            onClick={() => setViewMode(viewMode === 'ribbon' ? 'table' : 'ribbon')}
            className="px-2.5 py-1 text-xs font-mono text-[#C9A04A] bg-[#071F1C] border border-[#003C35] rounded hover:border-[#C9A04A]/40 transition-colors flex items-center gap-1.5"
            aria-label="Toggle between graphical ribbon and accessible table"
          >
            {viewMode === 'ribbon' ? <TableIcon className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{viewMode === 'ribbon' ? 'Table View' : 'Ribbon View'}</span>
          </button>
        </div>
      </div>

      {viewMode === 'ribbon' ? (
        <div className="space-y-4">
          {/* Hourly Timeline Scale Axis */}
          <div className="pl-44 pr-2 hidden sm:block">
            <div className="relative h-4 text-[10px] font-mono text-[#52625D]">
              {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
                <span
                  key={h}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${(h / 24) * 100}%` }}
                >
                  {String(h).padStart(2, '0')}:00
                </span>
              ))}
            </div>
          </div>

          {/* Sites Ribbon Rows */}
          <div className="space-y-3 relative">
            {coverageData.map(({ site, hourlyCoverage, gaps }) => (
              <div
                key={site.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-[#092824] rounded-lg border border-[#003C35]"
              >
                {/* Site Label */}
                <div className="w-full sm:w-44 shrink-0 flex items-center justify-between sm:justify-start gap-2">
                  <span className="text-xs font-semibold text-[#F4F6F4] truncate">
                    {site.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#52625D] shrink-0">
                    Req: {site.requiredGuardCount}
                  </span>
                </div>

                {/* 24-hour Bar */}
                <div className="flex-1 relative h-7 bg-[#071F1C] rounded overflow-hidden flex border border-[#123D37]">
                  {hourlyCoverage.map((hourData) => {
                    let bg = '#1E6B45'; // Covered
                    if (hourData.coverageStatus === 'partial') bg = '#C9A04A';
                    if (hourData.coverageStatus === 'gap') bg = '#A12B2B';

                    return (
                      <div
                        key={hourData.hour}
                        className="flex-1 h-full border-r border-[#071F1C]/40 relative group cursor-pointer transition-opacity hover:opacity-80"
                        style={{ backgroundColor: bg }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setActiveTooltip({
                            siteName: site.name,
                            hour: hourData.hour,
                            status: hourData.coverageStatus,
                            guards: hourData.assignedGuards,
                            continues: hourData.isOvernightContinuing,
                            x: rect.left,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setActiveTooltip(null)}
                      >
                        {hourData.isOvernightContinuing && (
                          <span
                            title="Cross-midnight shift continues"
                            className="absolute top-0.5 right-0.5 text-[8px] font-mono text-white/90 font-bold select-none leading-none"
                          >
                            *
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Gold "Now" Line that glides with 1s ease */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-[#E6CB8A] shadow-[0_0_8px_#C9A04A] z-10 transition-all duration-1000 ease-[var(--e-lux)] pointer-events-none"
                    style={{ left: `${nowMinutePercent}%` }}
                    title={`Current EAT Time: ${nowMinutePercent.toFixed(1)}% of 24h`}
                  >
                    <div className="w-1.5 h-1.5 bg-[#C9A04A] rounded-full absolute -top-1 -left-[2px]" />
                  </div>
                </div>

                {/* Gaps indicator badge */}
                <div className="w-16 shrink-0 text-right">
                  {gaps.length > 0 ? (
                    <span className="text-[10px] font-mono font-bold text-[#A12B2B] bg-[#FBE9E9]/10 px-1.5 py-0.5 rounded border border-[#A12B2B]/40">
                      {gaps.length} {gaps.length === 1 ? 'gap' : 'gaps'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#1E6B45] flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Full</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Gaps Summary Callout */}
          {totalGapsCount > 0 ? (
            <div className="p-3 bg-[#071F1C] rounded-lg border border-[#A12B2B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#A12B2B]">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="font-semibold">
                  Attention Required: {totalGapsCount} unmanned post periods detected today in EAT.
                </span>
              </div>
              {onNavigateToRoster && (
                <button
                  onClick={onNavigateToRoster}
                  className="px-3 py-1 font-semibold text-xs text-[#092824] bg-[#C9A04A] hover:bg-[#E6CB8A] rounded transition-colors self-start sm:self-auto"
                >
                  Open Roster & Assign Guards →
                </button>
              )}
            </div>
          ) : (
            <div className="p-2.5 bg-[#071F1C] rounded border border-[#003C35] text-xs text-[#A0B2AC] flex items-center justify-between">
              <span>All active client sites are covered by rostered guard personnel for today.</span>
              <span className="text-[11px] font-mono text-[#C9A04A]">* indicates cross-midnight post shifts</span>
            </div>
          )}
        </div>
      ) : (
        /* Accessible Table Alternative */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono" aria-label="Guard coverage data table">
            <thead className="border-b border-[#003C35] text-[#A0B2AC]">
              <tr>
                <th className="py-2 px-3">Site Facility</th>
                <th className="py-2 px-3">Req Guards</th>
                <th className="py-2 px-3">Day Shift (06-18)</th>
                <th className="py-2 px-3">Night Shift (18-06)</th>
                <th className="py-2 px-3">Coverage Status</th>
                <th className="py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#003C35]/60">
              {coverageData.map(({ site, hourlyCoverage, gaps, shifts }) => {
                const dayGuards = shifts.filter((s) => s.shiftType === 'day_shift');
                const nightGuards = shifts.filter((s) => s.shiftType === 'night_shift');

                return (
                  <tr key={site.id} className="hover:bg-[#092824]">
                    <td className="py-2.5 px-3 text-[#F4F6F4] font-sans font-medium">{site.name}</td>
                    <td className="py-2.5 px-3 text-[#A0B2AC]">{site.requiredGuardCount}</td>
                    <td className="py-2.5 px-3 text-[#F4F6F4]">
                      {dayGuards.length > 0
                        ? dayGuards.map((g) => g.guardName).join(', ')
                        : 'No guard rostered (GAP)'}
                    </td>
                    <td className="py-2.5 px-3 text-[#F4F6F4]">
                      {nightGuards.length > 0
                        ? nightGuards.map((g) => `${g.guardName} (continues)`).join(', ')
                        : 'No guard rostered (GAP)'}
                    </td>
                    <td className="py-2.5 px-3">
                      {gaps.length > 0 ? (
                        <span className="text-[#A12B2B] font-bold">{gaps.length} Gaps Detected</span>
                      ) : (
                        <span className="text-[#1E6B45]">Fully Staffed</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {onNavigateToRoster && (
                        <button
                          onClick={onNavigateToRoster}
                          className="text-[#C9A04A] hover:underline"
                        >
                          Roster
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {activeTooltip && (
        <div
          className="fixed z-50 pointer-events-none p-2.5 bg-[#071F1C] border border-[#C9A04A]/40 rounded shadow-xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full mb-2"
          style={{ left: activeTooltip.x, top: activeTooltip.y }}
        >
          <div className="font-bold text-[#F4F6F4] font-sans">{activeTooltip.siteName}</div>
          <div className="text-[11px] font-mono text-[#C9A04A]">
            Time Slot: {String(activeTooltip.hour).padStart(2, '0')}:00 – {String((activeTooltip.hour + 1) % 24).padStart(2, '0')}:00 EAT
          </div>
          <div className="text-[11px] text-[#A0B2AC]">
            Status:{' '}
            <span
              className={
                activeTooltip.status === 'covered'
                  ? 'text-[#1E6B45] font-semibold'
                  : activeTooltip.status === 'partial'
                  ? 'text-[#C9A04A] font-semibold'
                  : 'text-[#A12B2B] font-bold'
              }
            >
              {activeTooltip.status.toUpperCase()}
            </span>
          </div>
          {activeTooltip.guards.length > 0 ? (
            <div className="text-[11px] text-[#F4F6F4]">
              Officer(s): {activeTooltip.guards.join(', ')}
            </div>
          ) : (
            <div className="text-[11px] text-[#A12B2B] italic">No guard stationed (Coverage Gap)</div>
          )}
          {activeTooltip.continues && (
            <div className="text-[10px] text-[#E6CB8A] font-mono">
              ★ Overnight duty shift continues across midnight boundary
            </div>
          )}
        </div>
      )}
    </div>
  );
};
