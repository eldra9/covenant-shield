import React, { useState } from 'react';
import { Lock, Send } from 'lucide-react';
import { addInternalNoteToCase, getCurrentUser } from '@/services/store';

interface InternalNoteEditorProps {
  caseId: string;
  onNoteAdded: () => void;
}

export const InternalNoteEditor: React.FC<InternalNoteEditorProps> = ({
  caseId,
  onNoteAdded,
}) => {
  const [content, setContent] = useState('');
  const currentUser = getCurrentUser();

  if (currentUser.role === 'client') {
    return null; // Clients never access internal notes
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const ok = addInternalNoteToCase(caseId, content.trim());
    if (ok) {
      setContent('');
      onNoteAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          <span>Classified Internal Note (Hidden from Client Portal)</span>
        </span>
      </div>
      <textarea
        rows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add tactical analysis, guard debriefing, or internal recommendation..."
        className="w-full bg-slate-950 border border-slate-800 rounded-md p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-500"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!content.trim()}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 transition-colors inline-flex items-center gap-1.5"
        >
          <Send className="w-3 h-3 text-amber-400" />
          <span>Save Internal Note</span>
        </button>
      </div>
    </form>
  );
};
