import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { DailyMonitoringRecord, DailyMonitoringUpdate } from '../types/dailyMonitoring';
import { toast } from 'react-hot-toast';

interface MonitoringStore {
    records: DailyMonitoringRecord[];
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
    isLoading: false,
    currentMonth: new Date(),

    setCurrentMonth: (date: Date) => set({ currentMonth: date }),

    fetchDailyRecords: async (date: Date) => {
        set({ isLoading: true });
        try {
            // Simplified: Fetch whole month or just specific days?
            // The grid needs a month. `fetchRecords` was fetching a month.
            // Let's assume the input `date` determines the month.
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const endDate = `${year}-${String(month).padStart(2, '0')}-31`; // Loose end date

            const { data, error } = await supabase
                .from('daily_monitoring')
                .select('*')
                .gte('record_date', startDate)
                .lte('record_date', endDate);

            if (error) throw error;
            set({ records: data || [], isLoading: false });
        } catch (error) {
            console.error('Error fetching daily records:', error);
            set({ isLoading: false });
        }
    },

    fetchLatestReadings: async () => {
        try {
            const { data, error } = await supabase
                .from('daily_monitoring')
                .select('*')
                .order('resident_id', { ascending: true })
                .order('record_date', { ascending: false });

            if (error) throw error;

            // Client-side distinct on resident_id since Supabase simple client doesn't support distinct on easy directly without raw SQL or rpc sometimes
            // Actually, standard distinct on via query builder: .select('*').distinct('resident_id') ? No, syntax is different.
            // Let's just do client side dedup for safety/speed now given dataset size is small.
            const unique = new Map<string, DailyMonitoringRecord>();
            data?.forEach(r => {
                if (!unique.has(r.resident_id)) {
                    unique.set(r.resident_id, r);
                }
            });

            return Array.from(unique.values());
        } catch (error) {
            console.error('Error fetching latest readings:', error);
            return [];
        }
    },

    fetchResidentRecords: async (residentId: string) => {
        try {
            const { data, error } = await supabase
                .from('daily_monitoring')
                .select('*')
                .eq('resident_id', residentId)
                .order('record_date', { ascending: false })
                .limit(30); // Get last 30 entries

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching resident records:', error);
            return [];
        }
    },

    updateRecord: async (update: DailyMonitoringUpdate) => {
        try {
            // Upsert: Try to update if exists, or insert if not
            // We use upsert matching on (resident_id, record_date) unique constraint
            const { data, error } = await supabase
                .from('daily_monitoring')
                .upsert({
                    ...update,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'resident_id,record_date' })
                .select()
                .single();

            if (error) throw error;

            // Update local state if record belongs to current view (simple check)
            // But we might be in ResidentDetail view where 'records' (monthly) isn't the main focus or is different
            // We update 'records' anyway if it matches
            set(state => {
                const existingIndex = state.records.findIndex(
                    r => r.resident_id === update.resident_id && r.record_date === update.record_date
                );

                if (existingIndex >= 0) {
                    const newRecords = [...state.records];
                    newRecords[existingIndex] = data;
                    return { records: newRecords };
                } else {
                    // Only add if it belongs to current month view? For now just add, simple
                    return { records: [...state.records, data] };
                }
            });

            toast.success('Đã lưu chỉ số');
        } catch (error) {
            console.error('Error updating monitoring record:', error);
            toast.error('Lỗi khi lưu dữ liệu');
        }
    }
}));
