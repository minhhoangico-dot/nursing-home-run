import React from 'react';
import { CalendarDays, CopyPlus, FileText, PauseCircle, PlayCircle, Printer, SquarePen, User2 } from 'lucide-react';

import { type Prescription } from '@/src/types/medical';

interface PrescriptionCardProps {
  prescription: Prescription;
  onEdit?: () => void;
  onDuplicate: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onPrint: () => void;
}

function statusLabel(status: Prescription['status']): string {
  if (status === 'Completed') return 'Đã kết thúc';
  if (status === 'Paused') return 'Tạm ngưng';
  return 'Đang dùng';
}

function statusClassName(status: Prescription['status']): string {
  if (status === 'Completed') {
    return 'bg-slate-100 text-slate-700';
  }

  if (status === 'Paused') {
    return 'bg-amber-100 text-amber-700';
  }

  return 'bg-emerald-100 text-emerald-700';
}

export const PrescriptionCard = ({
  prescription,
  onEdit,
  onDuplicate,
  onPause,
  onComplete,
  onPrint,
}: PrescriptionCardProps) => {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-950">{prescription.code}</h3>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClassName(
                prescription.status,
              )}`}
            >
              {statusLabel(prescription.status)}
            </span>
          </div>

          <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
            <div className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {prescription.prescriptionDate}
            </div>
            <div className="inline-flex items-center gap-2">
              <User2 className="h-4 w-4" />
              {prescription.doctorName || 'Chưa rõ bác sĩ'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <div className="font-medium text-slate-900">Chẩn đoán</div>
            <div>{prescription.diagnosis || 'Chưa ghi nhận'}</div>
            {prescription.notes && (
              <div className="mt-2 text-slate-500">Ghi chú: {prescription.notes}</div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            >
              <SquarePen className="h-4 w-4" />
              Sửa
            </button>
          )}
          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
          >
            <CopyPlus className="h-4 w-4" />
            Nhân bản
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 rounded-xl border border-teal-200 px-3 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
          >
            <Printer className="h-4 w-4" />
            In đơn
          </button>
          {onPause && (
            <button
              type="button"
              onClick={onPause}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
            >
              <PauseCircle className="h-4 w-4" />
              Tạm ngưng
            </button>
          )}
          {onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              <PlayCircle className="h-4 w-4" />
              Kết thúc
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          <div className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            {prescription.items.length} dòng thuốc
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {prescription.items.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 px-4 py-3 text-sm text-slate-600 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_120px]"
            >
              <div>
                <div className="font-medium text-slate-900">{item.medicineName}</div>
                {item.specialInstructions && (
                  <div className="mt-1 text-xs text-slate-500">
                    {item.specialInstructions}
                  </div>
                )}
              </div>
              <div>
                <div>{item.dosage || '-'}</div>
                <div className="text-xs text-slate-500">
                  {item.frequency || item.timesOfDay.join(', ') || 'Chưa ghi tần suất'}
                </div>
              </div>
              <div className="text-sm font-medium text-slate-700">
                SL: {item.quantityDispensed ?? item.quantity ?? '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};
