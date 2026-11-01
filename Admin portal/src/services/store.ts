import {
  AuditLog,
  Case,
  CaseStatus,
  Client,
  Employee,
  AttendanceRecord,
  AttendanceStatus,
  Permission,
  ROLE_PERMISSIONS,
  Role,
  ServiceRequest,
  StatusTransitionHistory,
  RequestStatus,
  Shift,
  Site,
  User,
} from '../types';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CASES,
  INITIAL_CLIENTS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_SERVICE_REQUESTS,
  INITIAL_SHIFTS,
  INITIAL_SITES,
  INITIAL_USERS,
} from './mockData';
import { doShiftsOverlap, getRestPeriodHours, nowUTC } from '../utils/date';

const STORAGE_KEYS = {
  USERS: 'covenant_shield_users_v3',
  CLIENTS: 'covenant_shield_clients_v3',
  SITES: 'covenant_shield_sites_v3',
  EMPLOYEES: 'covenant_shield_employees_v3',
  SHIFTS: 'covenant_shield_shifts_v3',
  ATTENDANCE: 'covenant_shield_attendance_v3',
  REQUESTS: 'covenant_shield_requests_v3',
  CASES: 'covenant_shield_cases_v3',
  AUDIT: 'covenant_shield_audit_v3',
  CURRENT_USER_ID: 'covenant_shield_current_user_id_v3',
};

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Listeners for reactive updates
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

// In-memory cache synced with localStorage and backend
let users: User[] = loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);

