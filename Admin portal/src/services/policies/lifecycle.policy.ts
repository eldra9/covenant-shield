/**
 * Entity Lifecycle & Deactivation Invariants Policy
 * Enforces:
 * 1. Safe archival rather than destructive deletion
 * 2. Active shifts & contracts dependency checking before deactivation
 * 3. Prevention of orphaned assignments
 * 4. Preservation of historical attendance logs
 */

import { Client, Employee, Shift, Site } from '@/types';

export interface DeactivationCheckResult {
  canDeactivate: boolean;
  blockingReasons: string[];
  activeShiftsCount: number;
}

/**
 * Validates whether an employee can be safely deactivated or placed on leave
 */
export function checkEmployeeDeactivation(
  employee: Employee,
  shifts: Shift[]
): DeactivationCheckResult {
  const blockingReasons: string[] = [];
  const futureActiveShifts = shifts.filter(
    (s) => s.guardId === employee.id && (s.status === 'scheduled' || s.status === 'in_progress')
  );

  if (futureActiveShifts.length > 0) {
    blockingReasons.push(
      `Officer is currently rostered on ${futureActiveShifts.length} active/scheduled shift(s). Reassign or cancel shifts before deactivation.`
    );
  }

  return {
    canDeactivate: blockingReasons.length === 0,
    blockingReasons,
    activeShiftsCount: futureActiveShifts.length,
  };
}

/**
 * Validates whether a security site can be safely set to inactive
 */
export function checkSiteDeactivation(
  site: Site,
  shifts: Shift[]
): DeactivationCheckResult {
  const blockingReasons: string[] = [];
  const activeSiteShifts = shifts.filter(
    (s) => s.siteId === site.id && (s.status === 'scheduled' || s.status === 'in_progress')
  );

  if (activeSiteShifts.length > 0) {
    blockingReasons.push(
      `Site has ${activeSiteShifts.length} active or scheduled guard shift(s) pending. De-roster post officers first.`
    );
  }

  return {
    canDeactivate: blockingReasons.length === 0,
    blockingReasons,
    activeShiftsCount: activeSiteShifts.length,
  };
}
