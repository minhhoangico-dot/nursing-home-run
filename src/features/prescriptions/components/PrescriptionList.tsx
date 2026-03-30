import React, { useEffect, useMemo, useState } from 'react';
import { History, Pill, Plus, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ActiveMedicationSummaryTable } from './ActiveMedicationSummaryTable';
import { MedicineManager } from './MedicineManager';
import { PrescriptionCard } from './PrescriptionCard';
import { printDailyMedicationSheet, printPrescription } from '../utils/printTemplates';
import { usePrescriptionsStore } from '@/src/stores/prescriptionStore';
import { type Resident, type User } from '@/src/types';

export const PrescriptionList = ({
  user,
  resident,
}: {
  user: User;
  resident: Resident;
  onUpdate: (resident: Resident) => void;
}) => {
  const navigate = useNavigate();
  const [showMedicineManager, setShowMedicineManager] = useState(false);
  const {
    prescriptions,
    fetchPrescriptions,
    fetchMedicines,
    getResidentActiveMedicationRows,
    pausePrescription,
    completePrescription,
    isLoading,
  } = usePrescriptionsStore();

  useEffect(() => {
    void fetchPrescriptions(resident.id);
    void fetchMedicines();
  }, [fetchMedicines, fetchPrescriptions, resident.id]);

  const residentPrescriptions = useMemo(
    () => prescriptions.filter((prescription) => prescription.residentId === resident.id),
    [prescriptions, resident.id],
  );
  const activePrescriptions = useMemo(
    () => residentPrescriptions.filter((prescription) => prescription.status === 'Active'),
    [residentPrescriptions],
  );
  const historyPrescriptions = useMemo(
    () =>
      residentPrescriptions
        .filter((prescription) => prescription.status !== 'Active')
        .sort(
          (left, right) =>
            new Date(right.prescriptionDate).getTime() -
            new Date(left.prescriptionDate).getTime(),
        ),
    [residentPrescriptions],
  );
  const activeMedicationRows = getResidentActiveMedicationRows(resident.id);
  const activePrintItems = activePrescriptions.flatMap((prescription) =>
    prescription.items.map((item) => ({
      ...item,
      prescriptionCode: prescription.code,
      startDate: item.startDate ?? prescription.startDate,
      sourcePrescriptionId: prescription.id,
      sourcePrescriptionCode: prescription.code,
      sourcePrescriptionStartDate: prescription.startDate,
      sourcePrescriptionEndDate: prescription.endDate,
      sourcePrescriptionStatus: prescription.status,
    })),
  );

  if (isLoading && residentPrescriptions.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Đang tải dữ liệu thuốc...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showMedicineManager && (
        <MedicineManager onClose={() => setShowMedicineManager(false)} />
      )}

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-600">
              Medication Workspace
            </p>
            <h2 className="text-2xl font-semibold text-slate-950">Thuốc đang dùng</h2>
            <p className="text-sm text-slate-500">
              Bảng tổng hợp tác nghiệp cho bác sĩ và điều dưỡng.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/residents/${resident.id}/medications/new`)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Kê đơn mới
            </button>
            <button
              type="button"
              onClick={() => printDailyMedicationSheet(resident, activePrintItems)}
              className="inline-flex items-center gap-2 rounded-2xl border border-teal-200 px-4 py-2.5 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
            >
              <Printer className="h-4 w-4" />
              In tổng hợp thuốc đang dùng
            </button>
            <button
              type="button"
              onClick={() => setShowMedicineManager(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            >
              <Pill className="h-4 w-4" />
              Danh mục thuốc
            </button>
          </div>
        </div>

        <div className="mt-6">
          {activeMedicationRows.length > 0 ? (
            <ActiveMedicationSummaryTable rows={activeMedicationRows} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Hiện tại không có thuốc nào đang active.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Đơn thuốc đang dùng</h2>
            <p className="text-sm text-slate-500">
              Giữ riêng từng đơn để tránh gộp nhầm nguồn thuốc.
            </p>
          </div>
        </div>

        {activePrescriptions.length > 0 ? (
          <div className="space-y-4">
            {activePrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                onEdit={() =>
                  navigate(
                    `/residents/${resident.id}/medications/${prescription.id}/edit`,
                  )
                }
                onDuplicate={() =>
                  navigate(
                    `/residents/${resident.id}/medications/${prescription.id}/duplicate`,
                  )
                }
                onPause={() => void pausePrescription(prescription.id)}
                onComplete={() => void completePrescription(prescription.id)}
                onPrint={() => printPrescription(prescription, resident)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Chưa có đơn thuốc active.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-950">Lịch sử đơn thuốc</h2>
        </div>

        {historyPrescriptions.length > 0 ? (
          <div className="space-y-4">
            {historyPrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                onDuplicate={() =>
                  navigate(
                    `/residents/${resident.id}/medications/${prescription.id}/duplicate`,
                  )
                }
                onPrint={() => printPrescription(prescription, resident)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Chưa có lịch sử đơn thuốc.
          </div>
        )}
      </section>
    </div>
  );
};