// Ensure default administrative accounts (super admin, operations, supervisor) are always available
INITIAL_USERS.forEach((initUser) => {
  if (!users.some((u) => u.username?.toLowerCase() === initUser.username?.toLowerCase() || u.email.toLowerCase() === initUser.email.toLowerCase())) {
    users.push(initUser);
  }
});
saveToStorage(STORAGE_KEYS.USERS, users);
let clients: Client[] = loadFromStorage(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
if (!clients || clients.length === 0) {
  clients = [...INITIAL_CLIENTS];
  saveToStorage(STORAGE_KEYS.CLIENTS, clients);
}
let sites: Site[] = loadFromStorage(STORAGE_KEYS.SITES, INITIAL_SITES);
if (!sites || sites.length === 0) {
  sites = [...INITIAL_SITES];
  saveToStorage(STORAGE_KEYS.SITES, sites);
}
let employees: Employee[] = loadFromStorage(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
if (!employees || employees.length === 0 || employees.length < INITIAL_EMPLOYEES.length) {
  employees = [...INITIAL_EMPLOYEES];
  saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
}
let shifts: Shift[] = loadFromStorage(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS);
let attendance: AttendanceRecord[] = loadFromStorage(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
let requests: ServiceRequest[] = loadFromStorage(STORAGE_KEYS.REQUESTS, INITIAL_SERVICE_REQUESTS);
if (!requests || requests.length === 0) {
  requests = [...INITIAL_SERVICE_REQUESTS];
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);
}
let cases: Case[] = loadFromStorage(STORAGE_KEYS.CASES, INITIAL_CASES);
let auditLogs: AuditLog[] = loadFromStorage(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);

let currentUserId: string = loadFromStorage(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0]?.id || 'usr-admin-1');

/**
 * Sync live backend database state into admin store.
 */
export async function syncWithBackend(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin-portal/sync/`);
    if (!res.ok) return;
    const data = await res.json();

    if (Array.isArray(data.users) && data.users.length > 0) {
      users = data.users;
      saveToStorage(STORAGE_KEYS.USERS, users);
      if (!users.some((u) => u.id === currentUserId)) {
        currentUserId = users[0].id;
        saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      }
    }

    if (Array.isArray(data.clients)) {
      clients = data.clients;
      saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    }

    if (Array.isArray(data.sites)) {
      sites = data.sites;
      saveToStorage(STORAGE_KEYS.SITES, sites);
    }

    if (Array.isArray(data.requests)) {
      requests = data.requests;
      saveToStorage(STORAGE_KEYS.REQUESTS, requests);
    }

    if (Array.isArray(data.cases)) {
      cases = data.cases;
      saveToStorage(STORAGE_KEYS.CASES, cases);
    }

    if (Array.isArray(data.employees)) {
      employees = data.employees;
      saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
    }

    notify();
  } catch (err) {
    console.error('Failed to sync admin store with backend:', err);
  }
}

// Initial sync on boot
if (typeof window !== 'undefined') {
  syncWithBackend();
}

export function resetToSeedData() {
  users = [...INITIAL_USERS];
  clients = [...INITIAL_CLIENTS];
  sites = [...INITIAL_SITES];
  employees = [...INITIAL_EMPLOYEES];
  shifts = [...INITIAL_SHIFTS];
  attendance = [...INITIAL_ATTENDANCE];
  requests = [...INITIAL_SERVICE_REQUESTS];
  cases = [...INITIAL_CASES];
  auditLogs = [...INITIAL_AUDIT_LOGS];
  currentUserId = INITIAL_USERS[0].id;

  saveToStorage(STORAGE_KEYS.USERS, users);
  saveToStorage(STORAGE_KEYS.CLIENTS, clients);
  saveToStorage(STORAGE_KEYS.SITES, sites);
  saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
  saveToStorage(STORAGE_KEYS.SHIFTS, shifts);
  saveToStorage(STORAGE_KEYS.ATTENDANCE, attendance);
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);
  saveToStorage(STORAGE_KEYS.CASES, cases);
  saveToStorage(STORAGE_KEYS.AUDIT, auditLogs);
  saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  notify();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// --- CURRENT USER & AUTH ---

export function getCurrentUser(): User {
  const found = users.find((u) => u.id === currentUserId && u.isActive);
  return found || users[0];
}

export function switchCurrentUser(userId: string): void {
  const user = users.find((u) => u.id === userId);
  if (user) {
    currentUserId = user.id;
    saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    notify();
  }
}

export function getAllUsers(): User[] {
  return [...users];
}

export function hasPermission(perm: Permission, user: User = getCurrentUser()): boolean {
  const rolePerms = ROLE_PERMISSIONS[user.role] || [];
  return rolePerms.includes(perm);
}

// Resource scope check: is user authorized for this site?
export function isSiteInScope(siteId: string, user: User = getCurrentUser()): boolean {
  if (user.role === 'super_admin' || user.role === 'operations_staff') return true;
  if (user.role === 'supervisor') {
    return (user.assignedSiteIds || []).includes(siteId);
  }
  if (user.role === 'guard') {
    return (user.assignedSiteIds || []).includes(siteId);
  }
  if (user.role === 'client') {
    const site = sites.find((s) => s.id === siteId);
    return site ? site.clientId === user.clientId : false;
  }
  return false;
}

// Resource scope check: is user authorized for this client?
export function isClientInScope(clientId: string, user: User = getCurrentUser()): boolean {
  if (user.role === 'super_admin' || user.role === 'operations_staff') return true;
  if (user.role === 'client') return user.clientId === clientId;
  return false; // Supervisors and guards do not have client account level access
}

// --- AUDIT LOGGER ---

export function recordAudit(
  action: AuditLog['action'],
  entityType: string,
  entityId: string,
  summary: string,
  metadata?: Record<string, any>
): void {
  const actor = getCurrentUser();
  const newLog: AuditLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: nowUTC(),
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    entityType,
    entityId,
    summary,
    metadata,
  };
  auditLogs = [newLog, ...auditLogs];
  saveToStorage(STORAGE_KEYS.AUDIT, auditLogs);
  notify();
}

export function getAuditLogs(): AuditLog[] {
  return [...auditLogs];
}

// --- SERVICE REQUESTS ---

export function getServiceRequests(): ServiceRequest[] {
  const user = getCurrentUser();
  if (user.role === 'client') {
    return requests.filter((r) => r.clientId === user.clientId);
  }
  return [...requests];
}

export function getServiceRequestById(id: string): ServiceRequest | undefined {
  const r = requests.find((req) => req.id === id || req.referenceNumber === id);
  if (!r) return undefined;
  const user = getCurrentUser();
  if (user.role === 'client' && r.clientId !== user.clientId) {
    return undefined; // Scoped denial
  }
  return r;
}

export const VALID_REQUEST_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  new: ['under_review', 'rejected', 'cancelled'],
  under_review: ['site_assessment_scheduled', 'rejected', 'cancelled'],
  site_assessment_scheduled: ['quotation_sent', 'under_review', 'cancelled'],
  quotation_sent: ['accepted', 'rejected', 'under_review', 'cancelled'],
  accepted: ['contract_active', 'cancelled'],
  contract_active: ['cancelled'],
  rejected: ['under_review'],
  cancelled: [],
};

export function updateServiceRequestStatus(
  requestId: string,
  newStatus: RequestStatus,
  reason: string
): { success: boolean; error?: string } {
  const user = getCurrentUser();
  if (!hasPermission('requests.update', user)) {
    return { success: false, error: 'Permission denied: requests.update required' };
  }

  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) return { success: false, error: 'Request not found' };

  const currentReq = requests[reqIndex];
  const allowed = VALID_REQUEST_TRANSITIONS[currentReq.status] || [];
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Invalid status transition from ${currentReq.status} to ${newStatus}`,
    };
  }

  const transition = {
    id: `hist-${Date.now()}`,
    fromStatus: currentReq.status,
    toStatus: newStatus,
    reason,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    timestamp: nowUTC(),
  };

  const updatedReq: ServiceRequest = {
    ...currentReq,
    status: newStatus,
    statusHistory: [transition, ...currentReq.statusHistory],
    updatedAt: nowUTC(),
  };

  requests[reqIndex] = updatedReq;
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);

  // Sync mutation to backend database
  fetch(`${API_BASE_URL}/admin-portal/requests/${requestId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  }).catch(() => {});

  recordAudit(
    'REQUEST_STATUS_CHANGE',
    'ServiceRequest',
    currentReq.referenceNumber,
    `Status transitioned from ${currentReq.status} to ${newStatus}: ${reason}`,
    { from: currentReq.status, to: newStatus }
  );

  notify();
  return { success: true };
}

export function assignRequestOwner(requestId: string, ownerId: string): boolean {
  const user = getCurrentUser();
  if (!hasPermission('requests.update', user)) return false;

  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) return false;

  const targetOwner = users.find((u) => u.id === ownerId);
  if (!targetOwner) return false;

  requests[reqIndex] = {
    ...requests[reqIndex],
    assignedOwnerId: targetOwner.id,
    assignedOwnerName: targetOwner.name,
    updatedAt: nowUTC(),
  };
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);

  recordAudit(
    'REQUEST_OWNER_ASSIGNED',
    'ServiceRequest',
    requests[reqIndex].referenceNumber,
    `Assigned owner: ${targetOwner.name}`,
    { ownerId: targetOwner.id, ownerName: targetOwner.name }
  );

  notify();
  return true;
}

export function assignGuardsToRequest(
  requestId: string,
  guardIds: string[]
): { success: boolean; error?: string } {
  const reqIndex = requests.findIndex((r) => r.id === requestId || r.referenceNumber === requestId);
  if (reqIndex === -1) {
    return { success: false, error: 'Request not found' };
  }

  const currentReq = requests[reqIndex];
  const allEmployees = [...employees];
  const selectedGuards = allEmployees
    .filter((emp) => guardIds.includes(emp.id))
    .map((emp) => ({
      id: emp.id,
      name: emp.name || emp.fullName || 'Security Officer',
      badgeNumber: emp.badgeNumber || emp.employeeNumber,
      phone: emp.phone,
      rank: emp.rank || 'Tactical Sentry',
      avatarUrl: emp.avatarUrl,
    }));

  const user = getCurrentUser();
  const requiredGuards = currentReq.requiredGuards || 1;
  const newStatus: RequestStatus = selectedGuards.length > 0 ? 'contract_active' : currentReq.status;

  const historyEntry: StatusTransitionHistory = {
    id: `hist-${Date.now()}`,
    fromStatus: currentReq.status,
    toStatus: newStatus,
    reason: selectedGuards.length > 0
      ? `Assigned ${selectedGuards.length} guard(s) [Requested: ${requiredGuards}]. Contract activated: ${selectedGuards.map((g) => g.name).join(', ')}`
      : 'Unassigned guards from service request',
    actorId: user?.id || 'system',
    actorName: user?.name || 'Operations Staff',
    actorRole: user?.role || 'operations_staff',
    timestamp: nowUTC(),
  };

  const updatedReq: ServiceRequest = {
    ...currentReq,
    assignedGuardIds: guardIds,
    assignedGuards: selectedGuards,
    status: newStatus,
    statusHistory: [historyEntry, ...(currentReq.statusHistory || [])],
    updatedAt: nowUTC(),
  };

  requests[reqIndex] = updatedReq;
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);

  // Auto-provision or update Client & Security Site for this active contract
  if (selectedGuards.length > 0) {
    let targetClient = clients.find(
      (c) => c.companyName.toLowerCase() === currentReq.clientName.trim().toLowerCase()
    );
    if (!targetClient) {
      const code = currentReq.requestCode || currentReq.referenceNumber;
      targetClient = {
        id: `client-${Date.now()}`,
        accountReference: `CLI-${Math.floor(100 + Math.random() * 900)}`,
        clientCode: `CLI-${Math.floor(100 + Math.random() * 900)}`,
        companyName: currentReq.clientName,
        contactPerson: currentReq.contactName || currentReq.clientName,
        email: currentReq.contactEmail,
        phone: currentReq.contactPhone,
        industry: 'Commercial Security Services',
        billingAddress: currentReq.siteAddress,
        city: currentReq.city || 'Nairobi',
        activeContractsCount: 1,
        status: 'active',
        notes: `Active contract provisioned from Service Request ${code}`,
        createdAt: nowUTC(),
        updatedAt: nowUTC(),
      };
      clients = [targetClient, ...clients];
      saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    } else {
      targetClient.activeContractsCount = (targetClient.activeContractsCount || 0) + 1;
      saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    }

    const facilityName = currentReq.siteAddress || `${currentReq.clientName} Post`;
    let targetSite = sites.find(
      (s) => s.clientId === targetClient!.id && s.name.toLowerCase() === facilityName.toLowerCase()
    );
    if (!targetSite) {
      targetSite = {
        id: `site-${Date.now()}`,
        siteCode: `NBO-${Math.floor(100 + Math.random() * 900)}`,
        name: facilityName,
        clientId: targetClient.id,
        clientName: targetClient.companyName,
        address: currentReq.siteAddress,
        city: currentReq.city || 'Nairobi',
        contactPerson: currentReq.contactName || currentReq.clientName,
        contactPhone: currentReq.contactPhone,
        status: 'active',
        operationalNotes: `Active contract post deployed with ${selectedGuards.length} guard(s).`,
        assignedSupervisorIds: ['usr-sup-1'],
        requiredGuardCount: requiredGuards,
        createdAt: nowUTC(),
        updatedAt: nowUTC(),
      };
      sites = [targetSite, ...sites];
      saveToStorage(STORAGE_KEYS.SITES, sites);
    }
  }

  // Update guard availability in employee records
  employees = employees.map((emp) => {
    if (guardIds.includes(emp.id)) {
      return {
        ...emp,
        isAvailable: false,
        currentAssignment: `Assigned to ${currentReq.referenceNumber} (${currentReq.clientName})`,
      };
    }
    // If was previously assigned to this request but now unassigned
    if (currentReq.assignedGuardIds?.includes(emp.id) && !guardIds.includes(emp.id)) {
      return {
        ...emp,
        isAvailable: true,
        currentAssignment: undefined,
      };
    }
    return emp;
  });
  saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);

  // Sync to backend API
  fetch(`${API_BASE_URL}/admin-portal/requests/${requestId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assignedGuards: selectedGuards,
      assignedGuardIds: guardIds,
      status: newStatus,
    }),
  }).catch(() => {});

  recordAudit(
    'GUARD_ASSIGNMENT',
    'ServiceRequest',
    currentReq.referenceNumber,
    `Assigned ${selectedGuards.length}/${requiredGuards} guard(s) to ${currentReq.referenceNumber}`,
    { guardIds, count: selectedGuards.length, required: requiredGuards }
  );

  notify();
  return { success: true };
}

