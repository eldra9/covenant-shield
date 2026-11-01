/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Mock Secure Database with strict resource-scoped authorization checks
 * representing Covenant Shield Security Services database & access policies.
 */

import {
  ClientOrganization,
  ClientUser,
  Site,
  ServiceRequest,
  ClientCase,
  PortalNotification,
  SecuritySession,
  SecurityAuditLog,
} from '../types/clientPortal';

export interface InternalStore {
  organizations: ClientOrganization[];
  users: ClientUser[];
  sites: (Site & { internalStaffNotes?: string; guardRosterInternal?: any[] })[];
  requests: (ServiceRequest & { internalCostBreakdown?: any; operationalNotes?: string })[];
  cases: (ClientCase & { internalInvestigatorNotes?: string })[];
  notifications: PortalNotification[];
  sessions: Record<string, SecuritySession[]>;
  auditLogs: Record<string, SecurityAuditLog[]>;
}

export const INITIAL_DATABASE: InternalStore = {
  organizations: [],
  users: [],
  sites: [],
  requests: [],
  cases: [],
  notifications: [],
  sessions: {},
  auditLogs: {},
};
