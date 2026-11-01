/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clientPortalApi } from '@/src/api/clientPortalApi';
import { DashboardMetrics, ServiceRequest, ClientCase, PortalNotification } from '@/src/types/clientPortal';

export const clientDashboardApi = {
  fetchDashboardData: async () => {
    const [metrics, requests, cases, notifications] = await Promise.all([
      clientPortalApi.getDashboardMetrics(),
      clientPortalApi.getRequests(),
      clientPortalApi.getCases(),
      clientPortalApi.getNotifications(),
    ]);

    return {
      metrics,
      recentRequests: requests.slice(0, 4),
      openCases: cases.filter(c => c.status !== 'Closed').slice(0, 4),
      recentNotifications: notifications.slice(0, 4),
    };
  },
};