export function scheduleRequestAssessment(
  requestId: string,
  assessmentDate: string,
  notes: string
): boolean {
  const user = getCurrentUser();
  if (!hasPermission('requests.update', user)) return false;

  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) return false;

  requests[reqIndex] = {
    ...requests[reqIndex],
    assessmentScheduledDate: assessmentDate,
    assessmentNotes: notes,
    updatedAt: nowUTC(),
  };
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);

  recordAudit(
    'REQUEST_STATUS_CHANGE',
    'ServiceRequest',
    requests[reqIndex].referenceNumber,
    `Site assessment scheduled for ${assessmentDate}`
  );
  notify();
  return true;
}

export function setRequestQuotation(
  requestId: string,
  amountKES: number,
  details: string
): boolean {
  const user = getCurrentUser();
  if (!hasPermission('requests.update', user)) return false;

  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) return false;

  requests[reqIndex] = {
    ...requests[reqIndex],
    quotationAmountKES: amountKES,
    quotationDetails: details,
    updatedAt: nowUTC(),
  };
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);

  // Sync quotation to backend database
  fetch(`${API_BASE_URL}/admin-portal/requests/${requestId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quotationAmountKES: amountKES }),
  }).catch(() => {});

  recordAudit(
    'REQUEST_STATUS_CHANGE',
    'ServiceRequest',
    requests[reqIndex].referenceNumber,
    `Quotation created: KES ${amountKES.toLocaleString()}`
  );
  notify();
  return true;
}

export function addInternalNoteToRequest(requestId: string, content: string): boolean {
  const user = getCurrentUser();
  if (user.role === 'client') return false; // Clients never add or see internal notes

  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) return false;

  const note = {
    id: `not-${Date.now()}`,
    authorId: user.id,
    authorName: user.name,
    authorRole: user.role,
    content,
    createdAt: nowUTC(),
  };

  requests[reqIndex] = {
    ...requests[reqIndex],
    internalNotes: [...requests[reqIndex].internalNotes, note],
    updatedAt: nowUTC(),
  };
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);
  notify();
  return true;
}

export function addClientMessageToRequest(requestId: string, content: string): boolean {
  const user = getCurrentUser();
  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) return false;

  const msg = {
    id: `msg-${Date.now()}`,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    content,
    isClientFacing: true as const,
    createdAt: nowUTC(),
  };

  requests[reqIndex] = {
    ...requests[reqIndex],
    clientMessages: [...requests[reqIndex].clientMessages, msg],
    updatedAt: nowUTC(),
  };
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);
  notify();
  return true;
}

export function convertRequestToClientAndSite(requestId: string): {
  success: boolean;
  client?: Client;
  site?: Site;
  error?: string;
} {
  const user = getCurrentUser();
  if (!hasPermission('requests.update', user)) {
    return { success: false, error: 'Permission denied: requests.update required' };
  }

  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) return { success: false, error: 'Service request not found' };

  const req = requests[reqIndex];
  if (req.status !== 'accepted' && req.status !== 'contract_active') {
    return {
      success: false,
      error: `Cannot convert request in '${req.status}' state. Request must be 'accepted' by client first.`,
    };
  }

  // Idempotency: check if already converted or duplicate company exists
  let targetClient = clients.find(
    (c) => c.companyName.toLowerCase() === req.clientName.trim().toLowerCase()
  );

  if (!targetClient) {
    const code = req.requestCode || req.referenceNumber;
    const newClient: Client = {
      id: `client-${Date.now()}`,
      accountReference: `CLI-${Math.floor(100 + Math.random() * 900)}`,
      clientCode: `CLI-${Math.floor(100 + Math.random() * 900)}`,
      companyName: req.clientName,
      contactPerson: req.contactName || req.clientName,
      email: req.contactEmail,
      phone: req.contactPhone,
      industry: 'Commercial Facilities',
      billingAddress: req.locationAddress || req.siteAddress,
      city: 'Nairobi',
      activeContractsCount: 1,
      status: 'active',
      notes: `Converted from Service Request ${code}`,
      createdAt: nowUTC(),
      updatedAt: nowUTC(),
    };
    clients = [newClient, ...clients];
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    targetClient = newClient;
  }

  const facilityName = req.siteName || req.siteAddress || `${req.clientName} Post`;
  let targetSite = sites.find(
    (s) => s.clientId === targetClient!.id && s.name.toLowerCase() === facilityName.toLowerCase()
  );

  if (!targetSite) {
    const code = req.requestCode || req.referenceNumber;
    const newSite: Site = {
      id: `site-${Date.now()}`,
      siteCode: `NBO-${Math.floor(100 + Math.random() * 900)}`,
      name: facilityName,
      clientId: targetClient.id,
      clientName: targetClient.companyName,
      address: req.locationAddress || req.siteAddress,
      city: 'Nairobi',
      contactPerson: req.contactName || req.clientName,
      contactPhone: req.contactPhone,
      status: 'active',
      operationalNotes: `Converted from request ${code}. Required posts: ${req.requiredGuards}`,
      assignedSupervisorIds: ['usr-sup-1'],
      requiredGuardCount: req.requiredGuards || 2,
      createdAt: nowUTC(),
      updatedAt: nowUTC(),
    };
    sites = [newSite, ...sites];
    saveToStorage(STORAGE_KEYS.SITES, sites);
    targetSite = newSite;
  }

  // Transition request to contract_active if not already
  if (req.status !== 'contract_active') {
    requests[reqIndex] = {
      ...req,
      status: 'contract_active',
      updatedAt: nowUTC(),
    };
    saveToStorage(STORAGE_KEYS.REQUESTS, requests);
  }

  const reqRef = req.requestCode || req.referenceNumber;
  recordAudit(
    'REQUEST_CONVERT' as any,
    'ServiceRequest',
    reqRef,
    `Converted accepted request ${reqRef} into Client (${targetClient.companyName}) and Site (${targetSite.name}). Duplicate protection verified.`
  );

  notify();
  return { success: true, client: targetClient, site: targetSite };
}

// --- CLIENTS ---

export function getClients(): Client[] {
  const user = getCurrentUser();
  if (user.role === 'client') {
    return clients.filter((c) => c.id === user.clientId);
  }
  return [...clients];
}

export function getClientById(id: string): Client | undefined {
  const user = getCurrentUser();
  if (user.role === 'client' && user.clientId !== id) return undefined;
  return clients.find((c) => c.id === id);
}

export function saveClient(clientData: Partial<Client>): { success: boolean; client?: Client; error?: string } {
  const user = getCurrentUser();
  const isCreate = !clientData.id;
  if (isCreate && !hasPermission('clients.create', user)) {
    return { success: false, error: 'Permission denied: clients.create required' };
  }
  if (!isCreate && !hasPermission('clients.update', user)) {
    return { success: false, error: 'Permission denied: clients.update required' };
  }

  // Duplicate check
  if (isCreate) {
    const exists = clients.some(
      (c) => c.companyName.toLowerCase() === clientData.companyName?.trim().toLowerCase()
    );
    if (exists) {
      return { success: false, error: 'A client account with this company name already exists' };
    }

    const newClient: Client = {
      id: `client-${Date.now()}`,
      accountReference: `CLI-${Math.floor(100 + Math.random() * 900)}`,
      companyName: clientData.companyName || 'Untitled Client',
      contactPerson: clientData.contactPerson || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      industry: clientData.industry || 'General Commercial',
      billingAddress: clientData.billingAddress || '',
      city: clientData.city || 'Nairobi',
      activeContractsCount: clientData.activeContractsCount || 0,
      status: clientData.status || 'active',
      notes: clientData.notes || '',
      createdAt: nowUTC(),
      updatedAt: nowUTC(),
    };

    clients = [newClient, ...clients];
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    recordAudit('CLIENT_CREATE' as any, 'Client', newClient.id, `Created client account ${newClient.companyName}`);
    notify();
    return { success: true, client: newClient };
  } else {
    const idx = clients.findIndex((c) => c.id === clientData.id);
    if (idx === -1) return { success: false, error: 'Client not found' };

    const updated: Client = {
      ...clients[idx],
      ...clientData,
      updatedAt: nowUTC(),
    };
    clients[idx] = updated;
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    recordAudit('CLIENT_UPDATE' as any, 'Client', updated.id, `Updated client account ${updated.companyName}`);
    notify();
    return { success: true, client: updated };
  }
}

// --- SITES ---

export function getSites(): Site[] {
  const user = getCurrentUser();
  if (user.role === 'client') {
    return sites.filter((s) => s.clientId === user.clientId);
  }
  if (user.role === 'supervisor') {
    return sites.filter((s) => (user.assignedSiteIds || []).includes(s.id));
  }
  if (user.role === 'guard') {
    return sites.filter((s) => (user.assignedSiteIds || []).includes(s.id));
  }
  return [...sites];
}

export function getSiteById(id: string): Site | undefined {
  const s = sites.find((site) => site.id === id);
  if (!s) return undefined;
  if (!isSiteInScope(s.id)) return undefined;
  return s;
}

export function saveSite(siteData: Partial<Site>): { success: boolean; site?: Site; error?: string } {
  const user = getCurrentUser();
  if (!hasPermission('sites.manage', user)) {
    return { success: false, error: 'Permission denied: sites.manage required' };
  }

  const isCreate = !siteData.id;
  if (isCreate) {
    const newSite: Site = {
      id: `site-${Date.now()}`,
      siteCode: `NBO-${Math.floor(100 + Math.random() * 900)}`,
      name: siteData.name || 'Untitled Security Site',
      clientId: siteData.clientId || clients[0]?.id || 'client-1',
      clientName: clients.find((c) => c.id === siteData.clientId)?.companyName || 'Covenant Client',
      address: siteData.address || '',
      city: siteData.city || 'Nairobi',
      contactPerson: siteData.contactPerson || '',
      contactPhone: siteData.contactPhone || '',
      status: siteData.status || 'active',
      operationalNotes: siteData.operationalNotes || '',
      assignedSupervisorIds: siteData.assignedSupervisorIds || [],
      requiredGuardCount: siteData.requiredGuardCount || 2,
      coordinates: siteData.coordinates,
      createdAt: nowUTC(),
      updatedAt: nowUTC(),
    };

    sites = [newSite, ...sites];
    saveToStorage(STORAGE_KEYS.SITES, sites);
    recordAudit('SITE_CREATE', 'Site', newSite.id, `Created security site ${newSite.name}`);
    notify();
    return { success: true, site: newSite };
  } else {
    const idx = sites.findIndex((s) => s.id === siteData.id);
    if (idx === -1) return { success: false, error: 'Site not found' };

    const updated: Site = {
      ...sites[idx],
      ...siteData,
      updatedAt: nowUTC(),
    };
    sites[idx] = updated;
    saveToStorage(STORAGE_KEYS.SITES, sites);
    recordAudit('SITE_UPDATE', 'Site', updated.id, `Updated security site details for ${updated.name}`);
    notify();
    return { success: true, site: updated };
  }
}

// --- EMPLOYEES ---

export function getEmployees(): Employee[] {
  const user = getCurrentUser();
  if (!hasPermission('employees.read', user)) return [];
  if (user.role === 'supervisor') {
    // Supervisor sees employees assigned to their sites
    return employees.filter((e) =>
      e.assignedSiteIds.some((sId) => (user.assignedSiteIds || []).includes(sId))
    );
  }
  return [...employees];
}

export function getEmployeeById(id: string): Employee | undefined {
  const user = getCurrentUser();
  if (!hasPermission('employees.read', user)) return undefined;
  return employees.find((e) => e.id === id);
}

export function saveEmployee(empData: Partial<Employee>): { success: boolean; employee?: Employee; error?: string } {
  const user = getCurrentUser();
  if (!hasPermission('employees.manage', user)) {
    return { success: false, error: 'Permission denied: employees.manage required' };
  }

  const isCreate = !empData.id;
  if (isCreate) {
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      employeeNumber: `CS-EMP-${Math.floor(200 + Math.random() * 800)}`,
      name: empData.name || 'New Officer',
      email: empData.email || '',
      phone: empData.phone || '',
      nationalIdMasked: empData.nationalIdMasked || '•••• 0000',
      role: empData.role || 'guard',
      employmentStatus: empData.employmentStatus || 'active',
      qualifications: empData.qualifications || ['PSRA Certified'],
      assignedSiteIds: empData.assignedSiteIds || [],
      dateHired: empData.dateHired || new Date().toISOString().split('T')[0],
      emergencyContact: empData.emergencyContact || '',
      avatarUrl: empData.avatarUrl,
      createdAt: nowUTC(),
      updatedAt: nowUTC(),
    };

    employees = [newEmp, ...employees];
    saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
    recordAudit('EMPLOYEE_CREATE', 'Employee', newEmp.employeeNumber, `Enrolled employee ${newEmp.name}`);
    notify();
    return { success: true, employee: newEmp };
  } else {
    const idx = employees.findIndex((e) => e.id === empData.id);
    if (idx === -1) return { success: false, error: 'Employee not found' };

    const updated: Employee = {
      ...employees[idx],
      ...empData,
      updatedAt: nowUTC(),
    };
    employees[idx] = updated;
    saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
    recordAudit('EMPLOYEE_UPDATE', 'Employee', updated.employeeNumber, `Updated record for ${updated.name}`);
    notify();
    return { success: true, employee: updated };
  }
}

// --- SHIFTS & SCHEDULING ---

export function getShifts(): Shift[] {
  const user = getCurrentUser();
  if (user.role === 'guard') {
    return shifts.filter((s) => s.guardId === user.id || s.guardName === user.name);
  }
  if (user.role === 'supervisor') {
    return shifts.filter((s) => (user.assignedSiteIds || []).includes(s.siteId));
  }
  if (user.role === 'client') {
    const clientSiteIds = sites.filter((s) => s.clientId === user.clientId).map((s) => s.id);
    return shifts.filter((s) => clientSiteIds.includes(s.siteId));
  }
  return [...shifts];
}

export interface ShiftValidationResult {
  hasConflict: boolean;
  conflictDetails?: string;
  hasRestWarning: boolean;
  restWarningDetails?: string;
}

export function validateShiftSchedule(
  guardId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeShiftId?: string
): ShiftValidationResult {
  // Check overlapping shifts for this guard
  const existingForGuard = shifts.filter(
    (s) => s.guardId === guardId && s.id !== excludeShiftId && s.status !== 'cancelled'
  );

  for (const s of existingForGuard) {
    if (doShiftsOverlap(date, startTime, endTime, s.date, s.startTime, s.endTime)) {
      return {
        hasConflict: true,
        conflictDetails: `Guard already scheduled on shift ${s.shiftCode} (${s.siteName}) from ${s.startTime} to ${s.endTime}`,
        hasRestWarning: false,
      };
    }
  }

  // Check rest period (recommended minimum 8 hours)
  const [sy, sm, sd] = date.split('-').map(Number);
  const [sh, smin] = startTime.split(':').map(Number);
  const plannedStart = new Date(Date.UTC(sy, sm - 1, sd, sh, smin));

  for (const s of existingForGuard) {
    const [ey, em, ed] = s.date.split('-').map(Number);
    const [eh, emin] = s.endTime.split(':').map(Number);
    const priorEnd = new Date(Date.UTC(ey, em - 1, ed, eh, emin));

    const restHours = getRestPeriodHours(priorEnd.toISOString(), plannedStart.toISOString());
    if (restHours >= 0 && restHours < 8) {
      return {
        hasConflict: false,
        hasRestWarning: true,
        restWarningDetails: `Warning: Only ${restHours} hours rest between previous shift (${s.shiftCode}) and planned start. Standard minimum is 8 hours.`,
      };
    }
  }

  return { hasConflict: false, hasRestWarning: false };
}

export function saveShift(shiftData: Partial<Shift>): { success: boolean; shift?: Shift; error?: string } {
  const user = getCurrentUser();
  if (!hasPermission('shifts.manage', user)) {
    return { success: false, error: 'Permission denied: shifts.manage required' };
  }

  const guard = employees.find((e) => e.id === shiftData.guardId);
  if (!guard) return { success: false, error: 'Assigned guard not found' };

  const site = sites.find((s) => s.id === shiftData.siteId);
  if (!site) return { success: false, error: 'Assigned site not found' };

  // Validate conflict
  const val = validateShiftSchedule(
    guard.id,
    shiftData.date || '',
    shiftData.startTime || '',
    shiftData.endTime || '',
    shiftData.id
  );

  if (val.hasConflict) {
    return { success: false, error: val.conflictDetails };
  }

  const isCreate = !shiftData.id;
  if (isCreate) {
    const newShift: Shift = {
      id: `sh-${Date.now()}`,
      shiftCode: `SH-${Math.floor(1000 + Math.random() * 9000)}`,
      siteId: site.id,
      siteName: site.name,
      guardId: guard.id,
      guardName: guard.name,
      supervisorId: site.assignedSupervisorIds[0] || 'usr-sup-1',
      supervisorName: 'Samuel Okello',
      date: shiftData.date || new Date().toISOString().split('T')[0],
      startTime: shiftData.startTime || '06:00',
      endTime: shiftData.endTime || '18:00',
      shiftType: shiftData.shiftType || 'day_shift',
      status: shiftData.status || 'scheduled',
      notes: shiftData.notes || '',
      createdAt: nowUTC(),
      updatedAt: nowUTC(),
    };

    shifts = [newShift, ...shifts];
    saveToStorage(STORAGE_KEYS.SHIFTS, shifts);
    recordAudit('SHIFT_CREATE', 'Shift', newShift.shiftCode, `Scheduled shift at ${site.name} for ${guard.name}`);
    notify();
    return { success: true, shift: newShift };
  } else {
    const idx = shifts.findIndex((s) => s.id === shiftData.id);
    if (idx === -1) return { success: false, error: 'Shift not found' };

    const updated: Shift = {
      ...shifts[idx],
      ...shiftData,
      siteName: site.name,
      guardName: guard.name,
      updatedAt: nowUTC(),
    };
    shifts[idx] = updated;
    saveToStorage(STORAGE_KEYS.SHIFTS, shifts);
    recordAudit('SHIFT_UPDATE', 'Shift', updated.shiftCode, `Updated shift schedule details`);
    notify();
    return { success: true, shift: updated };
  }
}

// --- ATTENDANCE OVERSIGHT & CORRECTIONS ---

export function getAttendanceRecords(): AttendanceRecord[] {
  const user = getCurrentUser();
  if (user.role === 'guard') {
    return attendance.filter((a) => a.guardId === user.id || a.guardName === user.name);
  }
  if (user.role === 'supervisor') {
    return attendance.filter((a) => (user.assignedSiteIds || []).includes(a.siteId));
  }
  if (user.role === 'client') {
    const clientSiteIds = sites.filter((s) => s.clientId === user.clientId).map((s) => s.id);
    return attendance.filter((a) => clientSiteIds.includes(a.siteId));
  }
  return [...attendance];
}

export function getAttendanceById(id: string): AttendanceRecord | undefined {
  return attendance.find((a) => a.id === id);
}

export function correctAttendanceRecord(
  attendanceId: string,
  newStatus: AttendanceStatus,
  reason: string,
  newCheckIn?: string,
  newCheckOut?: string
): { success: boolean; error?: string } {
  const user = getCurrentUser();
  if (!hasPermission('attendance.correct', user)) {
    return { success: false, error: 'Permission denied: attendance.correct required' };
  }

  const idx = attendance.findIndex((a) => a.id === attendanceId);
  if (idx === -1) return { success: false, error: 'Attendance record not found' };

  const current = attendance[idx];
  const correction = {
    id: `corr-${Date.now()}`,
    attendanceId: current.id,
    correctedByUserId: user.id,
    correctedByUserName: user.name,
    correctedByUserRole: user.role,
    reason,
    priorStatus: current.currentStatus,
    newStatus,
    priorCheckIn: current.actualCheckIn,
    newCheckIn: newCheckIn || current.actualCheckIn,
    priorCheckOut: current.actualCheckOut,
    newCheckOut: newCheckOut || current.actualCheckOut,
    timestamp: nowUTC(),
  };

  const updated: AttendanceRecord = {
    ...current,
    currentStatus: newStatus,
    isException: newStatus === 'late' || newStatus === 'absent' || newStatus === 'incomplete',
    actualCheckIn: newCheckIn !== undefined ? newCheckIn : current.actualCheckIn,
    actualCheckOut: newCheckOut !== undefined ? newCheckOut : current.actualCheckOut,
    correctionHistory: [correction, ...current.correctionHistory],
    updatedAt: nowUTC(),
  };

  attendance[idx] = updated;
  saveToStorage(STORAGE_KEYS.ATTENDANCE, attendance);

  recordAudit(
    'ATTENDANCE_CORRECTION',
    'AttendanceRecord',
    current.id,
    `Corrected attendance for ${current.guardName} (${current.siteName}) from ${current.currentStatus} to ${newStatus}. Reason: ${reason}`,
    { priorStatus: current.currentStatus, newStatus }
  );

  notify();
  return { success: true };
}

// --- CASES & COMPLAINTS ---

export function getCases(): Case[] {
  const user = getCurrentUser();
  if (user.role === 'client') {
    return cases.filter((c) => c.clientId === user.clientId);
  }
  if (user.role === 'supervisor') {
    return cases.filter((c) => (user.assignedSiteIds || []).includes(c.siteId));
  }
  return [...cases];
}

export function getCaseById(id: string): Case | undefined {
  const c = cases.find((item) => item.id === id || item.caseNumber === id);
  if (!c) return undefined;
  const user = getCurrentUser();
  if (user.role === 'client' && c.clientId !== user.clientId) return undefined;
  return c;
}

export const VALID_CASE_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  submitted: ['assigned', 'closed'],
  assigned: ['in_progress', 'closed'],
  in_progress: ['resolution_proposed', 'closed'],
  resolution_proposed: ['closed', 'in_progress'],
  closed: ['reopened'],
  reopened: ['in_progress', 'closed'],
};

export function updateCaseStatus(
  caseId: string,
  newStatus: CaseStatus,
  reason: string,
  resolutionSummary?: string
): { success: boolean; error?: string } {
  const user = getCurrentUser();
  if (!hasPermission('cases.resolve', user)) {
    return { success: false, error: 'Permission denied: cases.resolve required' };
  }

  const idx = cases.findIndex((c) => c.id === caseId);
  if (idx === -1) return { success: false, error: 'Case not found' };

  const current = cases[idx];
  const allowed = VALID_CASE_TRANSITIONS[current.status] || [];
  if (!allowed.includes(newStatus)) {
    return { success: false, error: `Invalid case transition from ${current.status} to ${newStatus}` };
  }

  const transition = {
    id: `sh-case-${Date.now()}`,
    fromStatus: current.status,
    toStatus: newStatus,
    reason,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    timestamp: nowUTC(),
  };

  const updated: Case = {
    ...current,
    status: newStatus,
    statusHistory: [transition, ...current.statusHistory],
    proposedResolution: resolutionSummary || current.proposedResolution,
    closureReason: newStatus === 'closed' ? reason : current.closureReason,
    updatedAt: nowUTC(),
  };

  cases[idx] = updated;
  saveToStorage(STORAGE_KEYS.CASES, cases);

  // Sync mutation to backend database
  fetch(`${API_BASE_URL}/admin-portal/cases/${caseId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  }).catch(() => {});

  recordAudit(
    'CASE_STATUS_CHANGE',
    'Case',
    current.caseNumber,
    `Status transitioned from ${current.status} to ${newStatus}: ${reason}`
  );

  notify();
  return { success: true };
}

