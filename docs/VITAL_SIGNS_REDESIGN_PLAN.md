# Thiết kế lại tab "Chỉ số sinh hiệu" — Spec cho Codex

**Mục tiêu**: biến tab `Chỉ số sinh hiệu` (trong trang chi tiết NCT) thành dashboard **chỉ-đọc trực quan** cho bác sĩ. Bỏ hoàn toàn nút cập nhật trong tab — input duy nhất qua tab "Theo dõi". Thêm sparkline + delta + trend insights + 1 big chart cố định trong tab.

**Stack**: React 18 + Vite + TypeScript + Tailwind + Recharts v3.6.0 + Zustand. Vietnamese UI.

---

## 0. Background — read trước khi code

Bắt buộc đọc 4 file sau để hiểu pattern hiện tại:

| File | Lý do |
|---|---|
| [src/features/medical/components/VitalSignsSection.tsx](../src/features/medical/components/VitalSignsSection.tsx) | File sẽ rewrite. Hiện chứa cả `VitalInputModal` (xoá) + grid 6 SummaryCard + click mở `MetricDetailModal`. |
| [src/features/medical/components/VitalSignsChart.tsx](../src/features/medical/components/VitalSignsChart.tsx) | Recharts LineChart. Có `config` Record với `yDomain`, `refLines`, `lines` cho 5 metric `bp/pulse/sp02/temp/blood_sugar`. **Tái dùng nguyên xi.** |
| [src/features/medical/components/MetricDetailModal.tsx](../src/features/medical/components/MetricDetailModal.tsx) | Có `METRIC_CONFIG` (title/unit/desc/normal/color) cho 6 metric. Có formula stats max/min/avg lines 67-97. **Giữ nguyên file** — vẫn dùng làm deep-dive secondary. |
| [src/types/dailyMonitoring.ts](../src/types/dailyMonitoring.ts) | Type `DailyMonitoringRecord` — không sửa. Trường: `pulse:number`, `bp_morning/afternoon/evening:string` ('120/80'), `temperature:number`, `sp02:number`, `blood_sugar:number`, `bowel_movements:string`, `notes`, `record_date:'YYYY-MM-DD'`. |

Data source: `useMonitoringStore().fetchResidentRecords(residentId)` trong [src/stores/monitoringStore.ts:131-146](../src/stores/monitoringStore.ts) — trả mảng 30 bản ghi mới nhất, sorted by `record_date DESC`.

---

## 1. File changes — overview

### 1.1 Tạo mới
1. `src/features/medical/lib/vitalsInsights.ts` — pure helpers (no React).
2. `src/features/medical/components/VitalTile.tsx` — card với mini sparkline.

### 1.2 Sửa
3. `src/features/medical/components/VitalSignsSection.tsx` — **rewrite toàn bộ** (xoá `VitalInputModal`, đổi layout).
4. `src/features/residents/components/ResidentDetail.tsx` — thêm 1 prop `onNavigateToMonitoring` cho `<VitalSignsSection>` ở line 349.

### 1.3 KHÔNG sửa
- `VitalSignsChart.tsx`, `MetricDetailModal.tsx`, `monitoringStore.ts`, `dailyMonitoring.ts`.

---

## 2. File 1 — `src/features/medical/lib/vitalsInsights.ts` (NEW)

Pure utility module, no React, no Tailwind. Export 4 functions + types.

### 2.1 Types

```ts
import { DailyMonitoringRecord } from '@/src/types/dailyMonitoring';

export type MetricKey = 'pulse' | 'bp' | 'sp02' | 'temp' | 'blood_sugar' | 'bowel';
export type MetricStatus = 'normal' | 'warning' | 'critical';

export interface MetricSummary {
   value: number | string | null; // string for bp ('120/80') and bowel
   numeric: number | null;        // for delta/range/spark; null for bowel/missing
   status: MetricStatus;
   delta: number | null;          // vs previous reading
   spark: number[];               // up to 7 most recent numeric values, oldest→newest
   range7d: { min: number; max: number } | null;
}

export interface Insight {
   severity: 'critical' | 'warning' | 'info';
   metric: MetricKey;
   message: string; // Vietnamese
}
```

### 2.2 Helpers

