-- Sematic SQL Seed Data (Corrected)
-- Residents (10 Representative samples)
-- Using hardcoded UUIDs for relationship mapping

-- Resident 1: Chu Bá Thưởng (Normal)
INSERT INTO residents (id, name, floor, room, care_level, is_diabetic, dob, gender, status, admission_date, guardian_name, guardian_phone)
VALUES ('11111111-1111-4111-a111-111111111101', 'Chu Bá Thưởng', 'Tầng 3', '301', 2, false, '1950-01-01', 'Nam', 'Active', NOW(), 'Người nhà', '0901234567')
ON CONFLICT (id) DO NOTHING;

-- Resident 2: Nguyễn Đức Kha (Normal, High care)
INSERT INTO residents (id, name, floor, room, care_level, is_diabetic, dob, gender, status, admission_date, guardian_name, guardian_phone)
VALUES ('11111111-1111-4111-a111-111111111102', 'Nguyễn Đức Kha', 'Tầng 3', '301', 3, false, '1945-05-12', 'Nam', 'Active', NOW(), 'Con trai', '0901234568')
ON CONFLICT (id) DO NOTHING;

-- Resident 3: Phạm Thị Thục (Diabetic)
INSERT INTO residents (id, name, floor, room, care_level, is_diabetic, dob, gender, status, admission_date, guardian_name, guardian_phone)
VALUES ('11111111-1111-4111-a111-111111111103', 'Phạm Thị Thục', 'Tầng 3', '303', 2, true, '1955-08-20', 'Nữ', 'Active', NOW(), 'Cháu gái', '0901234569')
ON CONFLICT (id) DO NOTHING;

-- Resident 4: Nguyễn Thế Hồng (Diabetic)
INSERT INTO residents (id, name, floor, room, care_level, is_diabetic, dob, gender, status, admission_date, guardian_name, guardian_phone)
VALUES ('11111111-1111-4111-a111-111111111104', 'Nguyễn Thế Hồng', 'Tầng 3', '303', 3, true, '1948-11-30', 'Nam', 'Active', NOW(), 'Vợ', '0901234570')
ON CONFLICT (id) DO NOTHING;

-- Resident 5: Trần Văn Rật (Diabetic)
INSERT INTO residents (id, name, floor, room, care_level, is_diabetic, dob, gender, status, admission_date, guardian_name, guardian_phone)
VALUES ('11111111-1111-4111-a111-111111111105', 'Trần Văn Rật', 'Tầng 3', '304', 3, true, '1942-03-15', 'Nam', 'Active', NOW(), 'Con gái', '0901234571')
ON CONFLICT (id) DO NOTHING;

-- Weight Records (History for charts)
-- Chu Bá Thưởng (Stable)
INSERT INTO weight_records (resident_id, record_month, weight_kg, recorded_by) VALUES
('11111111-1111-4111-a111-111111111101', '2025-10', 63.5, 'Admin'),
('11111111-1111-4111-a111-111111111101', '2025-11', 63.0, 'Admin'),
('11111111-1111-4111-a111-111111111101', '2025-12', 63.0, 'Admin')
ON CONFLICT DO NOTHING;

-- Nguyễn Đức Kha (Losing weight)
INSERT INTO weight_records (resident_id, record_month, weight_kg, recorded_by) VALUES
('11111111-1111-4111-a111-111111111102', '2025-10', 48.0, 'Admin'),
('11111111-1111-4111-a111-111111111102', '2025-11', 46.5, 'Admin'),
('11111111-1111-4111-a111-111111111102', '2025-12', 45.0, 'Admin')
ON CONFLICT DO NOTHING;

-- Blood Sugar Records (Last 3 days for diabetics)
-- Pham Thi Thuc
INSERT INTO blood_sugar_records (resident_id, record_date, morning_before_meal, morning_after_meal, insulin_units, insulin_time, administered_by) VALUES
('11111111-1111-4111-a111-111111111103', CURRENT_DATE - INTERVAL '2 days', 5.5, 7.8, 10, 'morning', 'Y tá A'),
('11111111-1111-4111-a111-111111111103', CURRENT_DATE - INTERVAL '1 day', 5.8, 8.2, 10, 'morning', 'Y tá B'),
('11111111-1111-4111-a111-111111111103', CURRENT_DATE, 6.1, 7.5, 10, 'morning', 'Y tá C')
ON CONFLICT DO NOTHING;

-- Procedure Records
INSERT INTO procedure_records (resident_id, record_date, blood_pressure, notes) VALUES
('11111111-1111-4111-a111-111111111101', CURRENT_DATE, true, 'Huyết áp ổn định')
ON CONFLICT DO NOTHING;

INSERT INTO procedure_records (resident_id, record_date, injection, notes) VALUES
('11111111-1111-4111-a111-111111111105', CURRENT_DATE, true, 'Tiêm insulin')
ON CONFLICT DO NOTHING;

-- Shift Handovers
INSERT INTO shift_handovers (id, shift_date, shift_time, floor_id, handover_staff, receiver_staff, total_residents) VALUES
('22222222-2222-4222-b222-222222222201', CURRENT_DATE, '06:00', 'Tầng 3', ARRAY['Y tá A'], ARRAY['Y tá B'], 36)
ON CONFLICT DO NOTHING;

INSERT INTO shift_handover_notes (handover_id, resident_id, resident_name, content) VALUES
('22222222-2222-4222-b222-222222222201', '11111111-1111-4111-a111-111111111103', 'Phạm Thị Thục', 'Đường huyết sáng ổn')
ON CONFLICT DO NOTHING;
