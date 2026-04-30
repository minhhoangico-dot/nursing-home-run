import React, { useEffect, useMemo, useState } from 'react';
import {
   Activity,
   AlertCircle,
   AlertTriangle,
   ArrowRight,
   Droplets,
   Heart,
   Info,
   Loader2,
   Soup,
   Table2,
   Thermometer,
   type LucideIcon,
   Wind,
} from 'lucide-react';
import { Resident, User } from '../../../types/index';
import { useMonitoringStore } from '@/src/stores/monitoringStore';
import { DailyMonitoringRecord } from '@/src/types/dailyMonitoring';
import { MetricDetailModal } from './MetricDetailModal';
import { VitalSignsChart } from './VitalSignsChart';
import { VitalTile } from './VitalTile';
import { buildMetricSummary, getInsights, getNumericForMetric, MetricKey } from '../lib/vitalsInsights';

interface VitalSignsSectionProps {
   user: User;
   resident: Resident;
   readOnly?: boolean;
   onNavigateToMonitoring?: () => void;
}

const tileConfigs: Array<{
   metric: MetricKey;
   title: string;
   unit: string;
   icon: LucideIcon;
   accentClass: string;
   sparkColor: string;
   selectable: boolean;
}> = [
   { metric: 'pulse', title: 'Mạch', unit: 'l/p', icon: Heart, accentClass: 'text-rose-600 bg-rose-50', sparkColor: '#ec4899', selectable: true },
   { metric: 'bp', title: 'Huyết áp', unit: 'mmHg', icon: Activity, accentClass: 'text-blue-600 bg-blue-50', sparkColor: '#ef4444', selectable: true },
   { metric: 'sp02', title: 'SpO2', unit: '%', icon: Wind, accentClass: 'text-sky-600 bg-sky-50', sparkColor: '#0ea5e9', selectable: true },
   { metric: 'temp', title: 'Nhiệt độ', unit: '°C', icon: Thermometer, accentClass: 'text-orange-600 bg-orange-50', sparkColor: '#f59e0b', selectable: true },
   { metric: 'blood_sugar', title: 'Đường huyết', unit: 'mmol/L', icon: Droplets, accentClass: 'text-emerald-600 bg-emerald-50', sparkColor: '#10b981', selectable: true },
   { metric: 'bowel', title: 'Đại tiện', unit: '', icon: Soup, accentClass: 'text-amber-600 bg-amber-50', sparkColor: '#f59e0b', selectable: false },
];

const formatDayMonth = (date: string): string => date.split('-').reverse().slice(0, 2).join('/');

