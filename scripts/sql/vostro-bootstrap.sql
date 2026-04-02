CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT,
    role TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    floor TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.users
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE public.users
SET is_active = TRUE
WHERE is_active IS NULL;

ALTER TABLE IF EXISTS public.users
    ALTER COLUMN is_active SET DEFAULT TRUE,
    ALTER COLUMN is_active SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.residents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    clinic_code TEXT,
    name TEXT NOT NULL,
    dob DATE,
    gender TEXT,
    room TEXT,
    bed TEXT,
    floor TEXT,
    building TEXT,
    care_level INTEGER,
    status TEXT DEFAULT 'Active',
    admission_date DATE,
    guardian_name TEXT,
    guardian_phone TEXT,
    balance NUMERIC DEFAULT 0,
    assessments JSONB DEFAULT '[]'::jsonb,
    prescriptions JSONB DEFAULT '[]'::jsonb,
    medical_visits JSONB DEFAULT '[]'::jsonb,
    special_monitoring JSONB DEFAULT '[]'::jsonb,
    medical_history JSONB DEFAULT '[]'::jsonb,
    allergies JSONB DEFAULT '[]'::jsonb,
    vital_signs JSONB DEFAULT '[]'::jsonb,
    care_logs JSONB DEFAULT '[]'::jsonb,
    current_condition_note TEXT DEFAULT '',
    last_medical_update DATE,
    last_updated_by TEXT,
    room_type TEXT,
    diet_type TEXT,
    diet_note TEXT,
    is_diabetic BOOLEAN DEFAULT FALSE,
    height DOUBLE PRECISION,
    location_status TEXT DEFAULT 'Present',
    absent_start_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT,
    stock NUMERIC DEFAULT 0,
    min_stock NUMERIC DEFAULT 0,
    price NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    item_id TEXT REFERENCES public.inventory(id) ON DELETE SET NULL,
    item_name TEXT,
    type TEXT,
    quantity NUMERIC,
    date TIMESTAMPTZ DEFAULT NOW(),
    performer TEXT,
    reason TEXT
);

CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    item_id TEXT,
    item_name TEXT,
    quantity NUMERIC,
    status TEXT,
    request_date TIMESTAMPTZ DEFAULT NOW(),
    priority TEXT,
    estimated_cost NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    date TIMESTAMPTZ DEFAULT NOW(),
    resident_name TEXT,
    description TEXT,
    amount NUMERIC DEFAULT 0,
    type TEXT,
    performer TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    date DATE DEFAULT CURRENT_DATE,
    time TEXT,
    type TEXT,
    severity TEXT,
    resident_id TEXT REFERENCES public.residents(id) ON DELETE SET NULL,
    resident_name TEXT,
    location TEXT,
    description TEXT,
    immediate_action TEXT,
    reporter TEXT,
    status TEXT,
    witnesses TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff_schedules (
    user_id TEXT PRIMARY KEY,
    user_name TEXT,
    role TEXT,
    shifts JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.handovers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    date DATE,
    shift TEXT,
    leader TEXT,
    total_residents INTEGER DEFAULT 0,
    new_admissions INTEGER DEFAULT 0,
    discharges INTEGER DEFAULT 0,
    transfers INTEGER DEFAULT 0,
    medical_alerts TEXT DEFAULT '',
    equipment_issues TEXT DEFAULT '',
    general_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.visitors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    visitor_name TEXT,
    id_card TEXT,
    phone TEXT,
    resident_id TEXT REFERENCES public.residents(id) ON DELETE SET NULL,
    resident_name TEXT,
    relationship TEXT,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    status TEXT,
    note TEXT,
    item_brought TEXT
);

CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT,
    description TEXT,
    location TEXT,
    priority TEXT,
    status TEXT,
    reporter TEXT,
    assignee TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    cost NUMERIC,
    note TEXT
);

CREATE TABLE IF NOT EXISTS public.activities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT,
    type TEXT,
    date DATE,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    host TEXT,
    description TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS public.medication_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    resident_id TEXT REFERENCES public.residents(id) ON DELETE CASCADE,
    prescription_id TEXT,
    medication_name TEXT,
    dose TEXT,
    time TEXT,
    date DATE,
    status TEXT,
    performer TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meal_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id TEXT REFERENCES public.residents(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meal_type TEXT NOT NULL,
    diet_type TEXT,
    note TEXT,
    UNIQUE (resident_id, date, meal_type)
);

