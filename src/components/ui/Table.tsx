import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: React.ReactNode;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string; // Additional classes for the cell (th/td)
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => React.ReactNode; // Custom render function

  // Mobile display options
  mobileHidden?: boolean;  // Hide on mobile card view
  mobileLabel?: React.ReactNode;    // Label for card view (defaults to header)
  mobilePrimary?: boolean; // Show as card title/primary info
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  className?: string;
  mobileCardView?: boolean;  // Render as cards on mobile (default: true)
}

const getRowKey = <T extends object>(item: T, fallback: number) => {
  if ('id' in item && (typeof item.id === 'string' || typeof item.id === 'number')) {
    return item.id;
  }

  return fallback;
};

export const Table = <T extends object>({
  data,
  columns,
  onRowClick,
  className = '',
  mobileCardView = true
}: TableProps<T>) => {
  const getValue = (item: T, col: Column<T>) => {
    if (col.render) {
      return col.render(item);
    }
    return typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode);
  };

  const primaryCol = columns.find(c => c.mobilePrimary);
  const secondaryColumns = columns.filter(c => !c.mobileHidden && !c.mobilePrimary);

  return (
    <>
      {/* Desktop table view */}
      <div className={`overflow-x-auto ${mobileCardView ? 'hidden md:block' : ''} ${className}`}>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 lg:px-6 py-3 ${col.className || ''} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length > 0 ? (
              data.map((item, rowIdx) => (
                <tr
                  key={getRowKey(item, rowIdx)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`hover:bg-slate-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-4 lg:px-6 py-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    >
                      {getValue(item, col)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-400 italic">Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      {mobileCardView && (
        <div className="md:hidden space-y-3">
          {data.length > 0 ? (
            data.map((item, idx) => (
              <div
                key={getRowKey(item, idx)}
                onClick={() => onRowClick?.(item)}
                className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm ${onRowClick ? 'cursor-pointer active:bg-slate-50' : ''}`}
              >
                {/* Primary info (card title) */}
                {primaryCol && (
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <div className="font-bold text-slate-800">
                      {getValue(item, primaryCol)}
                    </div>
                    {onRowClick && <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                )}

                {/* Secondary info */}
                <div className="space-y-2">
                  {secondaryColumns.slice(0, 4).map((col, colIdx) => (
                    <div key={colIdx} className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">{col.mobileLabel || col.header}</span>
                      <span className="font-medium text-slate-700 text-right">
                        {getValue(item, col)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500 italic">
              Không có dữ liệu
            </div>
          )}
        </div>
      )}
    </>
  );
};
