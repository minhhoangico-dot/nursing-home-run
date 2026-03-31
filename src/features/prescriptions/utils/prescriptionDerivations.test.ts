import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildActiveMedicationRows, getEstimatedExhaustionDate, getMedicationLineStatus } from './prescriptionDerivations';

describe('getEstimatedExhaustionDate', () => {
  it('treats the start date as day one of supply', () => {
    expect(
      getEstimatedExhaustionDate({
        startDate: '2026-03-31',
        quantitySupplied: 10,
        administrationsPerDay: 2,
      }),
    ).toBe('2026-04-04');
  });
});

describe('getMedicationLineStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('marks a line as near end when remaining supply is two days', () => {
    vi.setSystemTime(new Date('2026-04-03T03:00:00.000Z'));

    expect(
      getMedicationLineStatus({
        id: 'item-1',
        prescriptionId: 'prescription-1',
        medicineName: 'Rosuvastatin',
        dosage: '1 vien',
        frequency: '2 lan/ngay',
        timesOfDay: ['Sang', 'Toi'],
        startDate: '2026-03-31',
        continuous: false,
        quantitySupplied: 10,
        administrationsPerDay: 2,
        schedule: {
          morning: true,
          noon: false,
          afternoon: false,
          evening: true,
        },
      }),
    ).toMatchObject({
      active: true,
      nearEnd: true,
      exhausted: false,
      remainingDays: 2,
      estimatedExhaustionDate: '2026-04-04',
    });
  });
});

describe('buildActiveMedicationRows', () => {
  it('keeps duplicate medicines separate and sorts by time of day, display name, start date, then prescription code', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-02T03:00:00.000Z'));

    const rows = buildActiveMedicationRows([
      {
        id: 'prescription-1',
        code: 'DT-001',
        residentId: 'resident-1',
        doctorId: 'doctor-1',
        diagnosis: 'Tang huyet ap',
        prescriptionDate: '2026-03-31',
        startDate: '2026-03-31',
        status: 'Active',
        items: [
          {
            id: 'item-1',
            prescriptionId: 'prescription-1',
            medicineName: 'Amlodipine',
            dosage: '1 vien',
            frequency: '1 lan/ngay',
            timesOfDay: ['Sang'],
            startDate: '2026-03-31',
            continuous: false,
            quantitySupplied: 10,
            administrationsPerDay: 1,
            schedule: { morning: true, noon: false, afternoon: false, evening: false },
          },
          {
            id: 'item-2',
            prescriptionId: 'prescription-1',
            medicineName: 'Rosuvastatin',
            dosage: '1 vien',
            frequency: '1 lan/ngay',
            timesOfDay: ['Toi'],
            startDate: '2026-03-31',
            continuous: false,
            quantitySupplied: 10,
            administrationsPerDay: 1,
            schedule: { morning: false, noon: false, afternoon: false, evening: true },
          },
        ],
      },
      {
        id: 'prescription-2',
        code: 'DT-002',
        residentId: 'resident-1',
        doctorId: 'doctor-1',
        diagnosis: 'Tang huyet ap',
        prescriptionDate: '2026-04-01',
        startDate: '2026-04-01',
        status: 'Active',
        items: [
          {
            id: 'item-3',
            prescriptionId: 'prescription-2',
            medicineName: 'Amlodipine',
            dosage: '1 vien',
            frequency: '1 lan/ngay',
            timesOfDay: ['Sang'],
            startDate: '2026-04-01',
            continuous: false,
            quantitySupplied: 10,
            administrationsPerDay: 1,
            schedule: { morning: true, noon: false, afternoon: false, evening: false },
          },
        ],
      },
    ]);

    expect(
      rows.map((row) => [row.timeOfDay, row.medicineName, row.sourcePrescriptionCode]),
    ).toEqual([
      ['morning', 'Amlodipine', 'DT-001'],
      ['morning', 'Amlodipine', 'DT-002'],
      ['evening', 'Rosuvastatin', 'DT-001'],
    ]);
  });
});
