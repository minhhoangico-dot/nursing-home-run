-- Daily Monitoring Table
-- Stores daily vital signs for residents
-- Corresponds to the "Sổ theo dõi chỉ số ngày" feature

CREATE TABLE IF NOT EXISTS daily_monitoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id TEXT NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    
    -- Vital Signs
    sp02 INTEGER, -- Percentage
    pulse INTEGER, -- Beats per minute
    temperature DECIMAL(4,1), -- Celsius
    
    -- Blood Pressure (Stored as text to allow flexibility, e.g., "120/80")
    bp_morning TEXT,
    bp_afternoon TEXT,
    bp_evening TEXT,
    
    -- Other
    bowel_movements TEXT, -- e.g., "x", "2x", "táo", "lỏng"
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT REFERENCES users(id),
    
    UNIQUE(resident_id, record_date)
);

-- Index for querying by month/date
CREATE INDEX IF NOT EXISTS idx_daily_monitoring_date ON daily_monitoring(resident_id, record_date);

-- RLS Policies
ALTER TABLE daily_monitoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read daily_monitoring" ON daily_monitoring
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert daily_monitoring" ON daily_monitoring
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update daily_monitoring" ON daily_monitoring
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete daily_monitoring" ON daily_monitoring
    FOR DELETE TO authenticated USING (true);
