import { serviceRequestsService } from './service-requests.service.ts';

export class ServiceRequestsController {
  public async handleCreate(body: unknown) {
    return await serviceRequestsService.create(body);
  }

  public async handleTrack(body: unknown) {
    return await serviceRequestsService.track(body);
  }

  public getSample() {
    return serviceRequestsService.getSampleReference();
  }
}

export const serviceRequestsController = new ServiceRequestsController();
