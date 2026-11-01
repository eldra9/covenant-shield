import { apiClient } from '../../../lib/apiClient.ts';
import {
  CaseInput,
  PublicTrackCaseResponse,
  ContactMessageInput,
} from '../../../../../../packages/shared/src/types/index.ts';

export interface CreateCaseResult {
  referenceNumber: string;
  verificationCode: string;
  status: string;
  category: string;
  createdAt: string;
  instructions: string;
}

export async function submitCase(data: CaseInput): Promise<CreateCaseResult> {
  return await apiClient<CreateCaseResult>('/api/v1/cases', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function trackCase(
  referenceNumber: string,
  credentials: string | { phone?: string; verificationCode?: string }
): Promise<PublicTrackCaseResponse> {
  const bodyPayload: { referenceNumber: string; phone?: string; verificationCode?: string } = {
    referenceNumber,
  };

  if (typeof credentials === 'string') {
    if (/^\d{6}$/.test(credentials.trim())) {
      bodyPayload.verificationCode = credentials.trim();
    } else {
      bodyPayload.phone = credentials.trim();
    }
  } else {
    if (credentials.phone) bodyPayload.phone = credentials.phone.trim();
    if (credentials.verificationCode) bodyPayload.verificationCode = credentials.verificationCode.trim();
  }

  return await apiClient<PublicTrackCaseResponse>('/api/v1/cases/track', {
    method: 'POST',
    body: JSON.stringify(bodyPayload),
  });
}

export async function submitContactMessage(data: ContactMessageInput): Promise<{
  success: boolean;
  ticketId: string;
  message: string;
}> {
  return await apiClient<{ success: boolean; ticketId: string; message: string }>('/api/v1/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
