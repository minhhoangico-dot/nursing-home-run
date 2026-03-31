import React from 'react';
import { Pill, Printer } from 'lucide-react';
import type { ActiveMedicationRow } from '../../../types';

const TIME_GROUPS: Array<{ key: ActiveMedicationRow['timeOfDay']; label: string }> = [
  { key: 'morning', label: 'Buoi sang' },
  { key: 'noon', label: 'Buoi trua' },
  { key: 'afternoon', label: 'Buoi chieu' },
  { key: 'evening', label: 'Buoi toi' },
];

interface ActiveMedicationSummaryProps {
  rows: ActiveMedicationRow[];
  onPrint?: () => void;
  onOpenDrugMaster?: () => void;
  onCreatePrescription?: () => void;
  canCreate?: boolean;
}

export function ActiveMedicationSummary({
  rows,
  onPrint,
  onOpenDrugMaster,
  onCreatePrescription,
  canCreate = false,
}: ActiveMedicationSummaryProps) {
  const groupedRows = TIME_GROUPS.map((group) => ({
    ...group,
    rows: rows.filter((row) => row.timeOfDay === group.key),
  })).filter((group) => group.rows.length > 0);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-teal-100 bg-teal-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-teal-800">
              <Pill className="h-5 w-5" /> Thuoc dang dung
              <span className="rounded-full bg-teal-200 px-2 py-0.5 text-xs font-bold text-teal-800">{rows.length}</span>
            </h3>
            <p className="mt-0.5 hidden text-sm text-teal-600 sm:block">Danh sach thuoc can dung hang ngay</p>
          </div>
          <div className="flex w-full gap-2 overflow-x-auto sm:w-auto">
            {onOpenDrugMaster && (
              <button
                type="button"
                onClick={onOpenDrugMaster}
                className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
              >
                Danh muc
              </button>
            )}
            {onPrint && (
              <button
                type="button"
                aria-label="In tong hop thuoc dang dung"
                onClick={onPrint}
                className="shrink-0 whitespace-nowrap rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm font-medium text-teal-700 shadow-sm transition-all hover:bg-teal-50"
              >
                <span className="inline-flex items-center gap-2">
                  <Printer className="h-4 w-4" /> In tong hop thuoc dang dung
                </span>
              </button>
            )}
            {canCreate && onCreatePrescription && (
              <button
                type="button"
                onClick={onCreatePrescription}
                className="shrink-0 whitespace-nowrap rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-teal-700"
              >
                Ke don
              </button>
            )}
          </div>
        </div>
      </div>

      {groupedRows.length === 0 ? (
        <div className="p-8 text-center text-slate-400">Hien tai khong co thuoc nao dang dung</div>
      ) : (
        <div className="space-y-4 p-4">
          {groupedRows.map((group) => (
            <section key={group.key} aria-label={group.label} className="rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                {group.label}
              </div>
              <div className="divide-y divide-slate-100">
                {group.rows.map((row, index) => (
                  <div key={`${row.prescriptionId}-${row.sourcePrescriptionCode}-${row.medicineName}-${index}`} className="grid gap-2 px-4 py-3 sm:grid-cols-[1.5fr,1fr,auto] sm:items-center">
                    <div>
                      <div className="font-semibold text-slate-800">{row.medicineName}</div>
                      {row.instructions && <div className="text-sm italic text-slate-500">{row.instructions}</div>}
                    </div>
                    <div className="text-sm text-slate-600">{row.dosage}</div>
                    <div className="flex items-center gap-2 justify-self-start sm:justify-self-end">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {row.sourcePrescriptionCode}
                      </span>
                      {row.status.nearEnd && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Sap het
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
