/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientRequestQueryDto, CreateClientRequestDto, RequestCancellationDto } from './dto/client-request-query.dto';
import { ClientCaseReplyDto, CreateClientCaseDto, ReopenCaseDto } from './dto/client-case-reply.dto';

export interface AuthenticatedClientContext {
  userId: string;
  clientId: string;
  role: 'client_admin' | 'client_viewer';
}

export class ClientPortalService {
  /**
   * Enforces server-side client membership ownership on any resource query.
   * Throws 403 Forbidden on IDOR violation.
   */
  public assertClientOwnership(resourceClientId: string, userContext: AuthenticatedClientContext, resourceType: string, resourceId: string) {
    if (resourceClientId !== userContext.clientId) {
      throw new Error(`403 Forbidden: Insecure Direct Object Reference (IDOR) violation. Client '${userContext.clientId}' is unauthorized to access ${resourceType} '${resourceId}'.`);
    }
  }

  /**
   * Sanitizes internal operational notes, guard PII, and risk matrices from response DTOs.
   */
  public sanitizeOutput<T extends Record<string, any>>(entity: T, restrictedKeys: string[] = ['internalStaffNotes', 'guardRosterInternal', 'operationalNotes', 'internalInvestigatorNotes']): T {
    const sanitized = { ...entity };
    for (const key of restrictedKeys) {
      delete sanitized[key];
    }
    return sanitized;
  }
}
