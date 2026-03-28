import { mkdir, readFile, writeFile as writeFileFs } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const HIS_SOURCE = 'HIS_IMPORT';

const collapseWhitespace = (value) => value.replace(/\s+/g, ' ').trim();

const normalizeMedicineText = (value) =>
  collapseWhitespace(String(value ?? '').replace(/\u00a0/g, ' '));

const normalizeMedicineRoute = (value) => {
  const normalized = normalizeMedicineText(value);
  return normalized === '.' ? '' : normalized;
};

const normalizeMedicineUnit = (value) => {
  const normalized = normalizeMedicineText(value);
  if (!normalized) return '';
  const withoutDiacritics = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (withoutDiacritics === withoutDiacritics.toLowerCase()) {
    return withoutDiacritics.charAt(0).toUpperCase() + withoutDiacritics.slice(1);
  }
  return withoutDiacritics;
};

const buildMedicineDisplayName = (activeIngredient, tradeName) => {
  const active = normalizeMedicineText(activeIngredient);
  const trade = normalizeMedicineText(tradeName);
  if (active && trade) return `${active} (${trade})`;
  return active || trade;
};

const parseServiceId = (value) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const chunk = (values, size) => {
  const groups = [];
  for (let index = 0; index < values.length; index += size) {
    groups.push(values.slice(index, index + size));
  }
  return groups;
};

const signatureOf = (row) =>
  JSON.stringify([
    row.tradeName,
    row.activeIngredient,
    row.unit ?? null,
    row.route ?? null,
  ]);

const compareByLatestServiceId = (left, right) => {
  const leftId = left.hisServiceId ?? Number.NEGATIVE_INFINITY;
  const rightId = right.hisServiceId ?? Number.NEGATIVE_INFINITY;
  return rightId - leftId;
};

export const normalizeHisMedicineRow = (row) => {
  const code = normalizeMedicineText(row?.servicecode);
  const tradeName = normalizeMedicineText(row?.servicename);
  const activeIngredient = normalizeMedicineText(row?.listmedicinehoatchat);

  if (!code || !activeIngredient || activeIngredient === '.') {
    return null;
  }

  const unit = normalizeMedicineUnit(row?.serviceunit) || null;
  const route = normalizeMedicineRoute(row?.dm_medicine_duongdung) || null;

  return {
    code,
    tradeName: tradeName || null,
    activeIngredient,
    unit,
    route,
    name: buildMedicineDisplayName(activeIngredient, tradeName),
    source: HIS_SOURCE,
    hisServiceId: parseServiceId(row?.serviceid),
  };
};

export const loadFixtureRows = async (fixturePath) => {
  const resolvedPath = path.resolve(process.cwd(), fixturePath);
  const fixtureContent = await readFile(resolvedPath, 'utf8');
  const parsed = JSON.parse(fixtureContent);

  if (!Array.isArray(parsed)) {
    throw new Error(`Fixture must contain a JSON array: ${resolvedPath}`);
  }

  return parsed;
};

export const prepareHisMedicineImport = (sourceRows) => {
  const normalizedRows = [];

  for (const row of sourceRows) {
    const normalized = normalizeHisMedicineRow(row);
    if (normalized) normalizedRows.push(normalized);
  }

  const groups = new Map();
  for (const row of normalizedRows) {
    if (!groups.has(row.code)) groups.set(row.code, []);
    groups.get(row.code).push(row);
  }

  const medicines = [];
  const conflicts = [];

  for (const [code, rows] of groups.entries()) {
    const latestRows = [...rows].sort(compareByLatestServiceId);
    const chosen = latestRows[0];
    medicines.push(chosen);

    const distinctSignatures = new Map();
    for (const row of rows) {
      const signature = signatureOf(row);
      const existing = distinctSignatures.get(signature);
      if (!existing || compareByLatestServiceId(existing, row) > 0) {
        distinctSignatures.set(signature, row);
      }
    }

    if (distinctSignatures.size > 1) {
      conflicts.push({
        code,
        chosen,
        candidates: [...distinctSignatures.values()].sort((left, right) => {
          const leftId = left.hisServiceId ?? Number.NEGATIVE_INFINITY;
          const rightId = right.hisServiceId ?? Number.NEGATIVE_INFINITY;
          return leftId - rightId;
        }),
      });
    }
  }

  return {
    medicines,
    conflicts,
    stats: {
      totalRows: sourceRows.length,
      validRows: normalizedRows.length,
      filteredRows: sourceRows.length - normalizedRows.length,
      uniqueCodes: medicines.length,
      conflicts: conflicts.length,
    },
  };
};

