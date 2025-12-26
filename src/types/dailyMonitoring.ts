export interface DailyMonitoringRecord {
    id: string;
    resident_id: string;
    record_date: string; // YYYY-MM-DD
    sp02?: number;
    pulse?: number;
    temperature?: number;
    bp_morning?: string;
    bp_afternoon?: string;
    bp_evening?: string;
    blood_sugar?: number;
    bowel_movements?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
}

export interface DailyMonitoringUpdate {
    resident_id: string;
    record_date: string;
    sp02?: number;
    pulse?: number;
    temperature?: number;
    bp_morning?: string;
    bp_afternoon?: string;
    bp_evening?: string;
    blood_sugar?: number;
    bowel_movements?: string;
    notes?: string;
}
