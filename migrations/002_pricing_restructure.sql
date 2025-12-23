-- 1. CLEANUP OLD TABLE IF EXISTS (Optional, depending on if we want to drop the old one completely)
-- DROP TABLE IF EXISTS service_prices; -- Keeping it for now until code is fully migrated might be safer, but user said "Clear all...".

-- 1. ROOM PRICES
DROP TABLE IF EXISTS room_prices CASCADE;
CREATE TABLE room_prices (
  id SERIAL PRIMARY KEY,
  room_type VARCHAR(20) NOT NULL UNIQUE,
  room_type_vi VARCHAR(50) NOT NULL,
  price_monthly INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO room_prices (room_type, room_type_vi, price_monthly, description) VALUES
('1-bed', 'Phòng 1 người', 6000000, 'Phòng đơn riêng biệt'),
('2-bed', 'Phòng 2 người', 4500000, 'Phòng 2 giường'),
('3-bed', 'Phòng 3 người', 4000000, 'Phòng 3 giường'),
('4-bed', 'Phòng 4+ người', 3500000, 'Phòng 4 giường trở lên');

-- 2. CARE LEVEL PRICES
DROP TABLE IF EXISTS care_level_prices CASCADE;
CREATE TABLE care_level_prices (
  id SERIAL PRIMARY KEY,
  care_level INTEGER NOT NULL CHECK (care_level BETWEEN 1 AND 4),
  care_level_vi VARCHAR(50) NOT NULL,
  score_min INTEGER NOT NULL,
  score_max INTEGER NOT NULL,
  room_type VARCHAR(20) NOT NULL,
  price_monthly INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(care_level, room_type)
);

INSERT INTO care_level_prices (care_level, care_level_vi, score_min, score_max, room_type, price_monthly) VALUES
(1, 'Cấp 1 - Tự lập', 0, 10, '4-bed', 2700000),
(1, 'Cấp 1 - Tự lập', 0, 10, '3-bed', 3000000),
(1, 'Cấp 1 - Tự lập', 0, 10, '2-bed', 3500000),
(1, 'Cấp 1 - Tự lập', 0, 10, '1-bed', 5000000),
(2, 'Cấp 2 - Hỗ trợ vừa', 11, 20, '4-bed', 3000000),
(2, 'Cấp 2 - Hỗ trợ vừa', 11, 20, '3-bed', 3500000),
(2, 'Cấp 2 - Hỗ trợ vừa', 11, 20, '2-bed', 4000000),
(2, 'Cấp 2 - Hỗ trợ vừa', 11, 20, '1-bed', 6000000),
(3, 'Cấp 3 - Hỗ trợ cao', 21, 30, '4-bed', 3500000),
(3, 'Cấp 3 - Hỗ trợ cao', 21, 30, '3-bed', 4000000),
(3, 'Cấp 3 - Hỗ trợ cao', 21, 30, '2-bed', 4500000),
(3, 'Cấp 3 - Hỗ trợ cao', 21, 30, '1-bed', 7000000),
(4, 'Cấp 4 - Chăm sóc toàn phần', 31, 40, '4-bed', 3500000);

-- 3. MEAL PRICES
DROP TABLE IF EXISTS meal_prices CASCADE;
CREATE TABLE meal_prices (
  id SERIAL PRIMARY KEY,
  meal_type VARCHAR(20) NOT NULL UNIQUE,
  meal_type_vi VARCHAR(50) NOT NULL,
  price_monthly INTEGER NOT NULL,
  price_daily INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO meal_prices (meal_type, meal_type_vi, price_monthly, price_daily, description) VALUES
('standard', 'Ăn tại nhà ăn', 3900000, 130000, 'Bữa ăn chuẩn tại nhà ăn chung'),
('in_room', 'Ăn tại phòng', 4200000, 140000, 'Có nhân viên phục vụ tại phòng (+300.000đ/tháng)');

-- 4. ADDITIONAL SERVICES
DROP TABLE IF EXISTS additional_services CASCADE;
CREATE TABLE additional_services (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  service_name VARCHAR(100) NOT NULL,
  service_name_vi VARCHAR(100) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unit_vi VARCHAR(50) NOT NULL,
  price INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO additional_services (code, service_name, service_name_vi, unit, unit_vi, price, category, description) VALUES
('SVC001', 'Tube Feeding', 'Nuôi ăn qua Sonde', 'month', 'Tháng', 1000000, 'special_care', 'Chăm sóc NCT ăn qua sonde'),
('SVC002', 'Tracheostomy Care', 'Chăm sóc mở nội khí quản', 'month', 'Tháng', 2000000, 'special_care', 'Chăm sóc NCT có mở nội khí quản'),
('SVC003', 'Urinary Catheter Care', 'Chăm sóc Sonde tiểu', 'month', 'Tháng', 1000000, 'special_care', 'Chăm sóc NCT có sonde tiểu'),
('SVC004', 'Bladder Irrigation', 'Rửa bàng quang', 'time', 'Lần', 100000, 'special_care', 'Rửa bàng quang theo chỉ định'),
('SVC005', 'Basic Wound Dressing', 'Thay băng vết thương thường', 'month', 'Tháng', 1000000, 'wound_care', 'Thay băng vết thương đơn giản'),
('SVC006', 'Complex Wound Dressing', 'Thay băng vết loét phức tạp', 'month', 'Tháng', 2000000, 'wound_care', 'Thay băng vết loét, vết mổ phức tạp'),
('SVC007', 'Blood Glucose Test', 'Test đường huyết', 'time', 'Lần', 10000, 'monitoring', 'Đo đường huyết mao mạch'),
('SVC008', 'Massage & Acupressure', 'Xoa bóp, bấm huyệt', 'month', 'Tháng (3 buổi/tuần)', 1800000, 'therapy', 'Xoa bóp bấm huyệt 3 buổi/tuần'),
('SVC009', 'Acupuncture', 'Châm cứu', 'time', 'Lần', 100000, 'therapy', 'Châm cứu theo chỉ định'),
('SVC010', 'Electroacupuncture', 'Điện châm', 'time', 'Lần', 100000, 'therapy', 'Điện châm theo chỉ định'),
('SVC011', 'Aquapuncture', 'Thủy châm', 'time', 'Lần', 70000, 'therapy', 'Thủy châm theo chỉ định'),
('SVC012', 'Infrared Therapy', 'Hồng ngoại', 'time', 'Lần', 50000, 'therapy', 'Chiếu hồng ngoại'),
('SVC013', 'Electrical Stimulation', 'Điện xung', 'time', 'Lần', 100000, 'therapy', 'Điện xung trị liệu'),
('SVC014', 'Moxibustion', 'Cứu (Ngải cứu)', 'time', 'Lần', 150000, 'therapy', 'Cứu ngải theo Y học cổ truyền'),
('SVC015', 'Herbal Soaking', 'Ngâm thuốc YHCT', 'time', 'Lần', 150000, 'therapy', 'Ngâm thuốc Y học cổ truyền'),
('SVC016', 'Physical Therapy', 'Tập vận động/PHCN', 'month', 'Tháng', 2000000, 'therapy', 'Tập phục hồi chức năng hàng ngày'),
('SVC017', 'Insulin Injection', 'Tiêm Insulin', 'month', 'Tháng', 500000, 'injection', 'Tiêm insulin theo chỉ định bác sĩ');

-- 5. ABSENCE DEDUCTIONS
DROP TABLE IF EXISTS absence_deductions CASCADE;
CREATE TABLE absence_deductions (
  id SERIAL PRIMARY KEY,
  absence_type VARCHAR(30) NOT NULL UNIQUE,
  absence_type_vi VARCHAR(50) NOT NULL,
  deduction_daily INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO absence_deductions (absence_type, absence_type_vi, deduction_daily, description) VALUES
('hospital', 'Đi viện (bất khả kháng)', -200000, 'NCT phải nhập viện điều trị'),
('home_visit', 'Về nhà', -100000, 'NCT về nhà với gia đình');

-- 6. HOLIDAY SURCHARGES
DROP TABLE IF EXISTS holiday_surcharges CASCADE;
CREATE TABLE holiday_surcharges (
  id SERIAL PRIMARY KEY,
  holiday_type VARCHAR(30) NOT NULL UNIQUE,
  holiday_type_vi VARCHAR(50) NOT NULL,
  surcharge_daily INTEGER NOT NULL,
  dates_description TEXT,
  is_recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO holiday_surcharges (holiday_type, holiday_type_vi, surcharge_daily, dates_description, is_recurring) VALUES
('regular_holiday', 'Lễ thường', 200000, '10/3 ÂL, 30/4-1/5, 2/9, 1/1 Dương lịch', true),
('tet', 'Tết Nguyên Đán', 300000, '29-30 tháng Chạp + Mùng 1-5 tháng Giêng Âm lịch', true);

-- 7. HOLIDAY DATES (for specific year calculation)
DROP TABLE IF EXISTS holiday_dates CASCADE;
CREATE TABLE holiday_dates (
  id SERIAL PRIMARY KEY,
  holiday_type VARCHAR(30) NOT NULL,
  holiday_date DATE NOT NULL,
  holiday_name VARCHAR(100),
  surcharge_amount INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(holiday_date)
);

-- 2025 Holidays
INSERT INTO holiday_dates (holiday_type, holiday_date, holiday_name, surcharge_amount, year) VALUES
('regular_holiday', '2025-01-01', 'Tết Dương lịch', 200000, 2025),
('regular_holiday', '2025-04-07', 'Giỗ Tổ Hùng Vương (10/3 ÂL)', 200000, 2025),
('regular_holiday', '2025-04-30', 'Ngày Giải phóng miền Nam', 200000, 2025),
('regular_holiday', '2025-05-01', 'Quốc tế Lao động', 200000, 2025),
('regular_holiday', '2025-09-02', 'Quốc khánh', 200000, 2025),
('tet', '2025-01-28', 'Tết Nguyên Đán - 29 Chạp', 300000, 2025),
('tet', '2025-01-29', 'Tết Nguyên Đán - 30 Chạp', 300000, 2025),
('tet', '2025-01-30', 'Tết Nguyên Đán - Mùng 1', 300000, 2025),
('tet', '2025-01-31', 'Tết Nguyên Đán - Mùng 2', 300000, 2025),
('tet', '2025-02-01', 'Tết Nguyên Đán - Mùng 3', 300000, 2025),
('tet', '2025-02-02', 'Tết Nguyên Đán - Mùng 4', 300000, 2025),
('tet', '2025-02-03', 'Tết Nguyên Đán - Mùng 5', 300000, 2025);

-- 8. DEPOSIT CONFIG
DROP TABLE IF EXISTS deposit_config CASCADE;
CREATE TABLE deposit_config (
  id SERIAL PRIMARY KEY,
  deposit_type VARCHAR(30) NOT NULL UNIQUE,
  deposit_type_vi VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  is_refundable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO deposit_config (deposit_type, deposit_type_vi, amount, description, is_refundable) VALUES
('admission', 'Tiền ký quỹ nhập viện', 10000000, 'Thu khi tiếp nhận NCT mới, hoàn trả khi xuất viện', true);
