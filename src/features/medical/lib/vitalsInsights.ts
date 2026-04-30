import { DailyMonitoringRecord } from '@/src/types/dailyMonitoring';

export type MetricKey = 'pulse' | 'bp' | 'sp02' | 'temp' | 'blood_sugar' | 'bowel';
export type MetricStatus = 'normal' | 'warning' | 'critical';

export interface MetricSummary {
   value: number | string | null;
   numeric: number | null;
   status: MetricStatus;
   delta: number | null;
   spark: number[];
   range7d: { min: number; max: number } | null;
}

export interface Insight {
   severity: 'critical' | 'warning' | 'info';
   metric: MetricKey;
   message: string;
}

const getFirstBloodPressure = (record?: DailyMonitoringRecord): string | null => {
   if (!record) return null;
   return [record.bp_morning, record.bp_afternoon, record.bp_evening]
      .find(value => Boolean(value?.trim())) ?? null;
};

const parseSystolic = (bp?: string | null): number | null => {
   if (!bp) return null;
   const value = parseInt(bp.split('/')[0], 10);
   return Number.isFinite(value) ? value : null;
};

const formatDayMonth = (date: string): string => date.split('-').reverse().slice(0, 2).join('/');

export const getNumericForMetric = (
   record: DailyMonitoringRecord | undefined,
   metric: MetricKey
): number | null => {
   if (!record) return null;

   if (metric === 'pulse') return record.pulse ?? null;
   if (metric === 'bp') return parseSystolic(getFirstBloodPressure(record));
   if (metric === 'sp02') return record.sp02 ?? null;
   if (metric === 'temp') return record.temperature ?? null;
   if (metric === 'blood_sugar') return record.blood_sugar ?? null;
   return null;
};

export const getMetricStatus = (metric: MetricKey, numeric: number | null): MetricStatus => {
   if (numeric === null || metric === 'bowel') return 'normal';

   if (metric === 'pulse') {
      if (numeric < 50 || numeric > 120) return 'critical';
      if (numeric < 60 || numeric > 100) return 'warning';
      return 'normal';
   }

   if (metric === 'bp') {
      if (numeric < 80 || numeric >= 160) return 'critical';
      if (numeric < 90 || numeric >= 140) return 'warning';
      return 'normal';
   }

   if (metric === 'sp02') {
      if (numeric < 92) return 'critical';
      if (numeric < 95) return 'warning';
      return 'normal';
   }

   if (metric === 'temp') {
      if (numeric < 35.5 || numeric >= 38.5) return 'critical';
      if (numeric < 36 || numeric > 37.4) return 'warning';
      return 'normal';
   }

   if (metric === 'blood_sugar') {
      if (numeric < 3 || numeric > 11) return 'critical';
      if (numeric < 3.9 || numeric > 6.4) return 'warning';
      return 'normal';
   }

   return 'normal';
};

export const buildMetricSummary = (history: DailyMonitoringRecord[], metric: MetricKey): MetricSummary => {
   const latest = history[0];
   const numeric = getNumericForMetric(latest, metric);
   const previousNumeric = getNumericForMetric(history[1], metric);
   const spark = history
      .slice(0, 7)
      .map(record => getNumericForMetric(record, metric))
      .filter((value): value is number => value !== null)
      .reverse();

   let value: number | string | null = numeric;
   if (metric === 'bowel') {
      value = latest?.bowel_movements ?? null;
   } else if (metric === 'bp') {
      value = getFirstBloodPressure(latest);
   }

   return {
      value,
      numeric,
      status: getMetricStatus(metric, numeric),
      delta: numeric !== null && previousNumeric !== null ? numeric - previousNumeric : null,
      spark,
      range7d: spark.length ? { min: Math.min(...spark), max: Math.max(...spark) } : null,
   };
};

export const getInsights = (history: DailyMonitoringRecord[]): Insight[] => {
   const insights: Insight[] = [];
   const latest = history[0];

   if (typeof latest?.sp02 === 'number' && latest.sp02 < 95) {
      insights.push({
         severity: 'critical',
         metric: 'sp02',
         message: `SpO2 ${latest.sp02}% (${formatDayMonth(latest.record_date)}) — dưới 95%`,
      });
   }

   const feverRecord = history.slice(0, 7).find(record => (record.temperature ?? 0) >= 37.5);
   if (feverRecord?.temperature !== undefined) {
      insights.push({
         severity: 'critical',
         metric: 'temp',
         message: `Sốt ${feverRecord.temperature}°C ngày ${formatDayMonth(feverRecord.record_date)}`,
      });
   }

   const systolicValues = history
      .slice(0, 7)
      .map(record => getNumericForMetric(record, 'bp'))
      .filter((value): value is number => value !== null);
   if (systolicValues.length >= 3) {
      const avg = systolicValues.reduce((sum, value) => sum + value, 0) / systolicValues.length;
      if (avg >= 140) {
         insights.push({
            severity: 'warning',
            metric: 'bp',
            message: `HA tâm thu trung bình 7 ngày: ${Math.round(avg)} mmHg — cao`,
         });
      }
   }

   const latestPulseValues = history.slice(0, 3).map(record => record.pulse ?? null);
   if (
      latestPulseValues.length === 3 &&
      latestPulseValues.every((value): value is number => value !== null) &&
      latestPulseValues[0] > latestPulseValues[1] &&
      latestPulseValues[1] > latestPulseValues[2]
   ) {
      insights.push({
         severity: 'warning',
         metric: 'pulse',
         message: 'Mạch tăng 3 lần đo liên tiếp',
      });
   }

   const latestBloodSugarValues = history.slice(0, 3).map(record => record.blood_sugar ?? null);
   if (
      latestBloodSugarValues.length === 3 &&
      latestBloodSugarValues.every((value): value is number => value !== null) &&
      latestBloodSugarValues[0] > latestBloodSugarValues[1] &&
      latestBloodSugarValues[1] > latestBloodSugarValues[2]
   ) {
      insights.push({
         severity: 'warning',
         metric: 'blood_sugar',
         message: 'Đường huyết tăng 3 lần đo liên tiếp',
      });
   }

   const severityRank: Record<Insight['severity'], number> = {
      critical: 0,
      warning: 1,
      info: 2,
   };

   return insights
      .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
      .slice(0, 3);
};