**`getNumericForMetric(record, metric): number | null`** — extract numeric value from a record:
- `pulse` → `record.pulse ?? null`
- `bp` → parse `record.bp_morning` first, fallback afternoon/evening; return systolic int (số trước `/`); null if missing
- `sp02` → `record.sp02 ?? null`
- `temp` → `record.temperature ?? null`
- `blood_sugar` → `record.blood_sugar ?? null`
- `bowel` → `null` (handled separately as text)

**`getMetricStatus(metric, numeric): MetricStatus`** — thresholds (lấy từ medical refs trong `VitalSignsChart.tsx` config):

| Metric | normal | warning | critical |
|---|---|---|---|
| `pulse` | 60–100 | 50–59 hoặc 101–120 | <50 hoặc >120 |
| `bp` (systolic) | 90–139 | 140–159 hoặc 80–89 | ≥160 hoặc <80 |
| `sp02` | ≥95 | 92–94 | <92 |
| `temp` | 36.0–37.4 | 37.5–38.4 hoặc 35.5–35.9 | ≥38.5 hoặc <35.5 |
| `blood_sugar` | 3.9–6.4 | 6.5–11.0 hoặc 3.0–3.8 | >11.0 hoặc <3.0 |
| `bowel` | luôn `'normal'` (status không áp dụng) |

Trả `'normal'` khi numeric null.

**`buildMetricSummary(history, metric): MetricSummary`** — `history` là mảng đã sort DESC (như `fetchResidentRecords` trả về):
- `value`: cho `bowel` → `history[0]?.bowel_movements ?? null`; cho `bp` → `history[0]?.bp_morning ?? history[0]?.bp_afternoon ?? history[0]?.bp_evening ?? null`; còn lại → `getNumericForMetric(history[0], metric)`.
- `numeric`: `getNumericForMetric(history[0], metric)`.
- `status`: `getMetricStatus(metric, numeric)`.
- `delta`: `numeric - getNumericForMetric(history[1], metric)` nếu cả 2 non-null, ngược lại null.
- `spark`: lấy 7 record gần nhất, map qua `getNumericForMetric`, filter non-null, **reverse** (sort ASC để chart đi từ trái qua phải).
- `range7d`: từ `spark` (sau khi đã có ít nhất 1 phần tử), lấy `Math.min/max`. Null nếu rỗng.

**`getInsights(history): Insight[]`** — rule-based, return tối đa 3 insight, sort bởi severity (critical > warning > info).

Rules:
1. **SpO2 thấp gần nhất**: `history[0].sp02 < 95` → critical, `"SpO2 ${value}% (DD/MM) — dưới 95%"`.
2. **Sốt phát hiện**: tìm trong 7 record gần nhất bất kỳ `temperature ≥ 37.5` → critical, `"Sốt ${value}°C ngày DD/MM"`. Lấy record gần nhất thoả.
3. **HA cao kéo dài**: trung bình systolic 7 ngày ≥ 140 (chỉ tính khi ≥ 3 reading) → warning, `"HA tâm thu trung bình 7 ngày: ${avg} mmHg — cao"`.
4. **Mạch tăng liên tiếp**: 3 reading mới nhất `pulse` đều non-null và strictly increasing → warning, `"Mạch tăng 3 lần đo liên tiếp"`.
5. **Đường huyết tăng liên tiếp**: tương tự rule 4 cho `blood_sugar` → warning.

Format ngày: `record_date.split('-').reverse().slice(0,2).join('/')` cho `DD/MM`.

---

## 3. File 2 — `src/features/medical/components/VitalTile.tsx` (NEW)

Self-contained card component. Không gọi store. Nhận props.

### 3.1 Props

```ts
import { LucideIcon } from 'lucide-react';
import { MetricKey, MetricSummary } from '../lib/vitalsInsights';

interface VitalTileProps {
   metric: MetricKey;
   title: string;            // 'Mạch', 'Huyết áp', ...
   unit: string;             // 'l/p', 'mmHg', '°C', '%', 'mmol/L', '' (bowel)
   icon: LucideIcon;
   accentClass: string;      // ví dụ 'text-rose-600 bg-rose-50'
   sparkColor: string;       // hex, ví dụ '#f43f5e'
   summary: MetricSummary;
   active: boolean;          // ring khi được chọn cho big chart
   selectable: boolean;      // false cho 'bowel' → không clickable, không ring
   bowelHistory?: Array<{ date: string; text: string }>; // chỉ truyền cho metric='bowel', 3 dòng gần nhất
   onSelect: () => void;
}
```

