-- Migration: Redesign Prescriptions Module
-- Date: 2025-12-26
-- Author: Antigravity

-- 1. Create Medicines Dictionary (danh mục thuốc)
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    active_ingredient TEXT,
    unit TEXT, -- 'viên', 'gói', 'chai', 'ống'
    default_dosage TEXT,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Prescriptions Header (đơn thuốc)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- DT-YYYYMMDD-XXX
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES auth.users(id), -- The doctor who prescribed
    doctor_name TEXT, -- Snapshot of doctor name if needed
    diagnosis TEXT NOT NULL,
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT CHECK (status IN ('Active', 'Completed', 'Cancelled')) DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Prescription Items (chi tiết đơn thuốc)
CREATE TABLE IF NOT EXISTS prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id),
    medicine_name TEXT NOT NULL, -- Snapshot
    dosage TEXT NOT NULL, -- '1 viên'
    frequency TEXT NOT NULL, -- '2 lần/ngày'
    times_of_day TEXT[], -- ['Sáng', 'Chiều']
    quantity INTEGER, -- Total quantity derived from duration
    instructions TEXT, -- 'Uống sau ăn'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policies (RLS)
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read medicines
CREATE POLICY "Enable read access for all authenticated users" ON medicines FOR SELECT USING (auth.role() = 'authenticated');
-- Allow staff to modify medicines (simplified)
CREATE POLICY "Enable CRUD for staff" ON medicines FOR ALL USING (auth.role() = 'authenticated');

-- Prescriptions policies
CREATE POLICY "Enable read for authenticated" ON prescriptions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated" ON prescriptions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated" ON prescriptions FOR UPDATE USING (auth.role() = 'authenticated');

-- Prescription Items policies
CREATE POLICY "Enable read for authenticated" ON prescription_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated" ON prescription_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated" ON prescription_items FOR UPDATE USING (auth.role() = 'authenticated');
