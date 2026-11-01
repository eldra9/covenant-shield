import { ServiceRequestInput } from '../../../../../../packages/shared/src/types/index.ts';

export type CreateServiceRequestDto = ServiceRequestInput;

export interface CreateServiceRequestResponseDto {
  referenceNumber: string;
  verificationCode: string;
  status: string;
  createdAt: string;
  requiresManualReview: boolean;
  instructions: string;
}
