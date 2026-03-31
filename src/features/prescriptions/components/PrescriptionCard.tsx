import React from 'react';
import {
  AlertCircle,
  Calendar,
  CircleCheckBig,
  Clock,
  Copy,
  Edit2,
  History,
  PauseCircle,
  Printer,
  User as UserIcon,
} from 'lucide-react';
import type { Prescription } from '../../../types';
import { getMedicationLineStatus } from '../utils/prescriptionDerivations';

interface PrescriptionCardProps {
  prescription: Prescription;
  canManage?: boolean;
  onAdjust: (prescription: Prescription) => void;
  onDuplicate: (prescription: Prescription) => void;
  onPause: (prescriptionId: string) => void;
  onComplete: (prescriptionId: string) => void;
  onPrint: (prescription: Prescription) => void;
  onViewHistory: (prescription: Prescription) => void;
}

export function PrescriptionCard({
  prescription,
  canManage = true,
  onAdjust,
  onDuplicate,
  onPause,
  onComplete,
  onPrint,
  onViewHistory,
}: PrescriptionCardProps) {
  const hasNearEnd = prescription.items.some((item) => getMedicationLineStatus(item).nearEnd);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-800">{prescription.code}</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Dang dung
            </span>
            {hasNearEnd && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Sap het trong 2 ngay
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {prescription.prescriptionDate}
            </span>
            <span className="inline-flex items-center gap-1">
              <UserIcon className="h-3 w-3" /> BS. {prescription.doctorName || 'Unknown'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> Bat dau: {prescription.startDate}
            </span>
          </div>

          <div className="text-sm text-slate-700">
            <span className="font-medium">Chan doan:</span> {prescription.diagnosis}
          </div>

          {prescription.notes && (
            <div className="inline-flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-slate-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>{prescription.notes}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:min-w-[220px] sm:items-end">
          {canManage && (
            <>
              <button
                type="button"
                aria-label="Dieu chinh"
                onClick={() => onAdjust(prescription)}
                className="w-full whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  <Edit2 className="h-4 w-4" /> Dieu chinh
                </span>
              </button>
              <button
                type="button"
                aria-label="Nhan ban"
                onClick={() => onDuplicate(prescription)}
                className="w-full whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  <Copy className="h-4 w-4" /> Nhan ban
                </span>
              </button>
              <button
                type="button"
                aria-label="Tam ngung"
                onClick={() => onPause(prescription.id)}
                className="w-full whitespace-nowrap rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-700 shadow-sm transition-all hover:bg-amber-50 sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  <PauseCircle className="h-4 w-4" /> Tam ngung
                </span>
              </button>
              <button
                type="button"
                aria-label="Ket thuc"
                onClick={() => onComplete(prescription.id)}
                className="w-full whitespace-nowrap rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  <CircleCheckBig className="h-4 w-4" /> Ket thuc
                </span>
              </button>
              <button
                type="button"
                aria-label="Lich su dieu chinh"
                onClick={() => onViewHistory(prescription)}
                className="w-full whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  <History className="h-4 w-4" /> Lich su dieu chinh
                </span>
              </button>
            </>
          )}

          <button
            type="button"
            aria-label="In don thuoc"
            onClick={() => onPrint(prescription)}
            className="w-full whitespace-nowrap rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm font-medium text-teal-700 shadow-sm transition-all hover:bg-teal-50 sm:w-auto"
          >
            <span className="inline-flex items-center gap-2">
              <Printer className="h-4 w-4" /> In don thuoc
            </span>
          </button>

          <div className="text-xs text-slate-500">{prescription.items.length} loai thuoc</div>
        </div>
      </div>
    </div>
  );
}
