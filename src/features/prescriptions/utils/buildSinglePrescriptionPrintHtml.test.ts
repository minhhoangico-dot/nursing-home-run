import { describe, expect, test } from 'vitest';

import { buildSinglePrescriptionPrintHtml } from './buildSinglePrescriptionPrintHtml';

describe('buildSinglePrescriptionPrintHtml', () => {
  test('prioritizes medicine name and uses snapshot fields when available', () => {
    const html = buildSinglePrescriptionPrintHtml({
      id: 'rx-1',
      code: 'RX-001',
      residentId: 'r-1',
      doctorId: 'd-1',
      doctorName: 'BS. Lan',
      diagnosis: 'Hypertension',
      prescriptionDate: '2026-03-30',
      startDate: '2026-03-30',
      status: 'Active',
      items: [
        {
          id: 'item-1',
          prescriptionId: 'rx-1',
          medicineName: 'Amlodipine',
          activeIngredientSnapshot: 'Amlodipine besylate',
          strengthSnapshot: '5 mg',
          routeSnapshot: 'Uống',
          dosePerTime: 1,
          doseUnit: 'viên',
          dosage: '1 viên',
          timesPerDay: 1,
          frequency: 'Mỗi ngày 1 lần',
          timesOfDay: ['Sáng'],
          quantityDispensed: 30,
          specialInstructions: 'Sau ăn',
        },
      ],
    }, {
      id: 'r-1',
      name: 'Nguyễn Văn A',
      dob: '1950-01-01',
      gender: 'Nam',
      room: 'A101',
    });

    expect(html).toContain('Amlodipine');
    expect(html).toContain('5 mg');
    expect(html).toContain('Uống');
    expect(html).toContain('1 viên');
    expect(html).toContain('Sau ăn');
    expect(html).not.toContain('Amlodipine besylate');
  });
});
