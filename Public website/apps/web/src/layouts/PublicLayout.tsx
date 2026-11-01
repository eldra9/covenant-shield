import React from 'react';
import { PublicHeader } from '../components/navigation/PublicHeader.tsx';
import { PublicFooter } from '../components/navigation/PublicFooter.tsx';
import { Curtain } from '../motion/Curtain.tsx';
import { CursorFollower } from '../motion/CursorFollower.tsx';

export interface PublicLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentPath,
  onNavigate,
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_rgba(201,160,74,0.12),_transparent_40%),_#F5F1EA] text-[#24332F] relative selection:bg-[#C9A04A] selection:text-[#003C35]">
      {/* WCAG 2.1 AA Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Signature Curtain (Plays once per session, never delays hero) */}
      <Curtain />

      {/* Signature Cursor Follower (Fine pointer, full tier) */}
      <CursorFollower />

      <PublicHeader currentPath={currentPath} onNavigate={onNavigate} />

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>

      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
};
