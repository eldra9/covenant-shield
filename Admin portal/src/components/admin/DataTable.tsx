import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyState?: {
    title: string;
    description: string;
    action?: React.ReactNode;
  };
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
  emptyState,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 bg-slate-800/60 rounded animate-pulse w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-lg py-12 px-4 text-center">
        <div className="max-w-md mx-auto space-y-2">
          <h4 className="text-sm font-semibold text-slate-200">
            {emptyState?.title || 'No records found'}
          </h4>
          <p className="text-xs text-slate-400">
            {emptyState?.description || 'There are no active records matching your current filter criteria.'}
          </p>
          {emptyState?.action && <div className="pt-2">{emptyState.action}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-medium">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3 px-4 uppercase tracking-wider font-semibold text-[11px] ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-slate-800/40 active:bg-slate-800/70'
                    : 'hover:bg-slate-800/20'
                }`}
              >
                {columns.map((col, idx) => {
                  let content: React.ReactNode = null;
                  if (col.render) {
                    content = col.render(row);
                  } else if (col.accessor) {
                    content = String(row[col.accessor] ?? '—');
                  }
                  return (
                    <td
                      key={idx}
                      className={`py-3 px-4 whitespace-nowrap ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