### 3.2 Layout

Container:
```tsx
<button
   type="button"
   disabled={!selectable}
   onClick={onSelect}
   className={`text-left bg-white border rounded-xl p-4 transition-all w-full
      ${active ? 'ring-2 ring-teal-500 border-teal-300' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}
      ${!selectable ? 'cursor-default' : 'cursor-pointer'}`}
>
```

Bên trong, top-down:
1. **Row icon + title + status pill** (flex justify-between):
   - Left: `<Icon className={\`w-4 h-4 ${accentClass.split(' ')[0]}\`} />` + `<span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{title}</span>`.
   - Right: status pill — render khi `metric !== 'bowel'`. Map status:
     - `normal`: `bg-emerald-50 text-emerald-700 border-emerald-200` `Bình thường`.
     - `warning`: `bg-amber-50 text-amber-700 border-amber-200` `Cần lưu ý`.
     - `critical`: `bg-red-50 text-red-700 border-red-200` `Bất thường`.

2. **Value row** (mt-2, flex baseline):
   - `<span className="text-2xl font-bold text-slate-900">{summary.value ?? '--'}</span>`
   - `<span className="text-xs text-slate-400 ml-1">{unit}</span>`

3. **Delta row** (mt-1, h-4) — chỉ cho metric có numeric (không bowel):
   - Nếu `summary.delta == null` → render `<span className="text-xs text-slate-400">— vs lần trước</span>`.
   - Else: arrow icon (`TrendingUp` nếu >0, `TrendingDown` <0, `Minus` =0) + `${delta > 0 ? '+' : ''}${delta} vs lần trước`. Color: dùng `text-slate-500` neutral (không cần map sức khoẻ — status pill đã làm việc đó).

4. **Sparkline** (mt-3, h-10) — chỉ khi `metric !== 'bowel'` và `summary.spark.length >= 2`:
   ```tsx
   <ResponsiveContainer width="100%" height={40}>
     <LineChart data={summary.spark.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
       <Line type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={2} dot={false} isAnimationActive={false} />
     </LineChart>
   </ResponsiveContainer>
   ```
   Khi `spark.length < 2` → `<div className="h-10 flex items-center text-xs text-slate-300">Chưa đủ dữ liệu</div>`.

5. **Range chip** (mt-2, h-4) — `metric !== 'bowel'`:
   - Nếu `range7d` non-null → `<span className="text-[11px] text-slate-500">7 ngày: {min}–{max}</span>`.
   - Else → empty placeholder `<span className="text-[11px] text-slate-300">—</span>`.

6. **Bowel-specific block** (chỉ khi `metric === 'bowel'`, thay sparkline + range):
   - Render `bowelHistory` (max 3) dạng:
     ```tsx
     <ul className="mt-3 space-y-1">
       {bowelHistory.map(item => (
         <li className="flex justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1">
           <span>{item.date}</span>
           <span className="truncate ml-2 max-w-[60%]">{item.text || '—'}</span>
         </li>
       ))}
     </ul>
     ```

---

## 4. File 3 — `src/features/medical/components/VitalSignsSection.tsx` (REWRITE)

**Xoá hoàn toàn** component `VitalInputModal` cũ + state `showInputModal` + nút "Cập nhật".

### 4.1 Imports cần dùng

```tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Heart, Thermometer, Wind, Droplets, Soup, ArrowRight, Loader2, AlertTriangle, AlertCircle, Info, Table2 } from 'lucide-react';
import { Resident, User } from '../../../types/index';
import { useMonitoringStore } from '@/src/stores/monitoringStore';
import { DailyMonitoringRecord } from '@/src/types/dailyMonitoring';
import { MetricDetailModal } from './MetricDetailModal';
import { VitalSignsChart } from './VitalSignsChart';
import { VitalTile } from './VitalTile';
import { buildMetricSummary, getInsights, MetricKey, Insight } from '../lib/vitalsInsights';
```

(Lucide không có icon "bowel" cụ thể; dùng `Soup` hoặc fallback `Utensils` đã import trước đây — chọn `Soup`.)

### 4.2 Props (giữ tương thích `ResidentDetail`)

