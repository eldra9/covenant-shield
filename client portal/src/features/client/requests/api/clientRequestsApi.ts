/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clientPortalApi } from '@/src/api/clientPortalApi';
import { ServiceRequest } from '@/src/types/clientPortal';

export const clientRequestsApi = {
  getRequests: async (query?: { search?: string; status?: string }): Promise<ServiceRequest[]> => {
    return clientPortalApi.getRequests(query);
  },

  getRequestById: async (id: string): Promise<ServiceRequest> => {
    return clientPortalApi.getRequestById(id);
  },

  createRequest: async (data: {
    siteId: string;
    serviceType: string;
    priority: ServiceRequest['priority'];
    requestedStartDate: string;
    description: string;
  }): Promise<ServiceRequest> => {
    return clientPortalApi.createServiceRequest(data);
  },

  approveQuotation: async (requestId: string): Promise<ServiceRequest> => {
    return clientPortalApi.approveQuotation(requestId);
  },

  requestCancellation: async (requestId: string, reason: string): Promise<ServiceRequest> => {
    return clientPortalApi.requestCancellation(requestId, reason);
  },
};
