import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  Users,
  UserPlus,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  AlertCircle,
  Shield,
  Briefcase,
  Check,
  ArrowRight,
} from 'lucide-react';
import { ServiceRequest } from '@/types';
import { getEmployees, assignGuardsToRequest } from '@/services/store';
import { showToast } from '@/components/admin/ToastSystem';

interface RequestAssignmentModalProps {
  request: ServiceRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignmentComplete?: () => void;
}

export const RequestAssignmentModal: React.FC<RequestAssignmentModalProps> = ({
  request,
  isOpen,
  onClose,
  onAssignmentComplete,
}) => {
  // ── ALL HOOKS MUST COME BEFORE ANY EARLY RETURNS ──
  const [selectedGuardIds, setSelectedGuardIds] = useState<string[]>([]);
  const [guardFilter, setGuardFilter] = useState<'available' | 'unavailable' | 'all'>('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [allEmployees, setAllEmployees] = useState(() => getEmployees());

  // Refresh employee list and reset selections when modal opens for a request
  useEffect(() => {
    if (isOpen && request) {
      setAllEmployees(getEmployees());
      setSelectedGuardIds(Array.isArray(request.assignedGuardIds) ? request.assignedGuardIds : []);
      setGuardFilter('available');
      setSearchTerm('');
    }
  }, [isOpen, request?.id]);

  // Block body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Computed values — must also come before early return to keep hook order stable
  const requiredCount = request?.requiredGuards || 1;
  const currentAssignedCount = selectedGuardIds.length;
  const isRequirementMet = currentAssignedCount >= requiredCount;

  const categorizedGuards = useMemo(() => {
    return allEmployees.map((emp) => {
      const isCurrentlySelected = selectedGuardIds.includes(emp.id);
      const calcAvailable =
        isCurrentlySelected ||
        (emp.isAvailable !== false && emp.employmentStatus === 'active');
      return { ...emp, calculatedAvailable: calcAvailable };
    });
  }, [allEmployees, selectedGuardIds]);

  const availableGuards = useMemo(
    () => categorizedGuards.filter((g) => g.calculatedAvailable),
    [categorizedGuards]
  );
  const unavailableGuards = useMemo(
    () => categorizedGuards.filter((g) => !g.calculatedAvailable),
    [categorizedGuards]
  );

  const displayedGuards = useMemo(() => {
    let list =
      guardFilter === 'available'
        ? availableGuards
        : guardFilter === 'unavailable'
        ? unavailableGuards
        : categorizedGuards;

    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (g) =>
        (g.name || g.fullName || '').toLowerCase().includes(term) ||
        (g.badgeNumber || g.employeeNumber || '').toLowerCase().includes(term) ||
        (g.rank || '').toLowerCase().includes(term)
    );
  }, [categorizedGuards, availableGuards, unavailableGuards, guardFilter, searchTerm]);

  // ── EARLY RETURN AFTER ALL HOOKS ──
  if (!isOpen || !request) return null;

  const firstNote =
    Array.isArray(request.internalNotes) && request.internalNotes.length > 0
      ? request.internalNotes[0]?.content
      : null;

  const handleAddGuard = (guardId: string) => {
    if (!selectedGuardIds.includes(guardId)) {
      setSelectedGuardIds((prev) => [...prev, guardId]);
    }
  };

  const handleRemoveGuard = (guardId: string) => {
    setSelectedGuardIds((prev) => prev.filter((id) => id !== guardId));
  };

  const handleSaveAssignment = async () => {
    setIsSaving(true);
    try {
      const result = assignGuardsToRequest(request.id, selectedGuardIds);
      if (result.success) {
        showToast({
          type: 'success',
          title: 'Contract Activated & Deployed',
          message: `${selectedGuardIds.length} guard(s) deployed. ${request.referenceNumber} has been moved to Active Contracts.`,
        });
        if (onAssignmentComplete) onAssignmentComplete();
        onClose();
      } else {
        showToast({
          type: 'danger',
          title: 'Assignment Failed',
          message: result.error || 'Failed to assign guards.',
        });
      }
    } catch {
      showToast({ type: 'danger', title: 'Error', message: 'Could not complete assignment.' });
    } finally {
      setIsSaving(false);
    }
  };

  const modal = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', backgroundColor: 'rgba(0,0,0,0.85)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          position: 'relative', width: '100%', maxWidth: '900px',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          backgroundColor: '#111317', border: '1px solid #30343B',
          borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div style={{
          padding: '16px 24px', backgroundColor: '#15171B',
          borderBottom: '1px solid #30343B', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: 'rgba(32,201,151,0.15)',
              border: '1px solid rgba(32,201,151,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldCheck size={20} color="#20C997" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#fff', fontSize: 15 }}>
                  {request.referenceNumber}
                </span>
                <span style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 10,
                  fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase',
                  backgroundColor: 'rgba(57,139,255,0.2)', color: '#398BFF',
                  border: '1px solid rgba(57,139,255,0.4)',
                }}>
                  {(request.serviceType || '').replace(/_/g, ' ')}
                </span>
                <span style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 10,
                  fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase',
                  backgroundColor: 'rgba(255,138,53,0.2)', color: '#FF8A35',
                  border: '1px solid rgba(255,138,53,0.4)',
                }}>
                  {(request.status || '').replace(/_/g, ' ')}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#A5A9B0', marginTop: 2 }}>
                Assign security officers to this deployment request
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#A5A9B0', padding: 8, borderRadius: 8,
          }}>
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── REQUEST DETAILS CARD ── */}
          <div style={{
            padding: 16, backgroundColor: '#15171B',
            border: '1px solid #30343B', borderRadius: 12,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: 10, marginBottom: 12,
              borderBottom: '1px solid rgba(48,52,59,0.6)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', color: '#A5A9B0', letterSpacing: 1 }}>
                <Briefcase size={13} color="#C9A04A" /> Client &amp; Deployment Details
              </span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#20C997' }}>
                {request.urgency || 'Standard Priority'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: '#A5A9B0', marginBottom: 4 }}>Client Organization</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{request.clientName}</div>
                {request.contactPhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#A5A9B0' }}>
                    <Phone size={11} color="#398BFF" /> {request.contactPhone}
                  </div>
                )}
                {request.contactEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#A5A9B0', overflow: 'hidden' }}>
                    <Mail size={11} color="#398BFF" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{request.contactEmail}</span>
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#A5A9B0', marginBottom: 4 }}>Deployment Location</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                  <MapPin size={13} color="#F04444" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{request.siteAddress}</div>
                    <div style={{ fontSize: 11, color: '#A5A9B0' }}>{request.city}</div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#A5A9B0', marginBottom: 4 }}>Service Period</div>
                {request.startDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#fff', marginBottom: 4 }}>
                    <Calendar size={12} color="#20C997" /> Starts: {request.startDate}
                  </div>
                )}
                {request.quotationAmountKES ? (
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#C9A04A' }}>
                    KES {request.quotationAmountKES.toLocaleString()}
                  </div>
                ) : null}
              </div>
            </div>

            {firstNote && (
              <div style={{
                marginTop: 12, padding: '10px 12px',
                backgroundColor: '#0D0F12', borderRadius: 8,
                borderTop: '1px solid rgba(48,52,59,0.5)', fontSize: 11, color: '#A5A9B0',
              }}>
                <span style={{ display: 'block', fontWeight: 700, color: '#F5F5F5', marginBottom: 3, fontSize: 11 }}>Briefing Note:</span>
                <span style={{ fontStyle: 'italic' }}>{firstNote}</span>
              </div>
            )}
          </div>

          {/* ── GUARD ALLOCATION SLOTS ── */}
          <div style={{
            padding: 16, backgroundColor: '#15171B',
            border: '1px solid #30343B', borderRadius: 12,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 8, paddingBottom: 10, marginBottom: 12,
              borderBottom: '1px solid rgba(48,52,59,0.6)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} color="#20C997" />
                <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>
                  Guard Allocation ({currentAssignedCount}/{requiredCount})
                </span>
              </div>
              {isRequirementMet ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 10px', borderRadius: 999, fontSize: 11,
                  fontFamily: 'monospace', fontWeight: 700,
                  backgroundColor: 'rgba(32,201,151,0.2)', color: '#20C997',
                  border: '1px solid rgba(32,201,151,0.4)',
                }}>
                  <CheckCircle2 size={12} /> Requirement Met
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 10px', borderRadius: 999, fontSize: 11,
                  fontFamily: 'monospace', fontWeight: 700,
                  backgroundColor: 'rgba(255,138,53,0.2)', color: '#FF8A35',
                  border: '1px solid rgba(255,138,53,0.4)',
                }}>
                  <AlertCircle size={12} /> {requiredCount - currentAssignedCount} Still Needed
                </span>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 10,
            }}>
              {Array.from({ length: Math.max(requiredCount, selectedGuardIds.length) }).map((_, idx) => {
                const gId = selectedGuardIds[idx];
                const guard = gId ? allEmployees.find((e) => e.id === gId) : null;
                if (guard) {
                  return (
                    <div key={gId} style={{
                      padding: '10px 12px', borderRadius: 10,
                      backgroundColor: '#1C1F24',
                      border: '1px solid rgba(32,201,151,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          backgroundColor: 'rgba(32,201,151,0.2)',
                          border: '1px solid rgba(32,201,151,0.5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 11, color: '#20C997', flexShrink: 0,
                        }}>{idx + 1}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {guard.name || guard.fullName}
                          </div>
                          <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#20C997' }}>
                            {guard.badgeNumber || guard.employeeNumber}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveGuard(guard.id)}
                        style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: 11,
                          fontFamily: 'monospace', cursor: 'pointer',
                          backgroundColor: 'rgba(127,29,29,0.6)',
                          color: '#fca5a5', border: '1px solid rgba(185,28,28,0.5)',
                          flexShrink: 0,
                        }}
                      >Remove</button>
                    </div>
                  );
                }
                return (
                  <div key={`slot-${idx}`} style={{
                    padding: '10px 12px', borderRadius: 10,
                    backgroundColor: 'rgba(17,19,23,0.5)',
                    border: '1px dashed #30343B',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      backgroundColor: '#1C1F24', border: '1px solid #30343B',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 11, color: '#A5A9B0', flexShrink: 0,
                    }}>{idx + 1}</div>
                    <div style={{ fontSize: 11 }}>
                      <div style={{ color: '#F5F5F5', fontWeight: 500 }}>Vacant Slot</div>
                      <div style={{ color: '#A5A9B0', fontSize: 10 }}>Select a guard below</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── GUARDS ROSTER ── */}
          <div style={{
            padding: 16, backgroundColor: '#15171B',
            border: '1px solid #30343B', borderRadius: 12,
          }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 10, paddingBottom: 12, marginBottom: 12,
              borderBottom: '1px solid rgba(48,52,59,0.6)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>
                  <Shield size={14} color="#398BFF" />
                  Guards Roster ({categorizedGuards.length} Officers)
                </div>
                <div style={{ fontSize: 11, color: '#A5A9B0', marginTop: 3 }}>
                  Click "Assign" to add a guard to this request
                </div>
              </div>

              {/* Filter tabs */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 2, padding: 4,
                backgroundColor: '#1C1F24', border: '1px solid #30343B', borderRadius: 8,
                fontSize: 11, fontFamily: 'monospace',
              }}>
                {(['available', 'unavailable', 'all'] as const).map((f) => {
                  const active = guardFilter === f;
                  const count = f === 'available' ? availableGuards.length : f === 'unavailable' ? unavailableGuards.length : categorizedGuards.length;
                  const label = f === 'available' ? `Available (${count})` : f === 'unavailable' ? `Unavailable (${count})` : `All (${count})`;
                  const dot = f === 'available' ? '#20C997' : f === 'unavailable' ? '#f87171' : undefined;
                  return (
                    <button
                      key={f}
                      onClick={() => setGuardFilter(f)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 6,
                        cursor: 'pointer', fontFamily: 'monospace', fontSize: 11,
                        fontWeight: active ? 700 : 400,
                        backgroundColor: active ? (f === 'available' ? 'rgba(32,201,151,0.2)' : f === 'unavailable' ? 'rgba(239,68,68,0.2)' : '#30343B') : 'transparent',
                        color: active ? (f === 'available' ? '#20C997' : f === 'unavailable' ? '#f87171' : '#fff') : '#A5A9B0',
                        border: active ? `1px solid ${f === 'available' ? 'rgba(32,201,151,0.4)' : f === 'unavailable' ? 'rgba(239,68,68,0.4)' : '#30343B'}` : '1px solid transparent',
                      }}
                    >
                      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: dot, display: 'inline-block' }} />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={14} color="#A5A9B0" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by name, badge number, or rank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 32px',
                  backgroundColor: '#1C1F24', border: '1px solid #30343B',
                  borderRadius: 8, color: '#fff', fontSize: 12, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Guards list */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 8, maxHeight: 280, overflowY: 'auto', paddingRight: 2,
            }}>
              {displayedGuards.length === 0 ? (
                <div style={{ gridColumn: '1/-1', padding: '32px 0', textAlign: 'center', fontSize: 12, color: '#A5A9B0', fontFamily: 'monospace' }}>
                  No guards found.
                </div>
              ) : displayedGuards.map((guard) => {
                const isAssigned = selectedGuardIds.includes(guard.id);
                const avail = guard.calculatedAvailable;
                return (
                  <div key={guard.id} style={{
                    padding: '10px 12px', borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                    backgroundColor: isAssigned ? '#1C2C26' : avail ? '#1C1F24' : '#14161A',
                    border: `1px solid ${isAssigned ? 'rgba(32,201,151,0.5)' : avail ? '#30343B' : '#25282D'}`,
                    opacity: avail ? 1 : 0.7,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 13, fontFamily: 'monospace',
                        backgroundColor: isAssigned ? '#20C997' : avail ? 'rgba(32,201,151,0.15)' : '#1C1F24',
                        color: isAssigned ? '#090A0D' : avail ? '#20C997' : '#A5A9B0',
                        border: isAssigned ? 'none' : `1px solid ${avail ? 'rgba(32,201,151,0.3)' : '#30343B'}`,
                      }}>
                        {(guard.name || guard.fullName || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {guard.name || guard.fullName}
                        </div>
                        <div style={{ fontSize: 10, color: '#A5A9B0', fontFamily: 'monospace' }}>
                          {guard.badgeNumber || guard.employeeNumber} · {guard.rank || 'Guard'}
                        </div>
                        <div style={{ fontSize: 10, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', color: avail ? '#20C997' : '#f87171' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: avail ? '#20C997' : '#f87171', display: 'inline-block' }} />
                          {avail ? 'Available' : (guard.currentAssignment || 'Unavailable')}
                        </div>
                      </div>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      {isAssigned ? (
                        <button
                          onClick={() => handleRemoveGuard(guard.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', borderRadius: 7, fontSize: 11,
                            fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer',
                            backgroundColor: '#20C997', color: '#090A0D', border: 'none',
                          }}
                        >
                          <Check size={13} /> Assigned
                        </button>
                      ) : avail ? (
                        <button
                          onClick={() => handleAddGuard(guard.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', borderRadius: 7, fontSize: 11,
                            fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer',
                            backgroundColor: '#1C1F24', color: '#fff',
                            border: '1px solid #30343B',
                          }}
                        >
                          <UserPlus size={13} /> Assign
                        </button>
                      ) : (
                        <span style={{
                          padding: '4px 8px', borderRadius: 6, fontSize: 10,
                          fontFamily: 'monospace', textTransform: 'uppercase',
                          backgroundColor: 'rgba(127,29,29,0.4)', color: '#f87171',
                          border: '1px solid rgba(185,28,28,0.4)',
                        }}>
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          padding: '14px 24px', backgroundColor: '#15171B',
          borderTop: '1px solid #30343B', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#A5A9B0' }}>
            Selected: <strong style={{ color: '#fff' }}>{currentAssignedCount}</strong> of{' '}
            <strong style={{ color: '#fff' }}>{requiredCount}</strong> required
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 12,
                fontFamily: 'monospace', cursor: 'pointer',
                backgroundColor: '#1C1F24', color: '#fff',
                border: '1px solid #30343B',
              }}
            >Cancel</button>
            <button
              disabled={isSaving || currentAssignedCount === 0}
              onClick={handleSaveAssignment}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 20px', borderRadius: 10, fontSize: 12,
                fontFamily: 'monospace', fontWeight: 700,
                cursor: isSaving || currentAssignedCount === 0 ? 'not-allowed' : 'pointer',
                backgroundColor: isSaving || currentAssignedCount === 0 ? '#1C1F24' : '#20C997',
                color: isSaving || currentAssignedCount === 0 ? '#555' : '#090A0D',
                border: 'none',
              }}
            >
              {isSaving ? 'Deploying...' : 'Deploy Guards & Activate Contract'}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
};
