import { describe, expect, test } from 'vitest';

import type { Resident } from '@/src/types';
import { buildActiveMedicationPrintHtml } from './buildActiveMedicationPrintHtml';

describe('buildActiveMedicationPrintHtml', () => {
  test('renders separate rows for duplicate medicine names from different prescriptions', () => {
    const resident = {
      id: 'r-1',
      name: 'Nguyễn Văn A',
      dob: '1950-01-01',
      gender: 'Nam',
      room: 'A101',
      bed: '02',
      allergies: [],
    } as Resident;

    const html = buildActiveMedicationPrintHtml(resident, [
      {
        id: 'item-1',
        prescriptionId: 'rx-1',
        medicineName: 'Metformin',
        dosage: '1 viên',
        frequency: 'Mỗi ngày 2 lần',
        timesOfDay: ['Sáng', 'Tối'],
        quantity: 60,
        prescriptionCode: 'RX-001',
        sourcePrescriptionCode: 'RX-001',
        sourcePrescriptionId: 'rx-1',
        startDate: '2026-03-01',
        endDate: '2026-04-01',
      },
      {
        id: 'item-2',
        prescriptionId: 'rx-2',
        medicineName: 'Metformin',
        dosage: '2 viên',
        frequency: 'Mỗi ngày 1 lần',
        timesOfDay: ['Trưa'],
        quantity: 30,
        prescriptionCode: 'RX-002',
        sourcePrescriptionCode: 'RX-002',
        sourcePrescriptionId: 'rx-2',
        startDate: '2026-03-10',
        endDate: '2026-05-01',
      },
    ]);

    expect(html).toContain('SÁNG');
    expect(html).toContain('TRƯA');
    expect(html).toContain('TỐI');
    expect(html).toContain('Metformin');
    expect(html).toContain('RX-001');
    expect(html).toContain('RX-002');
    expect((html.match(/Metformin/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});