export const VitalSignsSection = ({ resident, onNavigateToMonitoring }: VitalSignsSectionProps) => {
   const { fetchResidentRecords } = useMonitoringStore();
   const [history, setHistory] = useState<DailyMonitoringRecord[]>([]);
   const [loading, setLoading] = useState(false);
   const [selectedMetric, setSelectedMetric] = useState<MetricKey>('pulse');
   const [range, setRange] = useState<7 | 14 | 30>(7);
   const [showDeepDive, setShowDeepDive] = useState(false);
   const [chartReady, setChartReady] = useState(false);

   useEffect(() => {
      let cancelled = false;
      setLoading(true);

      fetchResidentRecords(resident.id)
         .then(data => {
            if (!cancelled) {
               setHistory(data);
               setLoading(false);
            }
         })
         .catch(() => {
            if (!cancelled) {
               setHistory([]);
               setLoading(false);
            }
         });

      return () => {
         cancelled = true;
      };
   }, [resident.id, fetchResidentRecords]);

   const summaries = useMemo(() => ({
      pulse: buildMetricSummary(history, 'pulse'),
      bp: buildMetricSummary(history, 'bp'),
      sp02: buildMetricSummary(history, 'sp02'),
      temp: buildMetricSummary(history, 'temp'),
      blood_sugar: buildMetricSummary(history, 'blood_sugar'),
      bowel: buildMetricSummary(history, 'bowel'),
   }), [history]);

   const insights = useMemo(() => getInsights(history), [history]);

   const bowelHistory = useMemo(() =>
      history.slice(0, 3).map(record => ({
         date: formatDayMonth(record.record_date),
         text: record.bowel_movements ?? '',
      })),
   [history]);

   const latestDate = history[0]?.record_date;
   const isEmpty = !loading && history.length === 0;

   const bigChartStats = useMemo(() => {
      if (selectedMetric === 'bowel') return null;

      const sorted = [...history].sort((a, b) => a.record_date.localeCompare(b.record_date));
      const vals = sorted
         .slice(-range)
         .map(record => getNumericForMetric(record, selectedMetric))
         .filter((value): value is number => value !== null);

      if (!vals.length) return null;

      return {
         max: Math.max(...vals),
         min: Math.min(...vals),
         avg: (vals.reduce((sum, value) => sum + value, 0) / vals.length).toFixed(1),
         count: vals.length,
      };
   }, [history, selectedMetric, range]);

   useEffect(() => {
      if (selectedMetric === 'bowel' || !history.length) return;

      setChartReady(false);
      const frameId = window.requestAnimationFrame(() => setChartReady(true));
      return () => window.cancelAnimationFrame(frameId);
   }, [history.length, range, selectedMetric]);

   return (
      <div className="space-y-6">
         {showDeepDive && selectedMetric !== 'bowel' && (
            <MetricDetailModal
               isOpen={showDeepDive}
               onClose={() => setShowDeepDive(false)}
               type={selectedMetric}
               data={history}
               residentName={resident.name}
            />
         )}

         <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
               <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-teal-600" /> Chỉ số sinh hiệu
               </h3>
               <p className="text-sm text-slate-500 mt-1">
                  {latestDate
                     ? `Bản ghi mới nhất: ${latestDate.split('-').reverse().join('/')}`
                     : 'Chưa có dữ liệu'}
               </p>
            </div>
            {onNavigateToMonitoring && (
               <button
                  type="button"
                  onClick={onNavigateToMonitoring}
                  className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 self-start md:self-auto"
               >
                  Chỉ đọc · Cập nhật ở tab Theo dõi
                  <ArrowRight className="w-4 h-4" />
               </button>
            )}
         </div>

         {loading && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 flex justify-center">
               <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
         )}

         {isEmpty && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
               <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
               <h4 className="font-semibold text-slate-700 mb-1">Chưa có dữ liệu sinh hiệu</h4>
               <p className="text-sm text-slate-500 mb-5">Dữ liệu được nhập từ Sổ theo dõi ngày.</p>
               {onNavigateToMonitoring && (
                  <button
                     type="button"
                     onClick={onNavigateToMonitoring}
                     className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 font-medium"
                  >
                     Đến tab Theo dõi <ArrowRight className="w-4 h-4" />
                  </button>
               )}
            </div>
         )}

         {!loading && !isEmpty && (
            <>
               {insights.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                     {insights.map((insight, index) => {
                        const cls = insight.severity === 'critical'
                           ? 'bg-red-50 text-red-700 border-red-200'
                           : insight.severity === 'warning'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200';
                        const Icon = insight.severity === 'critical'
                           ? AlertTriangle
                           : insight.severity === 'warning'
                              ? AlertCircle
                              : Info;

                        return (
                           <span
                              key={`${insight.metric}-${index}`}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${cls}`}
                           >
                              <Icon className="w-3.5 h-3.5" />
                              {insight.message}
                           </span>
                        );
                     })}
                  </div>
               )}

               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 min-w-0">
                  {tileConfigs.map(config => (
                     <VitalTile
                        key={config.metric}
                        metric={config.metric}
                        title={config.title}
                        unit={config.unit}
                        icon={config.icon}
                        accentClass={config.accentClass}
                        sparkColor={config.sparkColor}
                        selectable={config.selectable}
                        summary={summaries[config.metric]}
                        active={selectedMetric === config.metric}
                        bowelHistory={config.metric === 'bowel' ? bowelHistory : undefined}
                        onSelect={() => config.selectable && setSelectedMetric(config.metric)}
                     />
                  ))}
               </div>

               {selectedMetric !== 'bowel' && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5 min-w-0">
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                           <h4 className="font-semibold text-slate-800">
                              Biểu đồ: {tileConfigs.find(config => config.metric === selectedMetric)?.title}
                           </h4>
                           <p className="text-xs text-slate-500">Click thẻ phía trên để chuyển chỉ số</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                           <div className="flex bg-slate-100 rounded-lg p-1">
                              {[7, 14, 30].map(days => (
                                 <button
                                    key={days}
                                    type="button"
                                    onClick={() => setRange(days as 7 | 14 | 30)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md ${
                                       range === days ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                 >
                                    {days} ngày
                                 </button>
                              ))}
                           </div>
                           <button
                              type="button"
                              onClick={() => setShowDeepDive(true)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 px-2 py-1"
                           >
                              <Table2 className="w-3.5 h-3.5" /> Xem bảng chi tiết
                           </button>
                        </div>
                     </div>

                     <div className="md:h-[280px] h-[220px] min-w-0 min-h-0 [&>div]:!h-full">
                        {chartReady && bigChartStats ? (
                           <VitalSignsChart data={history} type={selectedMetric} days={range} />
                        ) : chartReady ? (
                           <div className="h-full flex items-center justify-center text-sm text-slate-400">
                              Chưa có dữ liệu biểu đồ
                           </div>
                        ) : (
                           <div className="h-full flex items-center justify-center text-sm text-slate-400">
                              Đang tải biểu đồ...
                           </div>
                        )}
                     </div>

                     {bigChartStats && (
                        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                           <div className="text-center">
                              <p className="text-[11px] text-red-600 uppercase font-bold">Cao nhất</p>
                              <p className="text-lg font-bold text-slate-800">{bigChartStats.max}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[11px] text-teal-600 uppercase font-bold">Trung bình</p>
                              <p className="text-lg font-bold text-slate-800">{bigChartStats.avg}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[11px] text-blue-600 uppercase font-bold">Thấp nhất</p>
                              <p className="text-lg font-bold text-slate-800">{bigChartStats.min}</p>
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {selectedMetric === 'bowel' && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
                     Chỉ số "Đại tiện" hiển thị dưới dạng ghi chú văn bản theo ngày — không có biểu đồ.
                     Xem 3 lần ghi gần nhất ở thẻ phía trên.
                  </div>
               )}
            </>
         )}
      </div>
   );
};
