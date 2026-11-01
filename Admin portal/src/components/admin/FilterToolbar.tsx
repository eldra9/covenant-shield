import React from 'react';
import { Search, Download, Filter, RotateCcw } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  siteFilter?: string;
  onSiteFilterChange?: (value: string) => void;
  siteOptions?: FilterOption[];
  onExportCsv?: () => void;
  onReset?: () => void;
  children?: React.ReactNode;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  siteFilter,
  onSiteFilterChange,
  siteOptions,
  onExportCsv,
  onReset,
  children,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500/70 transition-colors"
          />
        </div>

        {statusOptions && onStatusFilterChange && (
          <select
            value={statusFilter}
            aria-label="Filter by status"
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-300 focus:outline-hidden focus:border-amber-500/70 transition-colors"
          >
            <option value="all">All Statuses</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {siteOptions && onSiteFilterChange && (
          <select
            value={siteFilter}
            aria-label="Filter by site"
            onChange={(e) => onSiteFilterChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-300 focus:outline-hidden focus:border-amber-500/70 transition-colors"
          >
            <option value="all">All Operational Sites</option>
            {siteOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {onReset && (
          <button
            onClick={onReset}
            title="Reset filters"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
            aria-label="Reset filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
        {children}
        {onExportCsv && (
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>
        )}
      </div>
    </div>
  );
};
