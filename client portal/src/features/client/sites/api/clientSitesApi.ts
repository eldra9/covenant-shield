/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clientPortalApi } from '@/src/api/clientPortalApi';
import { Site } from '@/src/types/clientPortal';

export const clientSitesApi = {
  getSites: async (): Promise<Site[]> => {
    return clientPortalApi.getSites();
  },

  getSiteById: async (id: string): Promise<Site> => {
    return clientPortalApi.getSiteById(id);
  },
};