export function assignCaseOwner(caseId: string, ownerId: string): boolean {
  const user = getCurrentUser();
  if (!hasPermission('cases.assign', user)) return false;

  const idx = cases.findIndex((c) => c.id === caseId);
  if (idx === -1) return false;

  const target = users.find((u) => u.id === ownerId);
  if (!target) return false;

  cases[idx] = {
    ...cases[idx],
    assignedOwnerId: target.id,
    assignedOwnerName: target.name,
    updatedAt: nowUTC(),
  };
  saveToStorage(STORAGE_KEYS.CASES, cases);

  recordAudit('CASE_ASSIGN', 'Case', cases[idx].caseNumber, `Assigned investigation owner to ${target.name}`);
  notify();
  return true;
}

export function addInternalNoteToCase(caseId: string, content: string): boolean {
  const user = getCurrentUser();
  if (user.role === 'client') return false; // Security: clients cannot add/see internal notes

  const idx = cases.findIndex((c) => c.id === caseId);
  if (idx === -1) return false;

  const note = {
    id: `not-case-${Date.now()}`,
    authorId: user.id,
    authorName: user.name,
    authorRole: user.role,
    content,
    createdAt: nowUTC(),
  };

  cases[idx] = {
    ...cases[idx],
    internalNotes: [...cases[idx].internalNotes, note],
    updatedAt: nowUTC(),
  };
  saveToStorage(STORAGE_KEYS.CASES, cases);
  notify();
  return true;
}

