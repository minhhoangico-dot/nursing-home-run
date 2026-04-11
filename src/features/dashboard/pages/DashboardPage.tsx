import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Loader2 } from 'lucide-react';

import { useAuthStore } from '@/src/stores/authStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { useMonitoringStore } from '@/src/stores/monitoringStore';
import { useProceduresStore } from '@/src/stores/proceduresStore';
import { useIncidentsStore } from '@/src/stores/incidentsStore';
import { useFinanceStore } from '@/src/stores/financeStore';
import { usePrescriptionsStore } from '@/src/stores/prescriptionStore';
import { buildTodayDashboard, type DashboardTone } from '../lib/todayDashboard';

const toneClasses: Record<DashboardTone, { card: string; badge: string; text: string }> = {
  info: {
    card: 'border-sky-100 bg-sky-50',
    badge: 'bg-sky-100 text-sky-700',
    text: 'text-sky-700',
  },
  warning: {
    card: 'border-amber-100 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    text: 'text-amber-700',
  },
  danger: {
    card: 'border-red-100 bg-red-50',
    badge: 'bg-red-100 text-red-700',
    text: 'text-red-700',
  },
  success: {
    card: 'border-emerald-100 bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-700',
  },
};

const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const { residents, isLoading: residentsLoading, error: residentsError } = useResidentsStore();
  const {
    records: dailyRecords,
    isLoading: monitoringLoading,
    fetchDailyRecords,
  } = useMonitoringStore();
  const {
    records: procedureRecords,
    isLoading: proceduresLoading,
    error: proceduresError,
    fetchAllRecords,
  } = useProceduresStore();
  const { incidents, isLoading: incidentsLoading, error: incidentsError } = useIncidentsStore();
  const { usageRecords, isLoading: financeLoading, error: financeError } = useFinanceStore();
  const {
    prescriptions,
    isLoading: prescriptionsLoading,
    error: prescriptionsError,
    fetchPrescriptions,
  } = usePrescriptionsStore();

  const today = useMemo(() => formatLocalDate(), []);

  useEffect(() => {
    if (!user) return;

    const todayDate = new Date();
    void fetchDailyRecords(todayDate);
    void fetchAllRecords(todayDate.getMonth() + 1, todayDate.getFullYear());
    void fetchPrescriptions();
  }, [fetchAllRecords, fetchDailyRecords, fetchPrescriptions, user]);

  const summary = useMemo(() => {
    if (!user) return null;

    return buildTodayDashboard({
      role: user.role,
      today,
      residents,
      dailyRecords,
      procedureRecords,
      incidents,
      usageRecords,
      prescriptions,
    });
  }, [dailyRecords, incidents, prescriptions, procedureRecords, residents, today, usageRecords, user]);

  if (!user || !summary) return null;

  const isLoading =
    residentsLoading ||
    monitoringLoading ||
    proceduresLoading ||
    incidentsLoading ||
    financeLoading ||
    prescriptionsLoading;
  const errors = [
    residentsError,
    proceduresError,
    incidentsError,
    financeError,
    prescriptionsError,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">{today}</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">{summary.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">{summary.subtitle}</p>
        </div>
        {isLoading && (
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang cập nhật dữ liệu
          </div>
        )}
      </section>

      {errors.length > 0 && (
        <section role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Không tải được một phần dữ liệu hôm nay: {errors.join('; ')}
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {summary.cards.map((card) => (
          <article key={card.label} className={`rounded-lg border p-5 shadow-sm ${toneClasses[card.tone].card}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600">{card.label}</p>
                <p className={`mt-3 text-3xl font-bold ${toneClasses[card.tone].text}`}>{card.value}</p>
              </div>
              <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${toneClasses[card.tone].badge}`}>
                Hôm nay
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-600">{card.caption}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-slate-900">Cảnh báo cần xử lý</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {summary.alerts.length === 0 ? (
              <div className="flex items-center gap-3 px-5 py-6 text-sm text-slate-600">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Không có cảnh báo cần xử lý ngay.
              </div>
            ) : (
              summary.alerts.map((alert) => (
                <Link
                  key={`${alert.title}-${alert.to}`}
                  to={alert.to}
                  className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className={`font-semibold ${toneClasses[alert.tone].text}`}>{alert.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{alert.body}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                </Link>
              ))
            )}
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-teal-700" />
            <h3 className="font-semibold text-slate-900">Lối tắt công việc</h3>
          </div>
          <div className="space-y-3">
            {summary.actions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
              >
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
};
