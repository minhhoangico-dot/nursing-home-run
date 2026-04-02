import React from 'react';
import { AlertTriangle, Clock3, Repeat2 } from 'lucide-react';

import { Table } from '@/src/components/ui';
import { type ActiveMedicationSummaryRow } from '@/src/features/prescriptions/utils/activeMedicationSummary';

interface ActiveMedicationSummaryTableProps {
  rows: ActiveMedicationSummaryRow[];
}

function renderTimeCell(value: string) {
  return value ? (
    <span className="inline-flex rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">
      {value}
    </span>
  ) : (
    <span className="text-slate-300">-</span>
  );
}

function formatDate(value?: string): string {
  if (!value) return '';
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('vi-VN');
}

export const ActiveMedicationSummaryTable = ({
  rows,
}: ActiveMedicationSummaryTableProps) => {
  return (
    <Table
      data={rows}
      mobileCardView={true}
      columns={[
        {
          header: 'Tên thuốc',
          accessor: (row) => (
            <div className="space-y-1">
              <div className="font-semibold text-slate-900">{row.medicineName}</div>
              {row.note && (
                <div className="text-xs text-slate-500">{row.note}</div>
              )}
            </div>
          ),
          mobilePrimary: true,
        },
        {
          header: 'Liều dùng',
          accessor: (row) => row.dosage || row.frequency || '-',
          mobileLabel: 'Liều',
        },
        {
          header: 'Sáng',
          accessor: (row) => renderTimeCell(row.morning),
          align: 'center',
          mobileHidden: true,
        },
        {
          header: 'Trưa',
          accessor: (row) => renderTimeCell(row.noon),
          align: 'center',
          mobileHidden: true,
        },
        {
          header: 'Chiều',
          accessor: (row) => renderTimeCell(row.afternoon),
          align: 'center',
          mobileHidden: true,
        },
        {
          header: 'Tối',
          accessor: (row) => renderTimeCell(row.night),
          align: 'center',
          mobileHidden: true,
        },
        {
          header: 'Nguồn đơn',
          accessor: (row) => (
            <div className="text-sm font-medium text-teal-700">
              {row.sourcePrescriptionCode}
            </div>
          ),
          mobileLabel: 'Nguồn đơn',
        },
        {
          header: 'Kết thúc',
          accessor: (row) => (
            <div className="space-y-1">
              {row.isContinuous ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-700">
                  <Repeat2 className="h-3.5 w-3.5" />
                  Liên tục
                </span>
              ) : (
                <div className="inline-flex items-center gap-1 text-sm text-slate-600">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatDate(row.sourcePrescriptionEndDate) || '-'}
                </div>
              )}
              {row.isNearingEndDate && (
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Sắp hết
                </div>
              )}
            </div>
          ),
          mobileLabel: 'Kết thúc',
        },
      ]}
    />
  );
};