export function addClientMessageToCase(caseId: string, content: string): boolean {
  const user = getCurrentUser();
  const idx = cases.findIndex((c) => c.id === caseId);
  if (idx === -1) return false;

  const msg = {
    id: `msg-case-${Date.now()}`,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    content,
    isClientFacing: true as const,
    createdAt: nowUTC(),
  };

  cases[idx] = {
    ...cases[idx],
    clientMessages: [...cases[idx].clientMessages, msg],
    updatedAt: nowUTC(),
  };
  saveToStorage(STORAGE_KEYS.CASES, cases);
  notify();
  return true;
}

// --- USER & ROLE MANAGEMENT ---

export function updateUserRole(userId: string, newRole: Role): boolean {
  const currentUser = getCurrentUser();
  if (!hasPermission('roles.manage', currentUser)) return false;

  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;

  const priorRole = users[idx].role;
  users[idx] = {
    ...users[idx],
    role: newRole,
  };
  saveToStorage(STORAGE_KEYS.USERS, users);

  recordAudit(
    'ROLE_CHANGE',
    'User',
    users[idx].email,
    `Changed role for ${users[idx].name} from ${priorRole} to ${newRole}`
  );
  notify();
  return true;
}

export function saveUser(userData: Partial<User>): { success: boolean; user?: User; error?: string } {
  const currentUser = getCurrentUser();
  if (!hasPermission('users.manage', currentUser)) {
    return { success: false, error: 'Permission denied: users.manage required' };
  }

  const isCreate = !userData.id;
  if (isCreate) {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name || 'New Staff',
      email: userData.email || '',
      username: userData.username,
      phone: userData.phone || '',
      role: userData.role || 'operations_staff',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      assignedSiteIds: userData.assignedSiteIds || [],
      clientId: userData.clientId,
      must_change_password: userData.must_change_password ?? userData.mustChangePassword,
      mustChangePassword: userData.mustChangePassword ?? userData.must_change_password,
      createdAt: nowUTC(),
    };
    users = [...users, newUser];
    saveToStorage(STORAGE_KEYS.USERS, users);
    recordAudit('USER_CREATE', 'User', newUser.email, `Created user account for ${newUser.name}`);
    notify();
    return { success: true, user: newUser };
  } else {
    const idx = users.findIndex((u) => u.id === userData.id);
    if (idx === -1) return { success: false, error: 'User not found' };

    const updated = {
      ...users[idx],
      ...userData,
      must_change_password: userData.must_change_password ?? userData.mustChangePassword ?? users[idx].must_change_password,
      mustChangePassword: userData.mustChangePassword ?? userData.must_change_password ?? users[idx].mustChangePassword,
    };
    users[idx] = updated;
    saveToStorage(STORAGE_KEYS.USERS, users);
    recordAudit('USER_UPDATE', 'User', updated.email, `Updated user account details for ${updated.name}`);
    notify();
    return { success: true, user: updated };
  }
}
