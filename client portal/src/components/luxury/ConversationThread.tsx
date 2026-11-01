/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ConversationThread:
 * Message thread for concierge inquiries & cases:
 * - Messages slide in (12px, 240ms)
 * - Staff replies carry an "Official response" badge with a small Guilloche seal
 * - Sending shows subtle delivered tick
 * - Authorized attachments list with download preview
 */

import React from 'react';
import { GuillocheSeal } from './GuillocheSeal';
import { CaseMessage } from '@/src/types/clientPortal';
import { formatEAT } from '@/src/api/clientPortalApi';
import { Check, CheckCheck, Paperclip, Download } from 'lucide-react';

interface ConversationThreadProps {
  messages: CaseMessage[];
  className?: string;
}

export const ConversationThread: React.FC<ConversationThreadProps> = ({
  messages,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {messages.map((msg, index) => {
        const isClient = msg.senderType === 'client';

        return (
          <div
            key={msg.id || index}
            className={`flex flex-col ${isClient ? 'items-end' : 'items-start'} transition-all`}
            style={{
              animation: `messageSlideIn 240ms var(--e-silk) ${index * 60}ms both`,
            }}
          >
            {/* Header info */}
            <div className="flex items-center gap-2 mb-1 text-[11px] font-mono-ref text-[var(--text-sub)]">
              <span className="font-semibold text-[var(--text-main)]">
                {msg.senderName}
              </span>
              <span>•</span>
              <span>{msg.senderRole}</span>
              <span>•</span>
              <span>{formatEAT(msg.timestamp)}</span>
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm relative ${
                isClient
                  ? 'bg-[var(--emerald-50)] dark:bg-[#0D322D] border border-[#003C35]/15 text-[var(--text-main)] rounded-tr-sm'
                  : 'bg-[var(--surface-card)] border border-[var(--surface-border)] text-[var(--text-main)] rounded-tl-sm'
              }`}
            >
              {/* Staff Official Response Badge */}
              {!isClient && (
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-[var(--surface-border)]/60 text-[10px] font-mono-ref tracking-wider text-[#A47F2E]">
                  <GuillocheSeal size={18} theme="gold" showCenterEmblem={false} />
                  <span className="font-semibold uppercase">Official Covenant Response</span>
                </div>
              )}

              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Attachments if any */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[var(--surface-border)]/60 space-y-1.5">
                  <span className="flex items-center gap-1 text-[10px] font-mono-ref uppercase text-[var(--text-sub)]">
                    <Paperclip className="w-3 h-3 text-[#A47F2E]" />
                    Verified Documents ({msg.attachments.length})
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.downloadUrl}
                        download={att.fileName}
                        onClick={(e) => {
                          e.preventDefault();
                          // Safe mock download alert/toast
                          const dummy = document.createElement('a');
                          dummy.href = `data:text/plain;charset=utf-8,Covenant Shield Verified Document: ${att.fileName}`;
                          dummy.download = att.fileName;
                          dummy.click();
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--surface-card)] hover:bg-[var(--emerald-50)] border border-[var(--surface-border)] text-[11px] font-mono-ref text-[#0B5247] dark:text-[#C9A04A] transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span className="truncate max-w-[160px]">{att.fileName}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivered Tick for Client Messages */}
              {isClient && (
                <div className="flex items-center justify-end gap-1 mt-2 text-[10px] font-mono-ref text-[var(--text-sub)]">
                  <span>Delivered</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#1E6B45]" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
