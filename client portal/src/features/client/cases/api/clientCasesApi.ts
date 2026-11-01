/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clientPortalApi } from '@/src/api/clientPortalApi';
import { ClientCase } from '@/src/types/clientPortal';

export const clientCasesApi = {
  getCases: async (query?: { status?: string; search?: string }): Promise<ClientCase[]> => {
    return clientPortalApi.getCases(query);
  },

  getCaseById: async (id: string): Promise<ClientCase> => {
    return clientPortalApi.getCaseById(id);
  },

  createCase: async (data: {
    subject: string;
    category: ClientCase['category'];
    priority: ClientCase['priority'];
    siteId?: string;
    description: string;
  }): Promise<ClientCase> => {
    return clientPortalApi.createCase(data);
  },

  addReply: async (caseId: string, content: string, attachments?: File[]): Promise<ClientCase> => {
    return clientPortalApi.addCaseReply(caseId, content, attachments);
  },

  closeCase: async (caseId: string): Promise<ClientCase> => {
    return clientPortalApi.closeCase(caseId);
  },

  reopenCase: async (caseId: string, reason: string): Promise<ClientCase> => {
    return clientPortalApi.reopenCase(caseId, reason);
  },
};
