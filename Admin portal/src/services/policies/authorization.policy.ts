/**
 * Centralized Authorization Policy System
 * Enforces:
 * 1. Active session verification
 * 2. Role-to-permission mapping with Deny-by-Default
 * 3. Resource-level scoping (Client Org, Assigned Sites, Operational Boundaries)
 * 4. Approval restrictions and lifecycle prerequisites
 * 5. Field projection (scrubbing classified internal notes / unmasked PII)
 * 6. Last Active Super Administrator safeguard
 */

import { Permission, Role, ROLE_PERMISSIONS, User } from '@/types';

export interface AuthorizationContext {
  user: User;
  permission: Permission;
  resourceType?: 'Site' | 'Client' | 'Employee' | 'Shift' | 'Attendance' | 'Case' | 'ServiceRequest' | 'User';
  resourceId?: string;
  targetRecord?: any;
}

export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
  sanitizedFields?: string[];
}

/**
 * Validates whether an action is authorized under current server-owned identity
 */
export function evaluateAuthorization(ctx: AuthorizationContext): AuthorizationResult {
  const { user, permission, resourceType, targetRecord } = ctx;

  // 1. Session & account active check
  if (!user || !user.isActive) {
    return { authorized: false, reason: 'Authentication denied: user account is deactivated or session is invalid.' };
  }

  // 2. Resolve server-side role permissions (Deny by default)
  const allowedPermissions = ROLE_PERMISSIONS[user.role];
  if (!allowedPermissions || !allowedPermissions.includes(permission)) {
    return {
      authorized: false,
      reason: `Permission denied: role "${user.role}" lacks mandatory permission "${permission}".`,
    };
  }

  // 3. Resource Scope Check
  if (targetRecord) {
    // Client scope check
    if (user.role === 'client') {
      if (targetRecord.clientId && targetRecord.clientId !== user.clientId) {
        return { authorized: false, reason: 'Resource scope violation: client user cannot access foreign organization data.' };
      }
      if (resourceType === 'Site' && targetRecord.clientId !== user.clientId) {
        return { authorized: false, reason: 'Resource scope violation: client cannot inspect unassociated site.' };
      }
    }

    // Supervisor scope check
    if (user.role === 'supervisor' || user.role === 'field_supervisor') {
      const assignedSites = user.assignedSiteIds || [];
      if (resourceType === 'Site' && !assignedSites.includes(targetRecord.id)) {
        return { authorized: false, reason: 'Resource scope violation: site outside supervisor assigned operational jurisdiction.' };
      }
      if (targetRecord.siteId && !assignedSites.includes(targetRecord.siteId)) {
        return { authorized: false, reason: 'Resource scope violation: record belongs to a facility outside supervisory command.' };
      }
    }

    // Guard scope check
    if (user.role === 'guard') {
      const assignedSites = user.assignedSiteIds || [];
      if (targetRecord.siteId && !assignedSites.includes(targetRecord.siteId)) {
        return { authorized: false, reason: 'Resource scope violation: guard cannot inspect unassigned installation records.' };
      }
      if (targetRecord.guardId && targetRecord.guardId !== user.id) {
        return { authorized: false, reason: 'Resource scope violation: guard cannot view peer personal scheduling records.' };
      }
    }
  }

  return { authorized: true };
}

/**
 * Field Projection: Scrubs private internal data based on role
 */
export function projectEntityFields<T extends Record<string, any>>(entity: T, user: User): Partial<T> {
  const clone = { ...entity };

  // Clients must NEVER receive internal notes or sensitive personnel info
  if (user.role === 'client') {
    delete clone.internalNotes;
    delete clone.nationalIdMasked;
    delete clone.emergencyContact;
  }

  // Guards cannot inspect commercial quotation sums or customer billing info
  if (user.role === 'guard') {
    delete clone.quotationAmountKES;
    delete clone.quotationDetails;
    delete clone.internalNotes;
  }

  return clone;
}

/**
 * Safeguard: Protects against disabling or demoting the last active Super Administrator
 */
export function canModifySuperAdmin(
  targetUserId: string,
  proposedRole: Role,
  proposedActiveState: boolean,
  allUsers: User[]
): { allowed: boolean; reason?: string } {
  const targetUser = allUsers.find((u) => u.id === targetUserId);
  if (!targetUser) return { allowed: false, reason: 'Target user does not exist.' };

  if (targetUser.role === 'super_admin') {
    const activeSuperAdmins = allUsers.filter(
      (u) => u.role === 'super_admin' && u.isActive && u.id !== targetUserId
    );

    const isDemotion = proposedRole !== 'super_admin';
    const isDeactivation = proposedActiveState === false;

    if ((isDemotion || isDeactivation) && activeSuperAdmins.length === 0) {
      return {
        allowed: false,
        reason: 'Security safeguard violation: Cannot demote or deactivate the last active Super Administrator.',
      };
    }
  }

  return { allowed: true };
}
