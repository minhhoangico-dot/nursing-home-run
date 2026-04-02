import { describe, expect, it } from 'vitest';
import { mapMedicineRowFromDb, mapMedicineRowToDb } from './medicineMappers';

describe('mapMedicineRowFromDb', () => {
  it('maps the expanded medicine row from Supabase into the UI model', () => {
    expect(
      mapMedicineRowFromDb({
        id: '1',
        code: 'BSGD00012',
        name: 'Desloratadine (Aerius 0.5mg/ml)',
        trade_name: 'Aerius 0.5mg/ml',
        active_ingredient: 'Desloratadine',
        unit: 'Lo',
        route: 'Uong',
        default_dosage: '5 ml',
        price: 12500,
        source: 'HIS_IMPORT',
        his_service_id: 11253,
      }),
    ).toMatchObject({
      id: '1',
      code: 'BSGD00012',
      name: 'Desloratadine (Aerius 0.5mg/ml)',
      tradeName: 'Aerius 0.5mg/ml',
      activeIngredient: 'Desloratadine',
      unit: 'Lo',
      route: 'Uong',
      defaultDosage: '5 ml',
      price: 12500,
      source: 'HIS_IMPORT',
      hisServiceId: 11253,
    });
  });

  it('builds the display name when the database row does not provide one', () => {
    expect(
      mapMedicineRowFromDb({
        id: '2',
        code: 'BSGD00013',
        name: null,
        trade_name: 'Aerius 0.5mg/ml',
        active_ingredient: 'Desloratadine',
        unit: 'Lo',
      }),
    ).toMatchObject({
      name: 'Desloratadine (Aerius 0.5mg/ml)',
    });
  });

  it('rebuilds the display name when the database row stores an empty string', () => {
    expect(
      mapMedicineRowFromDb({
        id: '3',
        name: '   ',
        trade_name: 'Aerius 0.5mg/ml',
        active_ingredient: 'Desloratadine',
        unit: 'Lo',
      }),
    ).toMatchObject({
      name: 'Desloratadine (Aerius 0.5mg/ml)',
    });
  });

  it('falls back to the active ingredient when the trade name is missing', () => {
    expect(
      mapMedicineRowFromDb({
        id: '4',
        name: '',
        trade_name: '   ',
        active_ingredient: 'Desloratadine',
        unit: 'Lo',
      }),
    ).toMatchObject({
      name: 'Desloratadine',
      tradeName: undefined,
    });
  });
});

describe('mapMedicineRowToDb', () => {
  it('maps the expanded UI medicine model into the database payload', () => {
    const mapped = mapMedicineRowToDb({
      code: 'BSGD00012',
      name: 'Desloratadine (Aerius 0.5mg/ml)',
      tradeName: 'Aerius 0.5mg/ml',
      activeIngredient: 'Desloratadine',
      unit: 'Lo',
      route: 'Uong',
      defaultDosage: '5 ml',
      price: 12500,
      source: 'HIS_IMPORT',
      hisServiceId: 11253,
    });

    expect(mapped).toMatchObject({
      code: 'BSGD00012',
      name: 'Desloratadine (Aerius 0.5mg/ml)',
      trade_name: 'Aerius 0.5mg/ml',
      active_ingredient: 'Desloratadine',
      unit: 'Lo',
      route: 'Uong',
      default_dosage: '5 ml',
      price: 12500,
      source: 'HIS_IMPORT',
      his_service_id: 11253,
    });
    expect(Date.parse(mapped.updated_at)).not.toBeNaN();
  });

  it('defaults manual source and null his service id for partial medicines', () => {
    const mapped = mapMedicineRowToDb({
      tradeName: 'Aerius 0.5mg/ml',
      activeIngredient: 'Desloratadine',
      unit: 'Lo',
    });

    expect(mapped).toMatchObject({
      code: null,
      name: 'Desloratadine (Aerius 0.5mg/ml)',
      trade_name: 'Aerius 0.5mg/ml',
      active_ingredient: 'Desloratadine',
      unit: 'Lo',
      route: null,
      default_dosage: null,
      price: undefined,
      source: 'MANUAL',
      his_service_id: null,
    });
    expect(Date.parse(mapped.updated_at)).not.toBeNaN();
  });

  it('normalizes blank optional fields to null and derives the fallback name', () => {
    const mapped = mapMedicineRowToDb({
      code: '   ',
      tradeName: '   ',
      activeIngredient: 'Desloratadine',
      unit: 'Lo',
      route: ' ',
      defaultDosage: '   ',
    });

    expect(mapped).toMatchObject({
      code: null,
      name: 'Desloratadine',
      trade_name: null,
      active_ingredient: 'Desloratadine',
      unit: 'Lo',
      route: null,
      default_dosage: null,
      source: 'MANUAL',
      his_service_id: null,
    });
  });

  it('omits source and his service id during partial update mapping when they are not provided', () => {
    const mapped = mapMedicineRowToDb(
      {
        tradeName: 'Aerius 0.5mg/ml',
      },
      { forUpdate: true },
    );

    expect(mapped).toMatchObject({
      trade_name: 'Aerius 0.5mg/ml',
    });
    expect(mapped).not.toHaveProperty('source');
    expect(mapped).not.toHaveProperty('his_service_id');
    expect(mapped).not.toHaveProperty('name');
    expect(Date.parse(mapped.updated_at)).not.toBeNaN();
  });
});
