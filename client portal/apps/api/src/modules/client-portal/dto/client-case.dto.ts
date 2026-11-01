/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClientCaseAttachmentDto {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  downloadUrl: string;
}

export interface ClientCaseMessageDto {
  id: string;
  senderType: 'client' | 'operations';
  senderName: string;
  senderRole?: string;
  timestampEAT: string;
  content: string;
  attachments?: ClientCaseAttachmentDto[];
}

export interface ClientCaseDetailDto {
  id: string;
  reference: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAtEAT: string;
  updatedAtEAT: string;
  messages: ClientCaseMessageDto[];
  timeline: Array<{
    id: string;
    timestampEAT: string;
    title: string;
    note: string;
  }>;
}
