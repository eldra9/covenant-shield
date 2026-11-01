/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class ClientCaseReplyDto {
  content!: string;
  attachmentIds?: string[];
}

export class CreateClientCaseDto {
  subject!: string;
  category!: 'Incident Inquiry' | 'Guard Conduct' | 'Patrol Schedule' | 'Billing & Invoice' | 'Equipment & Access' | 'General Feedback';
  priority!: 'Low' | 'Medium' | 'High' | 'Critical';
  siteId?: string;
  description!: string;
}

export class ReopenCaseDto {
  reason!: string;
}
