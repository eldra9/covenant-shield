import { RequestStatus, StatusHistoryEntry } from '../../../../../packages/shared/src/types/index.ts';

export class InvalidStateTransitionError extends Error {
  public statusCode = 400;
  public code = 'INVALID_STATE_TRANSITION';

  constructor(fromState: string, toState: string) {
    super(`Cannot transition service request from status "${fromState}" to "${toState}". Action not permitted.`);
    this.name = 'InvalidStateTransitionError';
  }
}

// Centralized state transition policy matrix
const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  NEW: ['UNDER_REVIEW', 'REJECTED', 'CANCELLED'],
  UNDER_REVIEW: ['SITE_ASSESSMENT_SCHEDULED', 'REJECTED', 'CANCELLED'],
  SITE_ASSESSMENT_SCHEDULED: ['QUOTATION_SENT', 'REJECTED', 'CANCELLED'],
  QUOTATION_SENT: ['ACCEPTED', 'AMENDMENT_REQUESTED', 'REJECTED', 'CANCELLED'],
  AMENDMENT_REQUESTED: ['QUOTATION_SENT', 'CANCELLED'],
  ACCEPTED: ['CONTRACT_ACTIVE', 'CANCELLED'],
  CONTRACT_ACTIVE: ['CLOSED'],
  REJECTED: ['CLOSED'],
  CANCELLED: ['CLOSED'],
  CLOSED: [], // Terminal state
};

export interface TransitionContext {
  actor: string;
  reason: string;
  metadata?: Record<string, unknown>;
}

export function validateStateTransition(currentState: RequestStatus, targetState: RequestStatus): void {
  const allowed = ALLOWED_TRANSITIONS[currentState] || [];
  if (!allowed.includes(targetState)) {
    throw new InvalidStateTransitionError(currentState, targetState);
  }
}

export function createStatusHistoryEntry(
  fromState: RequestStatus | null,
  toState: RequestStatus,
  context: TransitionContext
): StatusHistoryEntry {
  return {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fromState,
    toState,
    changedAt: new Date().toISOString(),
    actor: context.actor,
    reason: context.reason,
    metadata: context.metadata,
  };
}
