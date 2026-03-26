import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.VOSTRO_SUPABASE_URL || 'https://supabase.fdc-nhanvien.org';
const serviceRoleKey = process.env.VOSTRO_SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  throw new Error('Missing VOSTRO_SUPABASE_SERVICE_ROLE_KEY');
}

const sqlEndpoint = new URL('/pg/query', supabaseUrl).toString();
const sqlHeaders = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
};
const restHeaders = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
};

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const users = [
  { id: 'user-admin', name: 'Hệ Thống FDC', username: 'admin', password: 'admin123', role: 'ADMIN' },
  { id: 'user-hbminh', name: 'H.B Minh', username: 'hbminh', password: 'password123', role: 'ADMIN' },
  { id: 'user-doctor', name: 'Lê Minh Khánh', username: 'doctor', password: 'password', role: 'DOCTOR' },
  { id: 'user-supervisor', name: 'Nguyễn Thị Lan', username: 'supervisor', password: 'password', role: 'SUPERVISOR', floor: 'Tầng 3' },
  { id: 'user-accountant', name: 'Phan Thanh Tùng', username: 'accountant', password: 'password', role: 'ACCOUNTANT' },
  { id: 'user-nurse', name: 'Trần Văn Hùng', username: 'nurse', password: 'password', role: 'NURSE', floor: 'Tầng 3' },
];

const residents = [
  {
    id: 'R001',
    name: 'Nguyễn Văn Minh',
    dob: '1945-05-15',
    gender: 'Nam',
    room: '101',
    bed: 'A',
    floor: 'Tầng 1',
    building: 'Tòa A',
    care_level: 1,
    status: 'Active',
    admission_date: '2023-01-10',
    guardian_name: 'Nguyễn Minh Tuấn',
    guardian_phone: '0903123456',
    balance: -8500000,
    assessments: [],
    prescriptions: [],
    medical_visits: [],
    special_monitoring: [],
    medical_history: [],
    allergies: [],
    vital_signs: [],
    care_logs: [],
    current_condition_note: 'Sức khỏe ổn định, tự sinh hoạt tốt.',
    last_medical_update: '2023-10-15',
    room_type: '1 Giường',
    diet_type: 'Normal',
    is_diabetic: false,
  },
  {
    id: 'R002',
    name: 'Lê Thị Lan',
    dob: '1950-11-20',
    gender: 'Nữ',
    room: '202',
    bed: 'B',
    floor: 'Tầng 2',
    building: 'Tòa A',
    care_level: 2,
    status: 'Active',
    admission_date: '2023-03-15',
    guardian_name: 'Trần Thị Mỹ',
    guardian_phone: '0988776655',
    balance: 0,
    assessments: [],
    prescriptions: [],
    medical_visits: [],
    special_monitoring: [],
    medical_history: [],
    allergies: [],
    vital_signs: [],
    care_logs: [],
    current_condition_note: 'Cần hỗ trợ nhắc uống thuốc và theo dõi ăn uống đồ ngọt.',
    last_medical_update: '2023-09-20',
    room_type: '2 Giường',
    diet_type: 'Porridge',
    diet_note: 'Hạn chế tinh bột và đường',
    is_diabetic: true,
  },
  {
    id: 'R003',
    name: 'Trần Thế Hiển',
    dob: '1938-02-10',
    gender: 'Nam',
    room: '305',
    bed: 'A',
    floor: 'Tầng 3',
    building: 'Tòa A',
    care_level: 4,
    status: 'Active',
    admission_date: '2022-11-05',
    guardian_name: 'Trần Thế Anh',
    guardian_phone: '0912999888',
    balance: -12500000,
    assessments: [],
    prescriptions: [],
    medical_visits: [],
    special_monitoring: [],
    medical_history: [],
    allergies: [],
    vital_signs: [],
    care_logs: [],
    current_condition_note: 'Cần chăm sóc cấp độ cao nhất.',
    last_medical_update: '2023-10-10',
    room_type: '4 Giường',
    diet_type: 'Pureed',
    diet_note: 'Thức ăn xay nhuyễn, tránh sặc',
    is_diabetic: false,
  },
];

const bloodSugarRecords = [
  {
    resident_id: 'R002',
    record_date: '2026-03-22',
    morning_before_meal: 6.2,
    morning_after_meal: 8.1,
    insulin_units: 10,
    insulin_time: 'morning',
    administered_by: 'Lê Minh Khánh',
    notes: 'Ổn định',
  },
  {
    resident_id: 'R002',
    record_date: '2026-03-23',
    morning_before_meal: 5.8,
    morning_after_meal: 7.6,
    insulin_units: 10,
    insulin_time: 'morning',
    administered_by: 'Trần Văn Hùng',
    notes: 'Không ghi nhận bất thường',
  },
];

