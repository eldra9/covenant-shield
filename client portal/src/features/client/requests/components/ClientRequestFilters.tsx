/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search } from 'lucide-react';
import { RequestStatus } from '@/src/types/clientPortal';

interface ClientRequestFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'All Requests', value: 'All' },
  { label: 'Quotation Issued', value: 'Quotation Issued' },
  { label: 'Active Escorts/Guard', value: 'Active' },
  { label: 'Under Assessment', value: 'Under Assessment' },
  { label: 'Mobilizing', value: 'Mobilizing' },
  { label: 'Completed', value: 'Completed' },
];

export const ClientRequestFilters: React.FC<ClientRequestFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by reference, service type, or site..."
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003C35] focus:bg-white text-stone-900"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === opt.value
                ? 'bg-[#003C35] text-white font-semibold shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
