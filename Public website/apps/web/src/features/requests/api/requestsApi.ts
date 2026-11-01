import { apiClient } from '../../../lib/apiClient.ts';
import {
  ServiceRequestInput,
  PublicTrackRequestResponse,
} from '../../../../../../packages/shared/src/types/index.ts';

export interface CreateServiceRequestResult {
  referenceNumber: string;
  verificationCode: string;
  status: string;
  createdAt: string;
  requiresManualReview?: boolean;
  instructions: string;
}

export async function submitServiceRequest(
  data: ServiceRequestInput
): Promise<CreateServiceRequestResult> {
  return await apiClient<CreateServiceRequestResult>('/api/v1/service-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function trackServiceRequest(
  referenceNumber: string,
  credentials: string | { phone?: string; verificationCode?: string }
): Promise<PublicTrackRequestResponse> {
  const bodyPayload: { referenceNumber: string; phone?: string; verificationCode?: string } = {
    referenceNumber,
  };

  if (typeof credentials === 'string') {
    // Check if looks like a 6-digit code or phone
    if (/^\d{6}$/.test(credentials.trim())) {
      bodyPayload.verificationCode = credentials.trim();
    } else {
      bodyPayload.phone = credentials.trim();
    }
  } else {
    if (credentials.phone) bodyPayload.phone = credentials.phone.trim();
    if (credentials.verificationCode) bodyPayload.verificationCode = credentials.verificationCode.trim();
  }

  return await apiClient<PublicTrackRequestResponse>('/api/v1/service-requests/track', {
    method: 'POST',
    body: JSON.stringify(bodyPayload),
  });
}