const weightRecords = [
  { resident_id: 'R001', record_month: '2026-02', weight_kg: 63.5, recorded_by: 'Hệ Thống FDC' },
  { resident_id: 'R001', record_month: '2026-03', weight_kg: 63.0, recorded_by: 'Hệ Thống FDC' },
  { resident_id: 'R002', record_month: '2026-02', weight_kg: 52.1, recorded_by: 'Hệ Thống FDC' },
  { resident_id: 'R002', record_month: '2026-03', weight_kg: 51.8, recorded_by: 'Hệ Thống FDC' },
  { resident_id: 'R003', record_month: '2026-03', weight_kg: 48.6, recorded_by: 'Hệ Thống FDC' },
];

const dailyMonitoring = [
  {
    resident_id: 'R001',
    record_date: '2026-03-24',
    sp02: 98,
    pulse: 72,
    temperature: 36.6,
    bp_morning: '125/80',
    bowel_movements: '1x',
    notes: 'Ổn định',
    created_by: 'user-nurse',
  },
  {
    resident_id: 'R003',
    record_date: '2026-03-24',
    sp02: 96,
    pulse: 78,
    temperature: 36.8,
    bp_morning: '130/85',
    bowel_movements: '1x',
    notes: 'Cần theo dõi thêm',
    created_by: 'user-nurse',
  },
];

const procedureRecords = [
  {
    resident_id: 'R002',
    record_date: '2026-03-24',
    injection: true,
    iv_drip: false,
    gastric_tube: false,
    urinary_catheter: false,
    bladder_wash: false,
    blood_sugar_test: true,
    blood_pressure: true,
    oxygen_therapy: false,
    wound_dressing: false,
    injection_count: 1,
    iv_drip_count: 0,
    gastric_tube_count: 0,
    urinary_catheter_count: 0,
    bladder_wash_count: 0,
    blood_sugar_test_count: 1,
    blood_pressure_count: 1,
    oxygen_therapy_count: 0,
    wound_dressing_count: 0,
    performed_by: 'Trần Văn Hùng',
    notes: 'Tiêm insulin buổi sáng',
    iv_drip_details: [],
    created_by: 'user-nurse',
  },
];

const shiftHandoverId = '11111111-1111-4111-8111-111111111111';
const shiftHandovers = [
  {
    id: shiftHandoverId,
    shift_date: '2026-03-24',
    shift_time: '06:00',
    floor_id: 'Tầng 3',
    handover_staff: ['Nguyễn Thị Lan'],
    receiver_staff: ['Trần Văn Hùng'],
    total_residents: 3,
    created_by: 'user-supervisor',
  },
];

const shiftHandoverNotes = [
  {
    id: '22222222-2222-4222-8222-222222222222',
    handover_id: shiftHandoverId,
    resident_id: 'R002',
    resident_name: 'Lê Thị Lan',
    content: 'Đường huyết sáng ổn định, tiếp tục theo dõi sau ăn.',
  },
];

async function runSql(label, query) {
  const response = await fetch(sqlEndpoint, {
    method: 'POST',
    headers: sqlHeaders,
    body: JSON.stringify({ query }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${label} failed (${response.status}): ${text}`);
  }

  console.log(`Applied ${label}`);
}

async function waitForRestTable(table, attempts = 10, delayMs = 500) {
  const endpoint = new URL(`/rest/v1/${table}?select=*&limit=1`, supabaseUrl).toString();

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(endpoint, { headers: restHeaders });
    if (response.ok) {
      return;
    }

    const body = await response.text();
    if (!body.includes('PGRST205') || attempt === attempts) {
      throw new Error(`Table ${table} not ready via PostgREST (${response.status}): ${body}`);
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

async function upsert(table, rows, options) {
  if (!rows.length) return;
  const { error } = await admin.from(table).upsert(rows, options);
  if (error) {
    throw error;
  }
  console.log(`Seeded ${table}`);
}

async function main() {
  const sqlPath = join(__dirname, 'sql', 'vostro-bootstrap.sql');
  const bootstrapSql = await readFile(sqlPath, 'utf8');

  await runSql('bootstrap schema', bootstrapSql);
  await runSql('reload PostgREST schema cache', "NOTIFY pgrst, 'reload schema';");
  await waitForRestTable('users');

  await upsert('users', users, { onConflict: 'id' });
  await upsert('residents', residents, { onConflict: 'id' });
  await upsert('blood_sugar_records', bloodSugarRecords, { onConflict: 'resident_id,record_date' });
  await upsert('weight_records', weightRecords, { onConflict: 'resident_id,record_month' });
  await upsert('daily_monitoring', dailyMonitoring, { onConflict: 'resident_id,record_date' });
  await upsert('procedure_records', procedureRecords, { onConflict: 'resident_id,record_date' });
  await upsert('shift_handovers', shiftHandovers, { onConflict: 'id' });
  await upsert('shift_handover_notes', shiftHandoverNotes, { onConflict: 'id' });

  console.log('Vostro Supabase bootstrap complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
