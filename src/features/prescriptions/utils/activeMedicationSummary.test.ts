import { describe, expect, test } from 'vitest';

import { buildActiveMedicationSummary } from './activeMedicationSummary';

describe('buildActiveMedicationSummary', () => {
  test('keeps separate rows for the same medicine across different active prescriptions', () => {
    const summary = buildActiveMedicationSummary([
      {
        id: 'rx-1',
        code: 'RX-001',
        residentId: 'r-1',
        doctorId: 'd-1',
        diagnosis: 'Condition A',
        prescriptionDate: '2026-03-01',
        startDate: '2026-03-01',
        endDate: '2026-04-02',
        status: 'Active',
        items: [
          {
            id: 'item-1',
            prescriptionId: 'rx-1',
            medicineName: 'Amoxicillin',
            dosage: '1 viên',
            frequency: 'Mỗi ngày 2 lần',
            timesOfDay: ['Sáng', 'Tối'],
            quantity: 14,
            startDate: '2026-03-01',
            endDate: '2026-04-02',
            isContinuous: false,
          },
        ],
      },
      {
        id: 'rx-2',
        code: 'RX-002',
        residentId: 'r-1',
        doctorId: 'd-2',
        diagnosis: 'Condition B',
        prescriptionDate: '2026-03-10',
        startDate: '2026-03-10',
        endDate: '2026-05-01',
        status: 'Active',
        items: [
          {
            id: 'item-2',
            prescriptionId: 'rx-2',
            medicineName: 'Amoxicillin',
            dosage: '2 viên',
            frequency: 'Mỗi ngày 1 lần',
            timesOfDay: ['Trưa'],
            quantity: 30,
            startDate: '2026-03-10',
            endDate: '2026-05-01',
            isContinuous: true,
          },
        ],
      },
    ], { asOfDate: '2026-03-30' });

    expect(summary).toHaveLength(2);
    expect(summary.map((row) => row.sourcePrescriptionCode)).toEqual(['RX-001', 'RX-002']);
    expect(summary.map((row) => row.medicineName)).toEqual(['Amoxicillin', 'Amoxicillin']);
    expect(summary[0].morning).toBe('1 viên');
    expect(summary[0].night).toBe('1 viên');
    expect(summary[0].noon).toBe('');
    expect(summary[0].isNearingEndDate).toBe(true);
    expect(summary[1].isContinuous).toBe(true);
  });
});
