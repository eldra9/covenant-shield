/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clientPortalApi } from '@/src/api/clientPortalApi';
import { PortalNotification } from '@/src/types/clientPortal';

export const clientNotificationsApi = {
  getNotifications: async (): Promise<PortalNotification[]> => {
    return clientPortalApi.getNotifications();
  },

  markAsRead: async (id: string): Promise<PortalNotification> => {
    return clientPortalApi.markNotificationRead(id);
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    return clientPortalApi.markAllNotificationsRead();
  },
};
