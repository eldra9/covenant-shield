/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class ClientRequestQueryDto {
  search?: string;
  status?: string;
  siteId?: string;
  startDate?: string;
  endDate?: string;
  page?: number = 1;
  limit?: number = 20;
}

export class CreateClientRequestDto {
  siteId!: string;
  serviceType!: string;
  priority!: 'Standard' | 'Urgent' | 'Emergency Priority';
  requestedStartDate!: string;
  description!: string;
}

export class RequestCancellationDto {
  reason!: string;
}
