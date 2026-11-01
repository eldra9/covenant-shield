/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientPortalService } from './client-portal.service';
import { ClientPortalController } from './client-portal.controller';

export class ClientPortalModule {
  static register() {
    const service = new ClientPortalService();
    const controller = new ClientPortalController(service);
    return { service, controller };
  }
}
