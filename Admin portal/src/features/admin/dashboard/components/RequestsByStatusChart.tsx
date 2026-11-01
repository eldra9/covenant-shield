import React, { useState } from 'react';
import { ServiceRequest } from '@/types';
import { Eye, Table as TableIcon } from 'lucide-react';

interface RequestsByStatusChartProps {
  requests: ServiceRequest[];
}

export const RequestsByStatusChart: React.FC<RequestsByStatusChartProps> = ({ requests }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const statusConfigs = [
    { key: 'new', label: 'New Inbound', color: '#1D4E89' },
    { key: 'under_review', label: 'Under Review', color: '#8A5A00' },
    { key: 'site_assessment_scheduled', label: 'Survey Scheduled', color: '#C9A04A' },
    { key: 'quotation_sent', label: 'Quotation Sent', color: '#A47F2E' },
    { key: 'accepted', label: 'Accepted', color: '#1E6B45' },
    { key: 'contract_active', label: 'Contract Active', color: '#0B5247' },
    { key: 'rejected', label: 'Rejected', color: '#A12B2B' },
  ];

  const total = requests.length;
  const statusCounts = statusConfigs.map((cfg) => {
    const count = requests.filter((r) => r.status === cfg.key).length;
    const percent = total > 0 ? (count / total) * 100 : 0;
    return { ...cfg, count, percent };
  });

  return (
    <div className="p-5 bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl emboss-card space-y-4">
      <div className="flex items-center justify-between border-b border-[#003C35] pb-3">
        <div>
          <h3 className="text-sm font-bold text-[#F4F6F4] font-sans">
            Requests by Pipeline Status
          </h3>
          <p className="text-xs text-[#A0B2AC]">
            Distribution of service requests across the engagement lifecycle ({total} total).
          </p>
        </div>
        <button
          onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
          className="px-2.5 py-1 text-xs font-mono text-[#C9A04A] bg-[#071F1C] border border-[#003C35] rounded hover:border-[#C9A04A]/40 transition-colors flex items-center gap-1.5"
          aria-label="Toggle chart or table fallback"
        >
          {viewMode === 'chart' ? <TableIcon className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{viewMode === 'chart' ? 'Table View' : 'Bar Chart'}</span>
        </button>
      </div>

      {viewMode === 'chart' ? (
        <div className="space-y-3 pt-1">
          {statusCounts.map((s, idx) => (
            <div key={s.key} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#F4F6F4]">{s.label}</span>
                <span className="text-[#A0B2AC]">
                  {s.count} ({s.percent.toFixed(0)}%)
                </span>
              </div>
              <div className="h-3 bg-[#071F1C] rounded-full overflow-hidden flex border border-[#123D37]">
                <div
                  className="h-full rounded-full transition-all ease-[var(--e-silk)]"
                  style={{
                    width: `${s.percent}%`,
                    backgroundColor: s.color,
                    transitionDuration: '700ms',
                    transitionDelay: `${idx * 40}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Fallback */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono" aria-label="Requests by status table">
            <thead className="border-b border-[#003C35] text-[#A0B2AC]">
              <tr>
                <th className="py-2 px-3">Pipeline Stage</th>
                <th className="py-2 px-3">Total Requests</th>
                <th className="py-2 px-3">Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#003C35]">
              {statusCounts.map((s) => (
                <tr key={s.key} className="hover:bg-[#092824]">
                  <td className="py-2 px-3 text-[#F4F6F4] font-sans flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: s.color }}
                    />
                    <span>{s.label}</span>
                  </td>
                  <td className="py-2 px-3 text-[#E6CB8A] font-semibold">{s.count}</td>
                  <td className="py-2 px-3 text-[#A0B2AC]">{s.percent.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
