import { describe, expect, it } from 'vitest';
import { buildActiveMedicationPrintHtml } from './activeMedicationPrint';

describe('buildActiveMedicationPrintHtml', () => {
  it('renders grouped rows and keeps source prescription codes for duplicates', () => {
    const html = buildActiveMedicationPrintHtml({
      residentName: 'Nguyen Van A',
      residentCode: 'resident-1',
      rows: [
        {
          prescriptionId: 'prescription-1',
          sourcePrescriptionCode: 'DT-001',
          medicineName: 'Amlodipine',
          dosage: '1 vien',
          instructions: 'Sau an',
          timeOfDay: 'morning',
          startDate: '2026-03-31',
          status: {
            active: true,
            nearEnd: false,
            exhausted: false,
            remainingDays: 5,
            estimatedExhaustionDate: '2026-04-04',
          },
        },
        {
          prescriptionId: 'prescription-2',
          sourcePrescriptionCode: 'DT-002',
          medicineName: 'Amlodipine',
          dosage: '1 vien',
          instructions: 'Sau an',
          timeOfDay: 'morning',
          startDate: '2026-04-01',
          status: {
            active: true,
            nearEnd: false,
            exhausted: false,
            remainingDays: 6,
            estimatedExhaustionDate: '2026-04-06',
          },
        },
      ],
    });

    expect(html).toContain('Buoi sang');
    expect(html).toContain('DT-001');
    expect(html).toContain('DT-002');
    expect(html).toContain('Amlodipine');
  });
});
