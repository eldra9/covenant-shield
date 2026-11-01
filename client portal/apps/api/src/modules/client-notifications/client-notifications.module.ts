/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class ClientNotificationsService {
  async getNotificationsForClient(clientId: string) {
    return [];
  }

  async markAsRead(notificationId: string, clientId: string) {
    return { success: true };
  }
}

export class ClientNotificationsController {
  constructor(private readonly service: ClientNotificationsService) {}
}

export class ClientNotificationsModule {
  static register() {
    const service = new ClientNotificationsService();
    const controller = new ClientNotificationsController(service);
    return { service, controller };
  }
}