```tsx
interface VitalSignsSectionProps {
   user: User;
   resident: Resident;
   readOnly?: boolean;                  // giữ prop để không break callers, KHÔNG dùng nữa
   onNavigateToMonitoring?: () => void; // mới
}
```

`readOnly` không còn ảnh hưởng vì tab này luôn read-only. Vẫn nhận để callers cũ không vỡ.

### 4.3 State + load

```tsx
const { fetchResidentRecords } = useMonitoringStore();
const [history, setHistory] = useState<DailyMonitoringRecord[]>([]);
const [loading, setLoading] = useState(false);
const [selectedMetric, setSelectedMetric] = useState<MetricKey>('pulse');
const [range, setRange] = useState<7 | 14 | 30>(7);
const [showDeepDive, setShowDeepDive] = useState(false);

useEffect(() => {
   let cancelled = false;
   setLoading(true);
   fetchResidentRecords(resident.id).then(data => {
      if (!cancelled) {
         setHistory(data);
         setLoading(false);
      }
   });
   return () => { cancelled = true; };
}, [resident.id, fetchResidentRecords]);
```

### 4.4 Derived data với useMemo

```tsx
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
   history.slice(0, 3).map(r => ({
      date: r.record_date.split('-').reverse().slice(0,2).join('/'),
      text: r.bowel_movements ?? '',
   })),
   [history]
);

const latestDate = history[0]?.record_date;
const isEmpty = !loading && history.length === 0;
```

### 4.5 Big-chart stats (max/avg/min cho range hiện tại)

```tsx
const bigChartStats = useMemo(() => {
   if (selectedMetric === 'bowel') return null;
   const sorted = [...history].sort((a, b) => a.record_date.localeCompare(b.record_date));
   const slice = sorted.slice(-range);
   const vals = slice.map(r => {
      if (selectedMetric === 'bp') {
         const bp = r.bp_morning ?? r.bp_afternoon ?? r.bp_evening;
         return bp ? parseInt(bp.split('/')[0], 10) : NaN;
      }
      if (selectedMetric === 'pulse') return r.pulse ?? NaN;
      if (selectedMetric === 'sp02') return r.sp02 ?? NaN;
      if (selectedMetric === 'temp') return r.temperature ?? NaN;
      if (selectedMetric === 'blood_sugar') return r.blood_sugar ?? NaN;
      return NaN;
   }).filter(v => Number.isFinite(v));
   if (!vals.length) return null;
   return {
      max: Math.max(...vals),
      min: Math.min(...vals),
      avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
      count: vals.length,
   };
}, [history, selectedMetric, range]);
```

### 4.6 Tile config (mảng để map render)

```tsx
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
```

### 4.7 Layout JSX