CREATE TABLE IF NOT EXISTS public.blood_sugar_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id TEXT NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    morning_before_meal DECIMAL(4,1),
    morning_after_meal DECIMAL(4,1),
    lunch_before_meal DECIMAL(4,1),
    lunch_after_meal DECIMAL(4,1),
    dinner_before_meal DECIMAL(4,1),
    dinner_after_meal DECIMAL(4,1),
    insulin_units INTEGER,
    insulin_time TEXT,
    administered_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    UNIQUE (resident_id, record_date)
);

CREATE TABLE IF NOT EXISTS public.shift_handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_date DATE NOT NULL,
    shift_time TIME NOT NULL,
    floor_id TEXT,
    handover_staff TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    receiver_staff TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    total_residents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.shift_handover_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handover_id UUID NOT NULL REFERENCES public.shift_handovers(id) ON DELETE CASCADE,
    resident_id TEXT REFERENCES public.residents(id) ON DELETE SET NULL,
    resident_name TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.procedure_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id TEXT NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    injection BOOLEAN DEFAULT FALSE,
    iv_drip BOOLEAN DEFAULT FALSE,
    gastric_tube BOOLEAN DEFAULT FALSE,
    urinary_catheter BOOLEAN DEFAULT FALSE,
    bladder_wash BOOLEAN DEFAULT FALSE,
    blood_sugar_test BOOLEAN DEFAULT FALSE,
    blood_pressure BOOLEAN DEFAULT FALSE,
    oxygen_therapy BOOLEAN DEFAULT FALSE,
    wound_dressing BOOLEAN DEFAULT FALSE,
    injection_count INTEGER DEFAULT 0,
    iv_drip_count INTEGER DEFAULT 0,
    gastric_tube_count INTEGER DEFAULT 0,
    urinary_catheter_count INTEGER DEFAULT 0,
    bladder_wash_count INTEGER DEFAULT 0,
    blood_sugar_test_count INTEGER DEFAULT 0,
    blood_pressure_count INTEGER DEFAULT 0,
    oxygen_therapy_count INTEGER DEFAULT 0,
    wound_dressing_count INTEGER DEFAULT 0,
    performed_by TEXT,
    notes TEXT,
    iv_drip_details JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    UNIQUE (resident_id, record_date)
);

CREATE TABLE IF NOT EXISTS public.weight_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id TEXT NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
    record_month TEXT NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    notes TEXT,
    recorded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    UNIQUE (resident_id, record_month)
);

CREATE TABLE IF NOT EXISTS public.daily_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id TEXT NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    sp02 INTEGER,
    pulse INTEGER,
    temperature DECIMAL(4,1),
    bp_morning TEXT,
    bp_afternoon TEXT,
    bp_evening TEXT,
    blood_sugar DECIMAL(4,1),
    bowel_movements TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    UNIQUE (resident_id, record_date)
);

CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    active_ingredient TEXT,
    unit TEXT,
    strength TEXT,
    route TEXT,
    therapeutic_group TEXT,
    default_dosage TEXT,
    price NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    resident_id TEXT REFERENCES public.residents(id) ON DELETE CASCADE,
    doctor_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    doctor_name TEXT,
    diagnosis TEXT NOT NULL,
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT DEFAULT 'Active',
    notes TEXT,
    duplicated_from_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE SET NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    times_of_day JSONB DEFAULT '[]'::jsonb,
    quantity INTEGER,
    instructions TEXT,
    start_date DATE,
    end_date DATE,
    continuous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.room_prices (
    id SERIAL PRIMARY KEY,
    room_type TEXT NOT NULL UNIQUE,
    room_type_vi TEXT NOT NULL,
    price_monthly INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.care_level_prices (
    id SERIAL PRIMARY KEY,
    care_level INTEGER NOT NULL,
    care_level_vi TEXT NOT NULL,
    score_min INTEGER NOT NULL,
    score_max INTEGER NOT NULL,
    room_type TEXT NOT NULL,
    price_monthly INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (care_level, room_type)
);

CREATE TABLE IF NOT EXISTS public.meal_prices (
    id SERIAL PRIMARY KEY,
    meal_type TEXT NOT NULL UNIQUE,
    meal_type_vi TEXT NOT NULL,
    price_monthly INTEGER NOT NULL,
    price_daily INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.additional_services (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    service_name TEXT NOT NULL,
    service_name_vi TEXT NOT NULL,
    unit TEXT NOT NULL,
    unit_vi TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.absence_deductions (
    id SERIAL PRIMARY KEY,
    absence_type TEXT NOT NULL UNIQUE,
    absence_type_vi TEXT NOT NULL,
    deduction_daily INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.holiday_surcharges (
    id SERIAL PRIMARY KEY,
    holiday_type TEXT NOT NULL UNIQUE,
    holiday_type_vi TEXT NOT NULL,
    surcharge_daily INTEGER NOT NULL,
    dates_description TEXT,
    is_recurring BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.holiday_dates (
    id SERIAL PRIMARY KEY,
    holiday_type TEXT NOT NULL,
    holiday_date DATE NOT NULL UNIQUE,
    holiday_name TEXT,
    surcharge_amount INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deposit_config (
    id SERIAL PRIMARY KEY,
    deposit_type TEXT NOT NULL UNIQUE,
    deposit_type_vi TEXT NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    is_refundable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_usage (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    resident_id TEXT NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    quantity NUMERIC DEFAULT 1,
    unit_price NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    description TEXT,
    status TEXT DEFAULT 'Unbilled'
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role TEXT NOT NULL,
    module_key TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role, module_key)
);

ALTER TABLE IF EXISTS public.role_permissions
    ALTER COLUMN role SET NOT NULL,
    ALTER COLUMN module_key SET NOT NULL,
    ALTER COLUMN is_enabled SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE IF EXISTS public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Public Access Role Permissions" ON public.role_permissions;

CREATE POLICY "Public Access Role Permissions" ON public.role_permissions
    FOR ALL TO public
    USING (true)
    WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_blood_sugar_resident_date ON public.blood_sugar_records (resident_id, record_date DESC);
CREATE INDEX IF NOT EXISTS idx_shift_handover_floor_date ON public.shift_handovers (floor_id, shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_procedure_resident_date ON public.procedure_records (resident_id, record_date DESC);
CREATE INDEX IF NOT EXISTS idx_weight_resident_month ON public.weight_records (resident_id, record_month DESC);
CREATE INDEX IF NOT EXISTS idx_daily_monitoring_resident_date ON public.daily_monitoring (resident_id, record_date DESC);
CREATE INDEX IF NOT EXISTS idx_service_usage_resident_date ON public.service_usage (resident_id, date DESC);

INSERT INTO public.room_prices (room_type, room_type_vi, price_monthly, description) VALUES
    ('1-bed', 'Phòng 1 người', 15000000, 'Phòng riêng một giường'),
    ('2-bed', 'Phòng 2 người', 10000000, 'Phòng hai giường'),
    ('4-bed', 'Phòng 4 người', 6000000, 'Phòng bốn giường')
ON CONFLICT (room_type) DO UPDATE SET
    room_type_vi = EXCLUDED.room_type_vi,
    price_monthly = EXCLUDED.price_monthly,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO public.care_level_prices (care_level, care_level_vi, score_min, score_max, room_type, price_monthly) VALUES
    (1, 'Chăm sóc Cấp độ 1', 0, 10, '4-bed', 3000000),
    (1, 'Chăm sóc Cấp độ 1', 0, 10, '2-bed', 3000000),
    (1, 'Chăm sóc Cấp độ 1', 0, 10, '1-bed', 3000000),
    (2, 'Chăm sóc Cấp độ 2', 11, 20, '4-bed', 5000000),
    (2, 'Chăm sóc Cấp độ 2', 11, 20, '2-bed', 5000000),
    (2, 'Chăm sóc Cấp độ 2', 11, 20, '1-bed', 5000000),
    (3, 'Chăm sóc Cấp độ 3', 21, 30, '4-bed', 7000000),
    (3, 'Chăm sóc Cấp độ 3', 21, 30, '2-bed', 7000000),
    (3, 'Chăm sóc Cấp độ 3', 21, 30, '1-bed', 7000000),
    (4, 'Chăm sóc Cấp độ 4', 31, 40, '4-bed', 10000000),
    (4, 'Chăm sóc Cấp độ 4', 31, 40, '2-bed', 10000000),
    (4, 'Chăm sóc Cấp độ 4', 31, 40, '1-bed', 10000000)
ON CONFLICT (care_level, room_type) DO UPDATE SET
    care_level_vi = EXCLUDED.care_level_vi,
    score_min = EXCLUDED.score_min,
    score_max = EXCLUDED.score_max,
    price_monthly = EXCLUDED.price_monthly,
    updated_at = NOW();

INSERT INTO public.meal_prices (meal_type, meal_type_vi, price_monthly, price_daily, description) VALUES
    ('standard', 'Suất ăn tiêu chuẩn', 3900000, 130000, 'Ăn tại nhà ăn'),
    ('in_room', 'Suất ăn tại phòng', 4200000, 140000, 'Phục vụ tại phòng')
ON CONFLICT (meal_type) DO UPDATE SET
    meal_type_vi = EXCLUDED.meal_type_vi,
    price_monthly = EXCLUDED.price_monthly,
    price_daily = EXCLUDED.price_daily,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO public.additional_services (code, service_name, service_name_vi, unit, unit_vi, price, category, description) VALUES
    ('SVC001', 'Tube Feeding', 'Nuôi ăn qua sonde', 'month', 'Tháng', 1000000, 'special_care', 'Chăm sóc người ăn qua sonde'),
    ('SVC007', 'Blood Glucose Test', 'Test đường huyết', 'time', 'Lần', 10000, 'monitoring', 'Đo đường huyết mao mạch'),
    ('SVC008', 'Massage & Acupressure', 'Xoa bóp bấm huyệt', 'month', 'Tháng', 1800000, 'therapy', 'Xoa bóp trị liệu'),
    ('SVC016', 'Physical Therapy', 'Tập vận động / PHCN', 'month', 'Tháng', 2000000, 'therapy', 'Phục hồi chức năng hàng ngày'),
    ('SVC017', 'Insulin Injection', 'Tiêm insulin', 'month', 'Tháng', 500000, 'injection', 'Tiêm insulin theo chỉ định')
ON CONFLICT (code) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    service_name_vi = EXCLUDED.service_name_vi,
    unit = EXCLUDED.unit,
    unit_vi = EXCLUDED.unit_vi,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO public.absence_deductions (absence_type, absence_type_vi, deduction_daily, description) VALUES
    ('hospital', 'Đi viện', -200000, 'Khấu trừ khi người cao tuổi đi viện'),
    ('home_visit', 'Về nhà', -100000, 'Khấu trừ khi người cao tuổi về nhà')
ON CONFLICT (absence_type) DO UPDATE SET
    absence_type_vi = EXCLUDED.absence_type_vi,
    deduction_daily = EXCLUDED.deduction_daily,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO public.holiday_surcharges (holiday_type, holiday_type_vi, surcharge_daily, dates_description, is_recurring) VALUES
    ('regular_holiday', 'Lễ thường', 200000, 'Ngày lễ cố định trong năm', TRUE),
    ('tet', 'Tết Nguyên Đán', 300000, '29 tháng Chạp đến mùng 5 âm lịch', TRUE)
ON CONFLICT (holiday_type) DO UPDATE SET
    holiday_type_vi = EXCLUDED.holiday_type_vi,
    surcharge_daily = EXCLUDED.surcharge_daily,
    dates_description = EXCLUDED.dates_description,
    is_recurring = EXCLUDED.is_recurring,
    updated_at = NOW();

INSERT INTO public.deposit_config (deposit_type, deposit_type_vi, amount, description, is_refundable) VALUES
    ('admission', 'Tiền ký quỹ nhập viện', 10000000, 'Thu khi tiếp nhận người cao tuổi mới', TRUE)
ON CONFLICT (deposit_type) DO UPDATE SET
    deposit_type_vi = EXCLUDED.deposit_type_vi,
    amount = EXCLUDED.amount,
    description = EXCLUDED.description,
    is_refundable = EXCLUDED.is_refundable,
    updated_at = NOW();
