import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { DailyMonitoringRecord, DailyMonitoringUpdate } from '../types/dailyMonitoring';
import { toast } from 'react-hot-toast';
import { getDateMonthRange } from '@/src/utils/monthDateRange';

export const DAILY_MONITORING_COLUMNS = [
    'id',
    'resident_id',
    'record_date',
    'sp02',
    'pulse',
    'temperature',
    'bp_morning',
    'bp_afternoon',
    'bp_evening',
    'blood_sugar',
    'bowel_movements',
    'notes',
    'created_at',
    'updated_at',
    'created_by',
].join(',');

const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const trimMonthCache = <T,>(recordsByMonth: Record<string, T[]>) => {
    const keys = Object.keys(recordsByMonth).sort();

    if (keys.length <= 3) {
        return recordsByMonth;
    }

    const trimmed = { ...recordsByMonth };
    const keysToRemove = keys.slice(0, keys.length - 3);
    keysToRemove.forEach((key) => {
        delete trimmed[key];
    });
    return trimmed;
};

const upsertMonthRecord = (records: DailyMonitoringRecord[], record: DailyMonitoringRecord) => {
    const existingIndex = records.findIndex(
        (currentRecord) => currentRecord.resident_id === record.resident_id && currentRecord.record_date === record.record_date,
    );

    if (existingIndex >= 0) {
        const nextRecords = [...records];
        nextRecords[existingIndex] = record;
        return nextRecords;
    }

    return [...records, record];
};

interface MonitoringStore {
    records: DailyMonitoringRecord[];
    recordsByMonth: Record<string, DailyMonitoringRecord[]>;
    isLoading: boolean;
    currentMonth: Date;

    fetchDailyRecords: (date: Date) => Promise<void>;
    fetchResidentRecords: (residentId: string) => Promise<DailyMonitoringRecord[]>;
    fetchLatestReadings: () => Promise<DailyMonitoringRecord[]>;
    updateRecord: (update: DailyMonitoringUpdate) => Promise<void>;
    setCurrentMonth: (date: Date) => void;
}

export const useMonitoringStore = create<MonitoringStore>((set, get) => ({
    records: [],
    recordsByMonth: {},
    isLoading: false,
    currentMonth: new Date(),

    setCurrentMonth: (date: Date) => set({ currentMonth: date }),

    fetchDailyRecords: async (date: Date) => {
        const monthKey = getMonthKey(date);
        const cachedRecords = get().recordsByMonth[monthKey];

        if (cachedRecords) {
            set({ records: cachedRecords, isLoading: false });
        } else {
            set({ isLoading: true });
        }

        try {
            const { startDate, endDate } = getDateMonthRange(date);

            const { data, error } = await supabase
                .from('daily_monitoring')
                .select(DAILY_MONITORING_COLUMNS)
                .gte('record_date', startDate)
                .lte('record_date', endDate);

            if (error) throw error;

            const records = (data ?? []) as unknown as DailyMonitoringRecord[];
            set((state) => {
                const nextRecordsByMonth = trimMonthCache({
                    ...state.recordsByMonth,
                    [monthKey]: records,
                });

                return {
                    records,
                    recordsByMonth: nextRecordsByMonth,
                    isLoading: false,
                };
            });
        } catch (error) {
            console.error('Error fetching daily records:', error);
            set({ isLoading: false });
        }
    },

    fetchLatestReadings: async () => {
        try {
            const { data, error } = await supabase
                .from('latest_daily_monitoring')
                .select(DAILY_MONITORING_COLUMNS);

            if (error) throw error;
            return (data ?? []) as unknown as DailyMonitoringRecord[];
        } catch (error) {
            console.error('Error fetching latest readings:', error);
            return [];
        }
    },

    fetchResidentRecords: async (residentId: string) => {
        try {
            const { data, error } = await supabase
                .from('daily_monitoring')
                .select(DAILY_MONITORING_COLUMNS)
                .eq('resident_id', residentId)
                .order('record_date', { ascending: false })
                .limit(30);

            if (error) throw error;
            return (data ?? []) as unknown as DailyMonitoringRecord[];
        } catch (error) {
            console.error('Error fetching resident records:', error);
            return [];
        }
    },

    updateRecord: async (update: DailyMonitoringUpdate) => {
        try {
            const { data, error } = await supabase
                .from('daily_monitoring')
                .upsert({
                    ...update,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'resident_id,record_date' })
                .select(DAILY_MONITORING_COLUMNS)
                .single();

            if (error) throw error;
            const record = data as unknown as DailyMonitoringRecord;

            set((state) => {
                const monthKey = update.record_date.slice(0, 7);
                const currentMonthKey = getMonthKey(state.currentMonth);
                const cachedMonthRecords = state.recordsByMonth[monthKey] || (currentMonthKey === monthKey ? state.records : []);
                const nextMonthRecords = upsertMonthRecord(cachedMonthRecords, record);

                return {
                    records: currentMonthKey === monthKey ? nextMonthRecords : state.records,
                    recordsByMonth: trimMonthCache({
                        ...state.recordsByMonth,
                        [monthKey]: nextMonthRecords,
                    }),
                };
            });

            toast.success('Đã lưu chỉ số');
        } catch (error) {
            console.error('Error updating monitoring record:', error);
            toast.error('Lỗi khi lưu dữ liệu');
        }
    }
}));
