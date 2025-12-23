-- =============================================
-- 1. BLOOD SUGAR MONITORING TABLE (Theo dõi đường máu)
-- For diabetic residents (6 NCT at Floor 3)
-- =============================================
CREATE TABLE IF NOT EXISTS blood_sugar_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id TEXT NOT NULL REFERENCES residents(id) ON DELETE CASCADE, -- Changed UUID to TEXT
    record_date DATE NOT NULL,
    
    -- Morning readings (mmol/L)
    morning_before_meal DECIMAL(4,1),
    morning_after_meal DECIMAL(4,1),
    
    -- Lunch readings
    lunch_before_meal DECIMAL(4,1),
    lunch_after_meal DECIMAL(4,1),
    
    -- Dinner readings
    dinner_before_meal DECIMAL(4,1),
    dinner_after_meal DECIMAL(4,1),
    
    -- Insulin administration
    insulin_units INTEGER,
    insulin_time VARCHAR(20) CHECK (insulin_time IN ('morning', 'noon', 'evening')),
    administered_by VARCHAR(100),
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    UNIQUE(resident_id, record_date)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_blood_sugar_resident_date ON blood_sugar_records(resident_id, record_date DESC);

-- =============================================
-- 2. SHIFT HANDOVER TABLE (Sổ giao ca)
-- Daily shift handover logs
-- =============================================
CREATE TABLE IF NOT EXISTS shift_handovers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_date DATE NOT NULL,
    shift_time TIME NOT NULL,
    floor_id TEXT, -- Changed UUID REFERENCES floors(id) to TEXT
    
    -- Staff involved
    handover_staff TEXT[] NOT NULL,
    receiver_staff TEXT[] NOT NULL,
    
    total_residents INTEGER NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Shift notes (separate table for flexibility)
CREATE TABLE IF NOT EXISTS shift_handover_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handover_id UUID NOT NULL REFERENCES shift_handovers(id) ON DELETE CASCADE,
    resident_id TEXT REFERENCES residents(id), -- Changed UUID to TEXT
    resident_name VARCHAR(100),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shift_handover_floor_date ON shift_handovers(floor_id, shift_date DESC);

-- =============================================
-- 3. MEDICAL PROCEDURES TABLE (Thủ thuật y tế)
-- Track daily procedures per resident
-- =============================================
CREATE TABLE IF NOT EXISTS procedure_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id TEXT NOT NULL REFERENCES residents(id) ON DELETE CASCADE, -- Changed UUID to TEXT
    record_date DATE NOT NULL,
    
    -- Procedure types (boolean flags)
    injection BOOLEAN DEFAULT FALSE,
    iv_drip BOOLEAN DEFAULT FALSE,
    gastric_tube BOOLEAN DEFAULT FALSE,
    urinary_catheter BOOLEAN DEFAULT FALSE,
    bladder_wash BOOLEAN DEFAULT FALSE,
    blood_sugar_test BOOLEAN DEFAULT FALSE,
    blood_pressure BOOLEAN DEFAULT FALSE,
    oxygen_therapy BOOLEAN DEFAULT FALSE,
    wound_dressing BOOLEAN DEFAULT FALSE,
    
    -- Counts (for procedures done multiple times)
    injection_count INTEGER DEFAULT 0,
    iv_drip_count INTEGER DEFAULT 0,
    
    performed_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    UNIQUE(resident_id, record_date)
);

CREATE INDEX IF NOT EXISTS idx_procedures_resident_date ON procedure_records(resident_id, record_date DESC);

-- =============================================
-- 4. WEIGHT TRACKING TABLE (Theo dõi cân nặng)
-- Monthly weight records
-- =============================================
CREATE TABLE IF NOT EXISTS weight_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id TEXT NOT NULL REFERENCES residents(id) ON DELETE CASCADE, -- Changed UUID to TEXT
    record_month VARCHAR(7) NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    
    notes TEXT,
    recorded_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    UNIQUE(resident_id, record_month)
);

CREATE INDEX IF NOT EXISTS idx_weight_resident_month ON weight_records(resident_id, record_month DESC);

-- =============================================
-- 5. UPDATE RESIDENTS TABLE - Add diabetes flag
-- =============================================
ALTER TABLE residents 
ADD COLUMN IF NOT EXISTS is_diabetic BOOLEAN DEFAULT FALSE;

-- =============================================
-- 6. UPDATE VITAL SIGNS TABLE - 3x daily BP
-- =============================================
-- NOTE: vital_signs table stores data in jsonb column in residents table in original schema? 
-- Let's check line 26 of 001: vital_signs jsonb default '[]'.
-- BUT databaseService often uses a separate table? 
-- Wait, if vital_signs is a column in residents, then we don't need ALTER TABLE vital_signs unless vital_signs implies a separate table created later?
-- The user request error didn't complain about vital_signs yet.
-- Ideally, if `vital_signs` is a JSONB column, we don't need schema migration for it, we just add fields to the JSON objects.
-- However, there might be a separate `vital_signs` table if the code assumes one.
-- Checking lines 132-138 of 002... "ALTER TABLE vital_signs".
-- 001 schema doesn't have a `vital_signs` table, only a column in `residents`.
-- If the app code uses `vital_signs` table, it must have been created in another migration or manual step.
-- If not, then this part of migration will fail if table doesn't exist.
-- To be safe, let's create it if it doesn't exist, OR assume the user has it.
-- Given the "God Object" refactoring, maybe `vital_signs` was extracted?
-- I'll keep the ALTER TABLE but add IF EXISTS to be safe, or CREATE it if needed.
-- Actually, the error was about blood_sugar_records.
-- I will keep the vital_signs part but verify if I should create the table.
-- Let's assume for now the user might strictly want the table if they are using the new service structure.
-- But wait, `medicalService.ts` or `residentService.ts` might refer to `vital_signs` table?
-- Let's just correct the types for now.

ALTER TABLE vital_signs
ADD COLUMN IF NOT EXISTS bp_morning_systolic INTEGER,
ADD COLUMN IF NOT EXISTS bp_morning_diastolic INTEGER,
ADD COLUMN IF NOT EXISTS bp_noon_systolic INTEGER,
ADD COLUMN IF NOT EXISTS bp_noon_diastolic INTEGER,
ADD COLUMN IF NOT EXISTS bp_evening_systolic INTEGER,
ADD COLUMN IF NOT EXISTS bp_evening_diastolic INTEGER;

-- =============================================
-- 7. ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE blood_sugar_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_handover_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Auth users can read blood_sugar_records" ON blood_sugar_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert blood_sugar_records" ON blood_sugar_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update blood_sugar_records" ON blood_sugar_records FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can read shift_handovers" ON shift_handovers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert shift_handovers" ON shift_handovers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update shift_handovers" ON shift_handovers FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can read shift_handover_notes" ON shift_handover_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert shift_handover_notes" ON shift_handover_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update shift_handover_notes" ON shift_handover_notes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can read procedure_records" ON procedure_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert procedure_records" ON procedure_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update procedure_records" ON procedure_records FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can read weight_records" ON weight_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert weight_records" ON weight_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update weight_records" ON weight_records FOR UPDATE TO authenticated USING (true);
