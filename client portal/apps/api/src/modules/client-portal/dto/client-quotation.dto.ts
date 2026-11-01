/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ReleasedQuotationLineItemDto {
  description: string;
  quantity: number;
  unit: string;
  rateKes: number;
  amountKes: number;
}

export interface ReleasedQuotationDto {
  quoteNumber: string;
  amountKes: number;
  status: 'Pending Review' | 'Accepted' | 'Declined';
  issuedAtEAT: string;
  validUntilEAT: string;
  lineItems: ReleasedQuotationLineItemDto[];
  notes?: string;
  isReleasedToClient: boolean;
  version: number;
}

export interface QuotationApprovalDto {
  quoteNumber: string;
  approvalAuthorizedBy: string;
  approvalTimestamp: string;
}