const requireEnv = (env, key) => {
  const value = env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const fetchHisRowsFromDatabase = async (env = process.env) => {
  const { Client } = await import('pg');
  const client = new Client({
    host: requireEnv(env, 'HIS_DB_HOST'),
    port: Number.parseInt(env.HIS_DB_PORT ?? '5432', 10),
    database: requireEnv(env, 'HIS_DB_NAME'),
    user: requireEnv(env, 'HIS_DB_USER'),
    password: requireEnv(env, 'HIS_DB_PASSWORD'),
  });

  await client.connect();

  try {
    const result = await client.query(`
      SELECT
        serviceid,
        servicecode,
        servicename,
        listmedicinehoatchat,
        serviceunit,
        dm_medicine_duongdung
      FROM public.tb_service
    `);

    return result.rows;
  } finally {
    await client.end();
  }
};

const mapMedicineToSupabaseRow = (medicine) => ({
  code: medicine.code,
  name: medicine.name,
  trade_name: medicine.tradeName,
  active_ingredient: medicine.activeIngredient,
  unit: medicine.unit,
  route: medicine.route,
  source: medicine.source,
  his_service_id: medicine.hisServiceId,
});

export const upsertMedicinesToSupabase = async (
  medicines,
  env = process.env,
  supabase = createClient(
    requireEnv(env, 'SUPABASE_URL'),
    requireEnv(env, 'SUPABASE_SERVICE_ROLE_KEY'),
  ),
) => {
  const codes = medicines.map((medicine) => medicine.code);
  const existingByCode = new Map();
  const nonHisCollisions = [];

  for (const codeGroup of chunk(codes, 500)) {
    const { data, error } = await supabase
      .from('medicines')
      .select('id, code, source, name')
      .in('code', codeGroup);

    if (error) throw error;
    for (const row of data ?? []) {
      if (row.source && row.source !== HIS_SOURCE) {
        nonHisCollisions.push({
          code: row.code,
          existingId: row.id,
          existingSource: row.source,
          existingName: row.name ?? null,
        });
        continue;
      }

      if (!existingByCode.has(row.code)) {
        existingByCode.set(row.code, row.id);
      }
    }
  }

  if (nonHisCollisions.length > 0) {
    const error = new Error(
      `Found ${nonHisCollisions.length} manual-code collisions in medicines catalog`,
    );
    error.collisions = nonHisCollisions;
    throw error;
  }

  const inserts = [];
  const updates = [];

  for (const medicine of medicines) {
    const payload = mapMedicineToSupabaseRow(medicine);
    const existingId = existingByCode.get(medicine.code);

    if (existingId) {
      updates.push({ id: existingId, payload });
    } else {
      inserts.push(payload);
    }
  }

  if (inserts.length > 0) {
    const { error } = await supabase.from('medicines').insert(inserts);
    if (error) throw error;
  }

  for (const update of updates) {
    const { error } = await supabase
      .from('medicines')
      .update(update.payload)
      .eq('id', update.id);

    if (error) throw error;
  }

  return inserts.length + updates.length;
};

const parseArgs = (argv) => {
  const options = {
    dryRun: false,
    apply: false,
    conflictsFile: null,
    fixture: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--apply') options.apply = true;
    else if (arg === '--conflicts-file') options.conflictsFile = argv[index + 1] ?? null;
    else if (arg === '--fixture') options.fixture = argv[index + 1] ?? null;
    else if (arg.startsWith('--conflicts-file=')) options.conflictsFile = arg.split('=')[1];
    else if (arg.startsWith('--fixture=')) options.fixture = arg.split('=')[1];

    if (arg === '--conflicts-file' || arg === '--fixture') {
      index += 1;
    }
  }

  if (!options.apply) options.dryRun = true;

  return options;
};

export const runImport = async (
  options,
  deps = {},
) => {
  const env = options.env ?? process.env;
  const ensureDir = deps.mkdir ?? mkdir;
  const writeFile = deps.writeFile ?? writeFileFs;
  const sourceRows = options.fixture
    ? await loadFixtureRows(options.fixture)
    : deps.fetchSourceRows
      ? await deps.fetchSourceRows(env)
      : await fetchHisRowsFromDatabase(env);

  const prepared = prepareHisMedicineImport(sourceRows);

  if (options.conflictsFile) {
    const resolvedConflictsPath = path.resolve(process.cwd(), options.conflictsFile);
    await ensureDir(path.dirname(resolvedConflictsPath), { recursive: true });
    await writeFile(
      resolvedConflictsPath,
      JSON.stringify(prepared.conflicts, null, 2),
      'utf8',
    );
  }

  let applied = 0;

  if (options.apply) {
    applied = deps.upsertMedicines
      ? await deps.upsertMedicines(prepared.medicines, env)
      : await upsertMedicinesToSupabase(prepared.medicines, env);
  }

  const stats = {
    ...prepared.stats,
    applied,
  };

  const mode = options.apply ? 'apply' : 'dry-run';
  const summary = `${mode}: ${stats.uniqueCodes} medicines prepared, ${stats.conflicts} conflicts`;

  return {
    ...prepared,
    stats,
    summary,
  };
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const result = await runImport(options);

  console.log(
    JSON.stringify(
      {
        mode: options.apply ? 'apply' : 'dry-run',
        summary: result.summary,
        stats: result.stats,
        conflictsFile: options.conflictsFile,
      },
      null,
      2,
    ),
  );
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
