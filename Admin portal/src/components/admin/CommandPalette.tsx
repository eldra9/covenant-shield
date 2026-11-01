import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Command,
  ArrowRight,
  ClipboardList,
  ShieldAlert,
  Building2,
  MapPin,
  Users2,
  CalendarDays,
  ClockAlert,
  X,
  Keyboard,
  Sparkles,
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';
import {
  getCases,
  getClients,
  getCurrentUser,
  getEmployees,
  getServiceRequests,
  getShifts,
  getSites,
} from '@/services/store';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: AdminTab, recordId?: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showShortcutSheet, setShowShortcutSheet] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const currentUser = getCurrentUser();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setShowShortcutSheet(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcuts (Ctrl+K, g then r/c/s/a, ?)
  useEffect(() => {
    let pendingG = false;
    let gTimeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea (unless this modal is handling it)
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Handle Ctrl+K / Cmd+K everywhere
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent or event
          window.dispatchEvent(new CustomEvent('covenant:open-command'));
        }
        return;
      }

      if (isOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
          return;
        }
        return;
      }

      if (isInput) return;

      // Help shortcut '?'
      if (e.key === '?' && !e.shiftKey) {
        // usually shift + / gives '?'
      }
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutSheet(true);
        window.dispatchEvent(new CustomEvent('covenant:open-command'));
        return;
      }

      // 'g' sequence
      if (e.key.toLowerCase() === 'g' && !pendingG) {
        pendingG = true;
        gTimeout = setTimeout(() => {
          pendingG = false;
        }, 800);
        return;
      }

      if (pendingG) {
        pendingG = false;
        if (gTimeout) clearTimeout(gTimeout);

        switch (e.key.toLowerCase()) {
          case 'r':
            e.preventDefault();
            onNavigate('requests');
            break;
          case 'c':
            e.preventDefault();
            onNavigate('cases');
            break;
          case 's':
            e.preventDefault();
            onNavigate('sites');
            break;
          case 'a':
            e.preventDefault();
            onNavigate('attendance');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gTimeout) clearTimeout(gTimeout);
    };
  }, [isOpen, onClose, onNavigate]);

  // Search items across real database
  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      icon: React.ComponentType<{ className?: string }>;
      action: () => void;
    }> = [];

    // Quick command actions
    const quickActions = [
      {
        id: 'act-new-shift',
        title: 'Roster Guard Shift',
        subtitle: 'Schedule a new day or night post shift',
        category: 'Quick Actions',
        icon: CalendarDays,
        action: () => {
          onNavigate('shifts');
          onClose();
        },
      },
      {
        id: 'act-review-attendance',
        title: 'Review Attendance Exceptions',
        subtitle: 'Audit biometric check-in anomalies and late arrivals',
        category: 'Quick Actions',
        icon: ClockAlert,
        action: () => {
          onNavigate('attendance');
          onClose();
        },
      },
      {
        id: 'act-new-case',
        title: 'Open Incident Case Dossier',
        subtitle: 'Document high-priority site violation or investigation',
        category: 'Quick Actions',
        icon: ShieldAlert,
        action: () => {
          onNavigate('cases');
          onClose();
        },
      },
      {
        id: 'act-reports',
        title: 'Generate Operational Audit Report',
        subtitle: 'Compile safe CSV exports for shift and attendance metrics',
        category: 'Quick Actions',
        icon: ClipboardList,
        action: () => {
          onNavigate('reports');
          onClose();
        },
      },
    ];

    if (!q) {
      return quickActions;
    }

    // Filter quick actions
    quickActions.forEach((act) => {
      if (
        act.title.toLowerCase().includes(q) ||
        act.subtitle.toLowerCase().includes(q)
      ) {
        items.push(act);
      }
    });

    // Search Service Requests
    getServiceRequests().forEach((req) => {
      const code = req.requestCode || req.referenceNumber;
      const site = req.siteName || req.siteAddress;
      if (
        code.toLowerCase().includes(q) ||
        req.clientName.toLowerCase().includes(q) ||
        site.toLowerCase().includes(q)
      ) {
        items.push({
          id: `req-${req.id}`,
          title: `${code} · ${req.clientName}`,
          subtitle: `${req.serviceType.replace(/_/g, ' ')} · ${req.status.replace(/_/g, ' ')}`,
          category: 'Service Requests',
          icon: ClipboardList,
          action: () => {
            onNavigate('requests', req.id);
            onClose();
          },
        });
      }
    });

    // Search Cases
    getCases().forEach((cs) => {
      const code = cs.caseCode || cs.caseNumber;
      if (
        code.toLowerCase().includes(q) ||
        cs.title.toLowerCase().includes(q) ||
        cs.siteName.toLowerCase().includes(q)
      ) {
        items.push({
          id: `case-${cs.id}`,
          title: `${code} · ${cs.title}`,
          subtitle: `${cs.siteName} · ${cs.severity.toUpperCase()} · ${cs.status.replace(/_/g, ' ')}`,
          category: 'Incident Cases',
          icon: ShieldAlert,
          action: () => {
            onNavigate('cases', cs.id);
            onClose();
          },
        });
      }
    });

    // Search Sites
    getSites().forEach((site) => {
      if (
        site.name.toLowerCase().includes(q) ||
        site.siteCode.toLowerCase().includes(q) ||
        site.city.toLowerCase().includes(q)
      ) {
        items.push({
          id: `site-${site.id}`,
          title: `${site.siteCode} · ${site.name}`,
          subtitle: `${site.city} · ${site.requiredGuardCount} Guards Required`,
          category: 'Security Sites',
          icon: MapPin,
          action: () => {
            onNavigate('sites', site.id);
            onClose();
          },
        });
      }
    });

    // Search Employees
    getEmployees().forEach((emp) => {
      const name = emp.fullName || emp.name;
      const num = emp.badgeNumber || emp.employeeNumber;
      const role = emp.rank || emp.role;
      if (
        name.toLowerCase().includes(q) ||
        num.toLowerCase().includes(q) ||
        role.toLowerCase().includes(q)
      ) {
        items.push({
          id: `emp-${emp.id}`,
          title: `${num} · ${name}`,
          subtitle: `${role} · ${emp.assignedSiteName || 'Assigned Officer'}`,
          category: 'Guard Force & Specialists',
          icon: Users2,
          action: () => {
            onNavigate('employees', emp.id);
            onClose();
          },
        });
      }
    });

    // Search Clients
    getClients().forEach((client) => {
      const ref = client.clientCode || client.accountReference;
      if (
        client.companyName.toLowerCase().includes(q) ||
        ref.toLowerCase().includes(q) ||
        client.contactPerson.toLowerCase().includes(q)
      ) {
        items.push({
          id: `client-${client.id}`,
          title: `${ref} · ${client.companyName}`,
          subtitle: `Contact: ${client.contactPerson} · ${client.industry || 'Commercial Client'}`,
          category: 'Client Accounts',
          icon: Building2,
          action: () => {
            onNavigate('clients', client.id);
            onClose();
          },
        });
      }
    });

    return items.slice(0, 16);
  }, [query, onNavigate, onClose]);

  // Keyboard navigation within list
  const handleKeyDownInBox = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        searchResults[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/75 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl bg-[#0D322D] border border-[#C9A04A]/30 rounded-xl shadow-2xl overflow-hidden emboss-card text-[#F4F6F4] transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownInBox}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#003C35] bg-[#071F1C]">
          <Search className="w-5 h-5 text-[#C9A04A] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands, requests, cases, guards, or facilities... (Esc to exit)"
            className="w-full bg-transparent border-none text-sm text-[#F4F6F4] placeholder-[#52625D] focus:outline-none"
            aria-label="Command search input"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#52625D] hover:text-[#F4F6F4] rounded mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-mono text-[#C9A04A] bg-[#003C35] px-2 py-0.5 rounded border border-[#C9A04A]/20 shrink-0">
            ESC
          </span>
        </div>

        {/* Shortcut Quick Hints */}
        <div className="px-4 py-2 bg-[#092824]/90 border-b border-[#003C35] flex items-center justify-between text-[11px] text-[#A0B2AC] font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-[#071F1C] border border-[#123D37] rounded text-[#C9A04A]">
                G then R
              </kbd>{' '}
              Requests
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-[#071F1C] border border-[#123D37] rounded text-[#C9A04A]">
                G then C
              </kbd>{' '}
              Cases
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-[#071F1C] border border-[#123D37] rounded text-[#C9A04A]">
                G then S
              </kbd>{' '}
              Sites
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-[#071F1C] border border-[#123D37] rounded text-[#C9A04A]">
                G then A
              </kbd>{' '}
              Attendance
            </span>
          </div>
          <button
            onClick={() => setShowShortcutSheet(!showShortcutSheet)}
            className="text-[#C9A04A] hover:underline flex items-center gap-1"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </button>
        </div>

        {/* Shortcut Sheet Modal Drawer */}
        {showShortcutSheet ? (
          <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto bg-[#071F1C]">
            <h4 className="text-sm font-semibold text-[#C9A04A] uppercase tracking-wider font-mono">
              Keyboard Reference Sheet
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#0D322D] rounded border border-[#003C35] space-y-2">
                <span className="font-semibold text-[#F4F6F4] block">Navigation Sequences</span>
                <div className="space-y-1 font-mono text-[11px] text-[#A0B2AC]">
                  <div><kbd className="text-[#C9A04A]">G</kbd> then <kbd className="text-[#C9A04A]">R</kbd> : Service Requests</div>
                  <div><kbd className="text-[#C9A04A]">G</kbd> then <kbd className="text-[#C9A04A]">C</kbd> : Incident Cases</div>
                  <div><kbd className="text-[#C9A04A]">G</kbd> then <kbd className="text-[#C9A04A]">S</kbd> : Security Sites</div>
                  <div><kbd className="text-[#C9A04A]">G</kbd> then <kbd className="text-[#C9A04A]">A</kbd> : Attendance & Exceptions</div>
                </div>
              </div>
              <div className="p-3 bg-[#0D322D] rounded border border-[#003C35] space-y-2">
                <span className="font-semibold text-[#F4F6F4] block">Roster & Operations</span>
                <div className="space-y-1 font-mono text-[11px] text-[#A0B2AC]">
                  <div><kbd className="text-[#C9A04A]">M</kbd> : Pick Shift to Move</div>
                  <div><kbd className="text-[#C9A04A]">Arrows</kbd> : Move Target Slot</div>
                  <div><kbd className="text-[#C9A04A]">Enter</kbd> : Commit Roster Drop</div>
                  <div><kbd className="text-[#C9A04A]">Ctrl+K</kbd> : Command Palette</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowShortcutSheet(false)}
              className="text-xs text-[#C9A04A] hover:underline font-mono"
            >
              ← Back to search results
            </button>
          </div>
        ) : (
          /* Results List */
          <div
            ref={listRef}
            className="max-h-[380px] overflow-y-auto divide-y divide-[#003C35]/60"
            role="listbox"
          >
            {searchResults.length === 0 ? (
              <div className="p-8 text-center text-[#52625D]">
                <p className="text-sm">No authorized records match &ldquo;{query}&rdquo;.</p>
                <p className="text-xs mt-1">Try searching by code, officer surname, or facility name.</p>
              </div>
            ) : (
              searchResults.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => item.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#123D37] text-[#FFFFFF]'
                        : 'hover:bg-[#092824] text-[#F4F6F4]'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-md ${
                          isSelected ? 'bg-[#C9A04A] text-[#003C35]' : 'bg-[#071F1C] text-[#C9A04A]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate flex items-center gap-2">
                          <span>{item.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#071F1C] text-[#A0B2AC] rounded border border-[#003C35]">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#A0B2AC] truncate font-mono">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? 'translate-x-1 text-[#C9A04A]' : 'opacity-0'
                      }`}
                    />
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#071F1C] border-t border-[#003C35] flex items-center justify-between text-[11px] text-[#52625D] font-mono">
          <span>
            Use <kbd className="text-[#C9A04A]">↑</kbd> <kbd className="text-[#C9A04A]">↓</kbd> to navigate, <kbd className="text-[#C9A04A]">Enter</kbd> to select
          </span>
          <span className="text-[#A0B2AC]">East Africa Time (EAT)</span>
        </div>
      </div>
    </div>
  );
};
