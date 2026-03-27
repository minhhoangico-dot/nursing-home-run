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
      code: undefined,
      name: 'Desloratadine (Aerius 0.5mg/ml)',
      trade_name: 'Aerius 0.5mg/ml',
      active_ingredient: 'Desloratadine',
      unit: 'Lo',
      route: undefined,
      default_dosage: undefined,
      price: undefined,
      source: 'MANUAL',
      his_service_id: null,
    });
    expect(Date.parse(mapped.updated_at)).not.toBeNaN();
  });
});
