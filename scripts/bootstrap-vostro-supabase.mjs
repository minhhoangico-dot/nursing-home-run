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
  { id: 'user-admin', name: 'Hệ Thống FDC', username: 'admin', password: 'admin123', role: 'ADMIN', is_active: true },
  { id: 'user-hbminh', name: 'H.B Minh', username: 'hbminh', password: 'password123', role: 'ADMIN', is_active: true },
  { id: 'user-doctor', name: 'Lê Minh Khánh', username: 'doctor', password: 'password', role: 'DOCTOR', is_active: true },
  { id: 'user-supervisor', name: 'Nguyễn Thị Lan', username: 'supervisor', password: 'password', role: 'SUPERVISOR', floor: 'Tầng 3', is_active: true },
  { id: 'user-accountant', name: 'Phan Thanh Tùng', username: 'accountant', password: 'password', role: 'ACCOUNTANT', is_active: true },
  { id: 'user-nurse', name: 'Trần Văn Hùng', username: 'nurse', password: 'password', role: 'NURSE', floor: 'Tầng 3', is_active: true },
];

const seedUserIdsByUsername = new Map(users.map((user) => [user.username, user.id]));

const roles = ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'ACCOUNTANT', 'NURSE', 'CAREGIVER'];

const approvedRolePermissions = {
  residents: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'ACCOUNTANT', 'NURSE'],
  rooms: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'ACCOUNTANT', 'NURSE'],
  nutrition: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE', 'CAREGIVER'],
  visitors: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE', 'CAREGIVER'],
  daily_monitoring: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE'],
  procedures: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE'],
  weight_tracking: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE'],
  incidents: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE', 'CAREGIVER'],
  maintenance: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'ACCOUNTANT'],
  forms: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE'],
  finance: ['ADMIN', 'ACCOUNTANT'],
  settings: ['ADMIN'],
};

const approvedPermissionSet = new Set(
  Object.entries(approvedRolePermissions).flatMap(([module_key, allowedRoles]) =>
    allowedRoles.map((role) => `${role}:${module_key}`),
  ),
);

const managedModules = Object.keys(approvedRolePermissions);

const rolePermissions = managedModules.flatMap((module_key) =>
  roles.map((role) => ({
    role,
    module_key,
    is_enabled: approvedPermissionSet.has(`${role}:${module_key}`),
  })),
);

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

function resolveUserIdAliases(resolvedUsers) {
  const aliases = new Map();

  for (const user of resolvedUsers) {
    const seedId = seedUserIdsByUsername.get(user.username);
    if (seedId) {
      aliases.set(seedId, user.id);
    }
    aliases.set(user.username, user.id);
  }

  return aliases;
}

function remapCreatedBy(rows, aliases) {
  return rows.map((row) => {
    if (!row.created_by) {
      return row;
    }

    const resolvedId = aliases.get(row.created_by);
    if (!resolvedId || resolvedId === row.created_by) {
      return row;
    }

    return { ...row, created_by: resolvedId };
  });
}

function buildApprovedRolePermissionPairsSql() {
  return rolePermissions.map(({ role, module_key }) => `('${role}', '${module_key}')`).join(',\n    ');
}

function buildPruneRolePermissionsSql() {
  return `WITH approved(role, module_key) AS (
    VALUES
    ${buildApprovedRolePermissionPairsSql()}
)
DELETE FROM public.role_permissions rp
WHERE NOT EXISTS (
    SELECT 1
    FROM approved
    WHERE approved.role = rp.role
      AND approved.module_key = rp.module_key
);`;
}

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
  await Promise.all([waitForRestTable('users'), waitForRestTable('role_permissions')]);

  const { data: existingUsers, error: existingUsersError } = await admin
    .from('users')
    .select('id, username')
    .in('username', users.map((user) => user.username));

  if (existingUsersError) {
    throw existingUsersError;
  }

  const resolvedUsersByUsername = new Map(
    users.map((user) => [
      user.username,
      existingUsers?.find((row) => row.username === user.username)?.id ?? user.id,
    ]),
  );
  const resolvedUsers = users.map((user) => ({
    ...user,
    id: resolvedUsersByUsername.get(user.username),
  }));
  const userIdAliases = resolveUserIdAliases(resolvedUsers);

  await upsert('users', resolvedUsers, { onConflict: 'id' });
  await upsert('role_permissions', rolePermissions, { onConflict: 'role,module_key' });
  await upsert('residents', residents, { onConflict: 'id' });
  await upsert('blood_sugar_records', bloodSugarRecords, { onConflict: 'resident_id,record_date' });
  await upsert('weight_records', weightRecords, { onConflict: 'resident_id,record_month' });
  await upsert('daily_monitoring', remapCreatedBy(dailyMonitoring, userIdAliases), { onConflict: 'resident_id,record_date' });
  await upsert('procedure_records', remapCreatedBy(procedureRecords, userIdAliases), { onConflict: 'resident_id,record_date' });
  await upsert('shift_handovers', remapCreatedBy(shiftHandovers, userIdAliases), { onConflict: 'id' });
  await upsert('shift_handover_notes', shiftHandoverNotes, { onConflict: 'id' });
  await runSql('prune role_permissions', buildPruneRolePermissionsSql());

  console.log('Vostro Supabase bootstrap complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
