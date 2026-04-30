import { LucideIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { MetricKey, MetricSummary, MetricStatus } from '../lib/vitalsInsights';

interface VitalTileProps {
   metric: MetricKey;
   title: string;
   unit: string;
   icon: LucideIcon;
   accentClass: string;
   sparkColor: string;
   summary: MetricSummary;
   active: boolean;
   selectable: boolean;
   bowelHistory?: Array<{ date: string; text: string }>;
   onSelect: () => void;
}

const statusConfig: Record<MetricStatus, { className: string; label: string }> = {
   normal: {
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Bình thường',
   },
   warning: {
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Cần lưu ý',
   },
   critical: {
      className: 'bg-red-50 text-red-700 border-red-200',
      label: 'Bất thường',
   },
};

const formatNumber = (value: number): string => Number.isInteger(value) ? `${value}` : value.toFixed(1);

export const VitalTile = ({
   metric,
   title,
   unit,
   icon: Icon,
   accentClass,
   sparkColor,
   summary,
   active,
   selectable,
   bowelHistory = [],
   onSelect,
}: VitalTileProps) => {
   const textAccentClass = accentClass.split(' ')[0];
   const status = statusConfig[summary.status];
   const displayValue = summary.value === null || summary.value === '' ? '--' : summary.value;
   const DeltaIcon = summary.delta === null || summary.delta === 0
      ? Minus
      : summary.delta > 0
         ? TrendingUp
         : TrendingDown;

   return (
      <button
         type="button"
         disabled={!selectable}
         onClick={onSelect}
         className={`text-left bg-white border rounded-xl p-4 transition-all w-full min-w-0 ${
            active && selectable
               ? 'ring-2 ring-teal-500 border-teal-300'
               : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
         } ${!selectable ? 'cursor-default' : 'cursor-pointer'}`}
      >
         <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
               <Icon className={`w-4 h-4 shrink-0 ${textAccentClass}`} />
               <span className="text-xs font-bold text-slate-600 uppercase tracking-wide truncate">{title}</span>
            </div>
            {metric !== 'bowel' && (
               <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.className}`}>
                  {status.label}
               </span>
            )}
         </div>

         <div className="mt-2 flex items-baseline min-w-0">
            <span className="text-2xl font-bold text-slate-900 truncate" title={String(displayValue)}>
               {displayValue}
            </span>
            {unit && <span className="text-xs text-slate-400 ml-1 shrink-0">{unit}</span>}
         </div>

         {metric !== 'bowel' && (
            <div className="mt-1 h-4">
               {summary.delta === null ? (
                  <span className="text-xs text-slate-400">— vs lần trước</span>
               ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                     <DeltaIcon className="w-3 h-3" />
                     {summary.delta > 0 ? '+' : ''}{formatNumber(summary.delta)} vs lần trước
                  </span>
               )}
            </div>
         )}

         {metric !== 'bowel' ? (
            <>
               <div className="mt-3 h-10 min-w-0">
                  {summary.spark.length >= 2 ? (
                     <ResponsiveContainer width="100%" height={40}>
                        <LineChart
                           data={summary.spark.map((value, index) => ({ i: index, v: value }))}
                           margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
                        >
                           <Line
                              type="monotone"
                              dataKey="v"
                              stroke={sparkColor}
                              strokeWidth={2}
                              dot={false}
                              isAnimationActive={false}
                           />
                        </LineChart>
                     </ResponsiveContainer>
                  ) : (
                     <div className="h-10 flex items-center text-xs text-slate-300">Chưa đủ dữ liệu</div>
                  )}
               </div>
               <div className="mt-2 h-4">
                  {summary.range7d ? (
                     <span className="text-[11px] text-slate-500">
                        7 ngày: {formatNumber(summary.range7d.min)}–{formatNumber(summary.range7d.max)}
                     </span>
                  ) : (
                     <span className="text-[11px] text-slate-300">—</span>
                  )}
               </div>
            </>
         ) : (
            <ul className="mt-3 space-y-1">
               {bowelHistory.map(item => (
                  <li
                     key={`${item.date}-${item.text}`}
                     className="flex justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1"
                  >
                     <span>{item.date}</span>
                     <span className="truncate ml-2 max-w-[60%]">{item.text || '—'}</span>
                  </li>
               ))}
            </ul>
         )}
      </button>
   );
};
