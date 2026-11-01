/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClientDashboardMetricsDto {
  clientName: string;
  contractTier: string;
  activeSitesCount: number;
  openRequestsCount: number;
  requestsAwaitingActionCount: number;
  openCasesCount: number;
  unreadNotificationsCount: number;
  generatedAtEAT: string;
}

export interface ClientDashboardSummaryDto {
  metrics: ClientDashboardMetricsDto;
  recentRequests: Array<{
    id: string;
    reference: string;
    siteName: string;
    serviceType: string;
    status: string;
    requiresClientAction: boolean;
    createdAtEAT: string;
  }>;
  openCases: Array<{
    id: string;
    reference: string;
    subject: string;
    category: string;
    status: string;
    updatedAtEAT: string;
    messageCount: number;
  }>;
  recentNotifications: Array<{
    id: string;
    title: string;
    message: string;
    category: string;
    read: boolean;
    createdAtEAT: string;
  }>;
}
