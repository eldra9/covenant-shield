import { PublicTrackRequestResponse } from '../../../../../../packages/shared/src/types/index.ts';

export interface TrackServiceRequestDto {
  referenceNumber: string;
  verificationCode: string;
}

export type TrackServiceRequestResponseDto = PublicTrackRequestResponse;
