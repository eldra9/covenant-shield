import { casesService } from './cases.service.ts';

export class CasesController {
  public async handleCreate(body: unknown) {
    return await casesService.createCase(body);
  }

  public async handleTrack(body: unknown) {
    return await casesService.trackCase(body);
  }

  public async handleContact(body: unknown) {
    return await casesService.handleContactMessage(body);
  }

  public getSample() {
    return casesService.getSampleCase();
  }
}

export const casesController = new CasesController();
