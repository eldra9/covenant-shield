/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clientPortalApi } from '@/src/api/clientPortalApi';
import { ClientOrganization, ClientUser } from '@/src/types/clientPortal';

export const clientProfileApi = {
  getProfile: async (): Promise<{ client: ClientOrganization; user: ClientUser }> => {
    return clientPortalApi.getProfile();
  },

  updatePersonalContact: async (updates: Partial<Pick<ClientUser, 'fullName' | 'jobTitle' | 'directPhone' | 'alertPhone' | 'preferredChannel'>> & { email?: string }): Promise<ClientUser> => {
    return clientPortalApi.updatePersonalContact(updates);
  },

  submitCompanyChangeRequest: async (reason: string, requestedChanges: string) => {
    return clientPortalApi.submitCompanyChangeRequest(reason, requestedChanges);
  },
};
