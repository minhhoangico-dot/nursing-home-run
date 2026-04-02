import { describe, expect, test } from 'vitest';

import { mapMedicineRow, mapPrescriptionRow } from './prescriptionMappers';

describe('mapMedicineRow', () => {
  test('maps medicine metadata needed by autocomplete secondary lines', () => {
    const result = mapMedicineRow({
      id: 'm1',
      name: 'Amlodipin',
      active_ingredient: 'Amlodipine',
      strength: '5mg',
      route: 'Uống',
      unit: 'viên',
      drug_group: 'Tim mạch',
      default_dosage: '1 viên',
      default_frequency: 1,
      price: 1000,
    });

    expect(result.strength).toBe('5mg');
    expect(result.route).toBe('Uống');
    expect(result.defaultFrequency).toBe(1);
  });
});

describe('mapPrescriptionRow', () => {
  test('normalizes legacy cancelled status into paused', () => {
    const result = mapPrescriptionRow({
      id: 'p1',
      code: 'DT-001',
      resident_id: 'r1',
      doctor_id: 'u1',
      doctor_name: 'BS. Mai',
      diagnosis: 'Tăng huyết áp',
      prescription_date: '2026-03-30',
      start_date: '2026-03-30',
      end_date: null,
      status: 'Cancelled',
      notes: 'Theo dõi huyết áp',
      items: [
        {
          id: 'i1',
          prescription_id: 'p1',
          medicine_id: 'm1',
          medicine_name: 'Amlodipin 5mg',
          active_ingredient_snapshot: 'Amlodipine',
          strength_snapshot: '5mg',
          route_snapshot: 'Uống',
          dose_per_time: 1,
          dose_unit: 'viên',
          dosage: '1 viên',
          times_per_day: 1,
          frequency: '1 lần/ngày',
          times_of_day: ['Sáng'],
          quantity_dispensed: 30,
          quantity: 30,
          days_supply: 30,
          start_date: '2026-03-30',
          end_date: '2026-04-28',
          is_continuous: false,
          instructions: 'Sau ăn',
          special_instructions: 'Đo huyết áp trước uống',
        },
      ],
    });

    expect(result.status).toBe('Paused');
    expect(result.items[0].routeSnapshot).toBe('Uống');
    expect(result.items[0].quantityDispensed).toBe(30);
    expect(result.items[0].specialInstructions).toBe('Đo huyết áp trước uống');
  });
});
