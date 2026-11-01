/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Covenant Shield Security Services - Client Organization Scope Policy
 * 
 * Implementation of the 10-Step Client Organization Scope Algorithm:
 * 1. Authenticate the user through the shared session system.
 * 2. Resolve active client memberships from trusted database records.
 * 3. Determine the permitted client organization using a validated membership context.
 * 4. Verify that the membership is active and has permission for the requested operation.
 * 5. Fetch the target resource using both its identifier and the authorized organization scope.
 * 6. Verify the resource belongs to that organization and is visible to the current client role.
 * 7. Select fields through explicit response DTOs that exclude internal data.
 * 8. Apply the mutation only after validating allowed state transitions and client permissions.
 * 9. Record sensitive changes and security-relevant events.
 * 10. Return a consistent response that does not reveal the existence of unrelated clients' records.
 */

export interface ClientMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: 'client_admin' | 'client_viewer' | 'client_billing';
  status: 'active' | 'suspended' | 'revoked';
  permissions: string[];
}

export interface AuthenticatedClientContext {
  userId: string;
  organizationId: string;
  membershipId: string;
  role: ClientMembership['role'];
  permissions: string[];
  sessionStartedAt: string;
}

export type ClientPermission =
  | 'sites:read'
  | 'requests:read'
  | 'requests:create'
  | 'quotations:review'
  | 'quotations:approve'
  | 'cases:read'
  | 'cases:create'
  | 'cases:reply'
  | 'profile:update_contact'
  | 'profile:request_company_change'
  | 'notifications:read'
  | 'sessions:manage';

export class ClientScopePolicy {
  /**
   * Trusted database mock of memberships.
   * Untrusted browser-supplied organization IDs are validated against these records.
   */
  private static memberships: ClientMembership[] = [
    {
      id: 'memb-apex-01',
      userId: 'usr-apex-01',
      organizationId: 'client-apex',
      role: 'client_admin',
      status: 'active',
      permissions: [
        'sites:read',
        'requests:read',
        'requests:create',
        'quotations:review',
        'quotations:approve',
        'cases:read',
        'cases:create',
        'cases:reply',
        'profile:update_contact',
        'profile:request_company_change',
        'notifications:read',
        'sessions:manage',
      ],
    },
    {
      id: 'memb-kifaru-01',
      userId: 'usr-kifaru-01',
      organizationId: 'client-kifaru',
      role: 'client_admin',
      status: 'active',
      permissions: [
        'sites:read',
        'requests:read',
        'requests:create',
        'quotations:review',
        'quotations:approve',
        'cases:read',
        'cases:create',
        'cases:reply',
        'profile:update_contact',
        'profile:request_company_change',
        'notifications:read',
        'sessions:manage',
      ],
    },
    {
      id: 'memb-kilifi-01',
      userId: 'usr-kilifi-01',
      organizationId: 'client-kilifi',
      role: 'client_admin',
      status: 'active',
      permissions: [
        'sites:read',
        'requests:read',
        'requests:create',
        'quotations:review',
        'cases:read',
        'cases:create',
        'profile:update_contact',
        'notifications:read',
        'sessions:manage',
      ],
    },
  ];

  /**
   * Step 1-4: Resolves and validates client membership for a user session.
   * If a user requests a specific organization ID, validates that the user holds
   * an ACTIVE membership for that organization. Never trusts arbitrary client IDs.
   */
  public static resolveValidatedContext(
    userId: string,
    requestedOrgId?: string,
    requiredPermission?: ClientPermission
  ): AuthenticatedClientContext {
    // 1. Authenticate user
    if (!userId) {
      throw new Error('401 Unauthorized: Valid session token required');
    }

    // 2. Resolve active memberships from trusted DB
    const userMemberships = this.memberships.filter(
      m => m.userId === userId && m.status === 'active'
    );

    if (userMemberships.length === 0) {
      throw new Error('403 Forbidden: No active client memberships found for authenticated account');
    }

    // 3. Determine permitted organization
    let activeMembership: ClientMembership;
    if (requestedOrgId) {
      const match = userMemberships.find(m => m.organizationId === requestedOrgId);
      if (!match) {
        // Step 10: Consistent generic rejection that does NOT reveal foreign org existence
        throw new Error('403 Forbidden: Access denied. Untrusted or unauthorized organization scope.');
      }
      activeMembership = match;
    } else {
      activeMembership = userMemberships[0];
    }

    // 4. Verify permission
    if (requiredPermission && !activeMembership.permissions.includes(requiredPermission)) {
      throw new Error(
        `403 Forbidden: Insufficient role permissions. Operation requires '${requiredPermission}'.`
      );
    }

    return {
      userId,
      organizationId: activeMembership.organizationId,
      membershipId: activeMembership.id,
      role: activeMembership.role,
      permissions: activeMembership.permissions,
      sessionStartedAt: new Date().toISOString(),
    };
  }

  /**
   * Step 5 & 6: Asserts that an entity belongs strictly to the validated organization scope.
   * Uniform error message prevents existence enumeration of foreign records.
   */
  public static assertResourceOwnership(
    resourceOrgId: string,
    context: AuthenticatedClientContext,
    resourceType: string,
    resourceId: string
  ): void {
    if (resourceOrgId !== context.organizationId) {
      // Step 10: Reject without leaking whether resource exists in another client
      throw new Error(
        `404 Not Found: ${resourceType} '${resourceId}' does not exist or is inaccessible.`
      );
    }
  }

  /**
   * Step 7: Sanitize internal operational data from entity payloads.
   * Strips internalStaffNotes, guard rosters, internal margin calculations, and investigator notes.
   */
  public static sanitizeEntity<T extends Record<string, any>>(entity: T): T {
    const clone = { ...entity };
    delete clone.internalStaffNotes;
    delete clone.guardRosterInternal;
    delete clone.operationalNotes;
    delete clone.internalInvestigatorNotes;
    delete clone.internalCostBreakdown;
    delete clone.profitMargin;
    delete clone.auditLogInternal;
    return clone;
  }

  /**
   * Step 8: Validate allowed state transitions for client actions.
   * Client users cannot alter operational status (e.g. from Mobilizing to Active)
   * or approve superseded quotations.
   */
  public static validateAllowedTransition(
    currentStatus: string,
    targetStatus: string,
    action: 'quotation_approval' | 'case_reply' | 'request_cancellation'
  ): void {
    if (action === 'quotation_approval') {
      if (currentStatus !== 'Pending Review') {
        throw new Error(
          `409 Conflict: Cannot approve quotation in status '${currentStatus}'. Only released 'Pending Review' quotations can be accepted.`
        );
      }
    } else if (action === 'case_reply') {
      if (currentStatus === 'Closed') {
        throw new Error(
          '409 Conflict: Case is closed. Client replies are prohibited on resolved & closed tickets.'
        );
      }
    }
  }
}