```tsx
return (
   <div className="space-y-6">
      {/* Deep-dive modal (vẫn dùng MetricDetailModal có sẵn) */}
      {showDeepDive && selectedMetric !== 'bowel' && (
         <MetricDetailModal
            isOpen={showDeepDive}
            onClose={() => setShowDeepDive(false)}
            type={selectedMetric}
            data={history}
            residentName={resident.name}
         />
      )}

      {/* ─── 1. Header strip ─── */}
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
         /* ─── Empty state ─── */
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
            {/* ─── 2. Insights strip ─── */}
            {insights.length > 0 && (
               <div className="flex flex-wrap gap-2">
                  {insights.map((ins, i) => {
                     const cls = ins.severity === 'critical'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : ins.severity === 'warning'
                           ? 'bg-amber-50 text-amber-700 border-amber-200'
                           : 'bg-blue-50 text-blue-700 border-blue-200';
                     const Icon = ins.severity === 'critical' ? AlertTriangle : ins.severity === 'warning' ? AlertCircle : Info;
                     return (
                        <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${cls}`}>
                           <Icon className="w-3.5 h-3.5" />
                           {ins.message}
                        </span>
                     );
                  })}
               </div>
            )}

            {/* ─── 3. Vitals grid ─── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {tileConfigs.map(cfg => (
                  <VitalTile
                     key={cfg.metric}
                     metric={cfg.metric}
                     title={cfg.title}
                     unit={cfg.unit}
                     icon={cfg.icon}
                     accentClass={cfg.accentClass}
                     sparkColor={cfg.sparkColor}
                     selectable={cfg.selectable}
                     summary={summaries[cfg.metric]}
                     active={selectedMetric === cfg.metric}
                     bowelHistory={cfg.metric === 'bowel' ? bowelHistory : undefined}
                     onSelect={() => cfg.selectable && setSelectedMetric(cfg.metric)}
                  />
               ))}
            </div>

            {/* ─── 4. Big chart panel ─── */}
            {selectedMetric !== 'bowel' && (
               <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                     <div>
                        <h4 className="font-semibold text-slate-800">
                           Biểu đồ: {tileConfigs.find(t => t.metric === selectedMetric)?.title}
                        </h4>
                        <p className="text-xs text-slate-500">Click thẻ phía trên để chuyển chỉ số</p>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="flex bg-slate-100 rounded-lg p-1">
                           {[7, 14, 30].map(d => (
                              <button
                                 key={d}
                                 type="button"
                                 onClick={() => setRange(d as 7 | 14 | 30)}
                                 className={`px-3 py-1 text-xs font-medium rounded-md ${
                                    range === d ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                 }`}
                              >
                                 {d} ngày
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

                  <div className="md:h-[280px] h-[220px]">
                     <VitalSignsChart data={history} type={selectedMetric} days={range} />
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
```

### 4.8 Export

Giữ nguyên: `export const VitalSignsSection = (...) => {...}`.

---

## 5. File 4 — `src/features/residents/components/ResidentDetail.tsx` (PATCH)

Tại lines 347-351 (chỗ render `vital_signs` tab), thêm prop callback:

```tsx
{activeTab === 'vital_signs' && (
   <div className="space-y-8">
      <VitalSignsSection
         user={user}
         resident={resident}
         readOnly={readOnly}
         onNavigateToMonitoring={() => setActiveTab('monitoring')}
      />
   </div>
)}
```

Không sửa gì khác trong file này. Đảm bảo `setActiveTab` có sẵn trong scope (đã có — đang dùng cho `<Tabs onChange={setActiveTab}>` line 165).

---

## 6. Verification

Chạy theo thứ tự:

1. **Type check**: `npx tsc --noEmit` — phải pass, không có lỗi TS nào liên quan.
2. **Tests**: `npx vitest run` — không break test hiện có (không cần thêm test mới trừ khi đã có suite cho `VitalSignsSection`).
3. **Manual UI** (`npm run dev`):
   - Mở 1 NCT có data sinh hiệu (ví dụ Hoa Minh #26-0004): grid 6 thẻ hiện sparkline + delta + status pill. Click "Mạch" → big chart hiện đường mạch + ref lines (60/100). Click "Huyết áp" → chart hiện 2 line systolic/diastolic. Đổi range 7→14→30 chart re-render đúng. Click "Xem bảng chi tiết" mở `MetricDetailModal`.
   - Mở 1 NCT chưa có data: empty state hiện, click "Đến tab Theo dõi" → tab `monitoring` active.
   - Click badge "Chỉ đọc · Cập nhật ở tab Theo dõi" trong header → cũng chuyển tab `monitoring`.
   - Insights chip: thêm record với SpO2=90% qua tab Theo dõi → quay lại tab Chỉ số sinh hiệu thấy chip đỏ.
   - Mobile (DevTools 375px): grid `grid-cols-2`, big chart `h-[220px]`, range chip không vỡ.
4. **Check không còn `VitalInputModal`**: `Grep "VitalInputModal" src/` phải không có kết quả.
5. **Check không còn `updateRecord` import** trong `VitalSignsSection.tsx`.

---

## 7. Code style notes

- Vietnamese UI strings, copy theo tone hiện tại.
- Tailwind only, không CSS-in-JS, không thêm dependency mới.
- Không thêm comment giải thích "what" — code đủ rõ.
- Không thêm test mới (project hiện không có test cho section này; CLAUDE.md không yêu cầu).
- Không sửa migration, store, hoặc backend.

---

## 8. Out of scope (không làm trong task này)

- Không thêm tính năng nhập liệu vào tab "Chỉ số sinh hiệu" — đã chuyển hoàn toàn sang "Theo dõi".
- Không sửa `MetricDetailModal` (vẫn dùng làm deep-dive).
- Không thêm export PDF / in.
- Không lưu `selectedMetric`/`range` vào URL hay store — local state đủ.
