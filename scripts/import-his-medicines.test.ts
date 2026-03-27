import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  loadFixtureRows,
  normalizeHisMedicineRow,
  prepareHisMedicineImport,
  runImport,
} from './import-his-medicines.mjs';

const fixturePath = path.resolve(
  process.cwd(),
  'scripts/fixtures/his-medicine-sample.json',
);

describe('normalizeHisMedicineRow', () => {
  it('maps a HIS service row into the catalog import shape', () => {
    expect(
      normalizeHisMedicineRow({
        serviceid: 11253,
        servicecode: 'BSGD00012',
        servicename: 'Aerius 0.5mg/ml',
        listmedicinehoatchat: 'Desloratadine',
        serviceunit: 'lo',
        dm_medicine_duongdung: 'Uong',
      }),
    ).toEqual({
      code: 'BSGD00012',
      tradeName: 'Aerius 0.5mg/ml',
      activeIngredient: 'Desloratadine',
      unit: 'Lo',
      route: 'Uong',
      name: 'Desloratadine (Aerius 0.5mg/ml)',
      source: 'HIS_IMPORT',
      hisServiceId: 11253,
    });
  });

  it('filters out unusable HIS rows', () => {
    expect(
      normalizeHisMedicineRow({
        serviceid: 50002,
        servicecode: 'BSGD00999',
        servicename: 'Missing Active',
        listmedicinehoatchat: '.',
        serviceunit: 'vien',
        dm_medicine_duongdung: 'Uong',
      }),
    ).toBeNull();
  });
});

describe('prepareHisMedicineImport', () => {
  it('dedupes by code using the newest service id and records conflicts by distinct signature', async () => {
    const sourceRows = JSON.parse(await readFile(fixturePath, 'utf8'));

    const result = prepareHisMedicineImport(sourceRows);

    expect(result.medicines).toEqual([
      {
        code: 'BSGD00012',
        tradeName: 'Aerius 0.5mg/ml',
        activeIngredient: 'Desloratadine',
        unit: 'Lo',
        route: 'Uong',
        name: 'Desloratadine (Aerius 0.5mg/ml)',
        source: 'HIS_IMPORT',
        hisServiceId: 11254,
      },
      {
        code: 'BSGD00077',
        tradeName: 'Beta Tabs',
        activeIngredient: 'Beta',
        unit: 'Vien',
        route: 'Uong',
        name: 'Beta (Beta Tabs)',
        source: 'HIS_IMPORT',
        hisServiceId: 30002,
      },
      {
        code: 'BSGD00088',
        tradeName: 'Route Optional',
        activeIngredient: 'Gamma',
        unit: 'Goi',
        route: null,
        name: 'Gamma (Route Optional)',
        source: 'HIS_IMPORT',
        hisServiceId: 40001,
      },
    ]);
    expect(result.conflicts).toEqual([
      {
        code: 'BSGD00077',
        chosen: {
          code: 'BSGD00077',
          tradeName: 'Beta Tabs',
          activeIngredient: 'Beta',
          unit: 'Vien',
          route: 'Uong',
          name: 'Beta (Beta Tabs)',
          source: 'HIS_IMPORT',
          hisServiceId: 30002,
        },
        candidates: [
          {
            code: 'BSGD00077',
            tradeName: 'Alpha Tabs',
            activeIngredient: 'Alpha',
            unit: 'Vien',
            route: 'Uong',
            name: 'Alpha (Alpha Tabs)',
            source: 'HIS_IMPORT',
            hisServiceId: 30001,
          },
          {
            code: 'BSGD00077',
            tradeName: 'Beta Tabs',
            activeIngredient: 'Beta',
            unit: 'Vien',
            route: 'Uong',
            name: 'Beta (Beta Tabs)',
            source: 'HIS_IMPORT',
            hisServiceId: 30002,
          },
        ],
      },
    ]);
    expect(result.stats).toMatchObject({
      totalRows: 8,
      validRows: 5,
      filteredRows: 3,
      uniqueCodes: 3,
      conflicts: 1,
    });
  });
});

describe('runImport', () => {
  it('supports deterministic fixture-backed dry runs without writing to Supabase', async () => {
    const writes: string[] = [];

    const result = await runImport(
      {
        dryRun: true,
        fixture: fixturePath,
        conflictsFile: path.resolve(process.cwd(), 'tmp-his-conflicts.json'),
      },
      {
        writeFile: async (filePath, content) => {
          writes.push(`${filePath}:${content.length}`);
        },
        upsertMedicines: async () => {
          throw new Error('dry-run should not upsert');
        },
      },
    );

    expect(result.summary).toContain('dry-run');
    expect(result.stats).toMatchObject({
      totalRows: 8,
      validRows: 5,
      uniqueCodes: 3,
      conflicts: 1,
      applied: 0,
    });
    expect(writes).toHaveLength(1);
  });

  it('loads fixture rows from disk', async () => {
    const rows = await loadFixtureRows(fixturePath);

    expect(rows).toHaveLength(8);
    expect(rows[0]).toMatchObject({
      servicecode: 'BSGD00012',
    });
  });
});
