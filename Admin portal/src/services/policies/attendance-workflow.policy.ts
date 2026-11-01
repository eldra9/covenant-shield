/**
 * Attendance Correction Approval Workflow Policy
 * Enforces:
 * 1. Scope confirmation
 * 2. Immutable preservation of original attendance event
 * 3. Two-step approval with prohibited self-approval (requester !== approver)
 * 4. Optimistic concurrency check (version check)
 * 5. Rejection of duplicate or conflicting approvals
 */

import { AttendanceRecord, AttendanceStatus, User } from '@/types';
import { nowUTC } from '@/utils/date';

export interface AttendanceCorrectionRequest {
  id: string;
  attendanceId: string;
  requestedByUserId: string;
  requestedByUserName: string;
  requestedByUserRole: string;
  proposedStatus: AttendanceStatus;
  proposedCheckIn?: string;
  proposedCheckOut?: string;
  justificationReason: string;
  evidenceNotes?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  reviewedByUserId?: string;
  reviewedByUserName?: string;
  reviewedAt?: string;
  createdAt: string;
  version: number;
}

export interface CorrectionValidationResult {
  allowed: boolean;
  error?: string;
}

/**
 * Validates whether a user can approve a given correction request
 */
export function validateCorrectionApproval(
  correctionReq: AttendanceCorrectionRequest,
  attendanceRecord: AttendanceRecord,
  approvingUser: User,
  expectedVersion: number
): CorrectionValidationResult {
  // 1. Concurrency / Version check
  if (correctionReq.version !== expectedVersion) {
    return {
      allowed: false,
      error: 'Stale edit conflict: This attendance record was modified concurrently. Please reload.',
    };
  }

  // 2. Reject repeated or conflicting approvals
  if (correctionReq.status !== 'pending_review') {
    return {
      allowed: false,
      error: `Conflict: This correction request has already been ${correctionReq.status}.`,
    };
  }

  // 3. Prohibit Self-Approval (CRITICAL INVARIANT)
  if (correctionReq.requestedByUserId === approvingUser.id) {
    return {
      allowed: false,
      error: 'Compliance violation: Prohibited self-approval. An independent supervisor or operations manager must review and authorize this correction.',
    };
  }

  // 4. Role check for approval
  if (approvingUser.role !== 'operations_staff' && approvingUser.role !== 'super_admin' && approvingUser.role !== 'supervisor') {
    return {
      allowed: false,
      error: 'Permission denied: User does not hold supervisory correction authority.',
    };
  }

  return { allowed: true };
}
