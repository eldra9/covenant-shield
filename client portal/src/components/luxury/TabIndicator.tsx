/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TabIndicator:
 * Foil underline element that slides smoothly between tabs (transform, 320ms, --e-lux).
 */

import React, { useRef, useEffect, useState } from 'react';

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabIndicatorProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const TabIndicator: React.FC<TabIndicatorProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeBtn = containerRef.current.querySelector<HTMLButtonElement>(`[data-tab-id="${activeTab}"]`);
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center gap-1 border-b border-[var(--surface-border)] overflow-x-auto no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            data-tab-id={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative py-3 px-4 text-xs font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer ${
              isActive
                ? 'text-[#003C35] dark:text-[#C9A04A] font-semibold'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-ref ${
                    isActive
                      ? 'bg-[var(--emerald-50)] text-[#003C35] dark:text-[#C9A04A]'
                      : 'bg-gray-100 dark:bg-gray-800 text-[var(--text-sub)]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}

      {/* Sliding foil underline */}
      <div
        className="absolute bottom-0 h-[2.5px] rounded-full pointer-events-none transition-all duration-[320ms] ease-[var(--e-lux)]"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          background: 'var(--foil)',
          boxShadow: '0 0 8px rgba(201, 160, 74, 0.4)',
        }}
      />
    </div>
  );
};
