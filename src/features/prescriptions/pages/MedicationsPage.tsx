import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Download, Pill, Plus, Printer } from 'lucide-react';

import { ModuleReadOnlyBanner } from '@/src/components/ui/ModuleReadOnlyBanner';
import { useModuleReadOnly } from '@/src/routes/ModuleAccessContext';
import { usePrescriptionsStore } from '@/src/stores/prescriptionStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import {
  buildMedicationSummaryCsv,
  buildMedicationWorkspaceSummary,
  type MedicationAlertTone,
} from '../utils/medicationWorkspace';

const alertClasses: Record<MedicationAlertTone, string> = {
  info: 'border-sky-100 bg-sky-50 text-sky-700',
  warning: 'border-amber-100 bg-amber-50 text-amber-700',
  danger: 'border-red-100 bg-red-50 text-red-700',
};

const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const MedicationsPage = () => {
  const readOnly = useModuleReadOnly();
  const { residents, error: residentsError } = useResidentsStore();
  const {
    prescriptions,
    isLoading,
    error: prescriptionsError,
    fetchPrescriptions,
  } = usePrescriptionsStore();
  const today = useMemo(() => formatLocalDate(), []);

  useEffect(() => {
    void fetchPrescriptions();
  }, [fetchPrescriptions]);

  const summary = useMemo(
    () => buildMedicationWorkspaceSummary({ today, residents, prescriptions }),
    [prescriptions, residents, today],
  );

  const errors = [residentsError, prescriptionsError].filter(Boolean);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csv = buildMedicationSummaryCsv(summary.activeRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `active-medications-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {readOnly && <ModuleReadOnlyBanner />}

      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">Quy trình thuốc</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">Thuốc và đơn thuốc</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
            Theo dõi thuốc đang dùng, đơn tạm ngưng và các thuốc sắp hết trong toàn cơ sở.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            In danh sách
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
          >
            <Download className="h-4 w-4" />
            Xuất CSV
          </button>
          {!readOnly && (
            <Link
              to="/residents"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              Chọn NCT để kê đơn
            </Link>
          )}
        </div>
      </section>

      {errors.length > 0 && (
        <section role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Không tải được một phần dữ liệu thuốc: {errors.join('; ')}
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-teal-100 bg-teal-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Đơn đang hiệu lực</p>
          <p className="mt-3 text-3xl font-bold text-teal-700">{summary.counts.activePrescriptions}</p>
          <p className="mt-3 text-sm text-slate-600">Đơn Active trong hệ thống</p>
        </article>
        <article className="rounded-lg border border-amber-100 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Thuốc sắp hết</p>
          <p className="mt-3 text-3xl font-bold text-amber-700">{summary.counts.nearEndMedications}</p>
          <p className="mt-3 text-sm text-slate-600">Kết thúc trong 7 ngày tới</p>
        </article>
        <article className="rounded-lg border border-sky-100 bg-sky-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Đơn tạm ngưng</p>
          <p className="mt-3 text-3xl font-bold text-sky-700">{summary.counts.pausedPrescriptions}</p>
          <p className="mt-3 text-sm text-slate-600">Cần bác sĩ rà soát</p>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <Pill className="h-5 w-5 text-teal-700" />
              <h3 className="font-semibold text-slate-900">Thuốc đang dùng</h3>
            </div>
            {isLoading && <span className="text-sm text-slate-500">Đang tải...</span>}
          </div>

          {summary.activeRows.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-500">
              Chưa có thuốc Active để hiển thị.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">NCT</th>
                    <th className="px-5 py-3 font-semibold">Thuốc</th>
                    <th className="px-5 py-3 font-semibold">Liều</th>
                    <th className="px-5 py-3 font-semibold">Cách dùng</th>
                    <th className="px-5 py-3 font-semibold">Đơn</th>
                    <th className="px-5 py-3 font-semibold">Kết thúc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.activeRows.map((row) => (
                    <tr key={`${row.sourcePrescriptionId}-${row.medicineName}`} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <Link to={row.residentPath} className="font-semibold text-teal-700 hover:text-teal-800">
                          {row.residentName}
                        </Link>
                        <div className="text-xs text-slate-500">
                          Phòng {row.room || '-'}, giường {row.bed || '-'}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-900">{row.medicineName}</td>
                      <td className="px-5 py-4 text-slate-600">{row.dosage || '-'}</td>
                      <td className="px-5 py-4 text-slate-600">{row.frequency || '-'}</td>
                      <td className="px-5 py-4">
                        <Link
                          to={`${row.residentPath}/medications/${row.sourcePrescriptionId}`}
                          className="font-semibold text-slate-700 hover:text-teal-700"
                        >
                          {row.sourcePrescriptionCode}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <span className={row.isNearingEndDate ? 'font-semibold text-amber-700' : 'text-slate-600'}>
                          {row.isContinuous ? 'Liên tục' : row.sourcePrescriptionEndDate || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-slate-900">Cảnh báo đơn thuốc</h3>
          </div>
          <div className="space-y-3 p-5">
            {summary.pendingAlerts.length === 0 ? (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Không có cảnh báo thuốc cần xử lý.
              </div>
            ) : (
              summary.pendingAlerts.map((alert) => (
                <Link
                  key={`${alert.title}-${alert.to}`}
                  to={alert.to}
                  className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition hover:shadow-sm ${alertClasses[alert.tone]}`}
                >
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="mt-1 opacity-90">{alert.body}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0" />
                </Link>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};
