import { describe, expect, it } from 'vitest';

import type { Medicine, Prescription } from '@/src/types';
import { calculateMedicationBillingRows } from './medicationBilling';

const prescription = (overrides: Partial<Prescription>): Prescription => ({
  id: overrides.id ?? 'rx-1',
  code: overrides.code ?? 'DT-001',
  residentId: overrides.residentId ?? 'resident-1',
  doctorId: 'doctor-1',
  doctorName: 'BS A',
  diagnosis: 'Theo doi',
  prescriptionDate: '2026-04-01',
  startDate: overrides.startDate ?? '2026-04-01',
  endDate: overrides.endDate,
  status: overrides.status ?? 'Active',
  items: overrides.items ?? [
    {
      id: 'item-1',
      prescriptionId: overrides.id ?? 'rx-1',
      medicineId: 'med-1',
      medicineName: 'Metformin',
      dosage: '1 vien',
      frequency: '2 lan/ngay',
      timesOfDay: ['Sang', 'Toi'],
      quantityDispensed: 60,
    },
  ],
});

const medicine = (overrides: Partial<Medicine>): Medicine => ({
  id: overrides.id ?? 'med-1',
  name: overrides.name ?? 'Metformin',
  unit: 'vien',
  price: overrides.price,
});

describe('calculateMedicationBillingRows', () => {
  it('uses prescription quantities and medicine prices for active prescriptions in the month', () => {
    const rows = calculateMedicationBillingRows({
      residentId: 'resident-1',
      billingMonth: '2026-04',
      prescriptions: [prescription({})],
      medicines: [medicine({ price: 1500 })],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      prescriptionId: 'rx-1',
      medicineName: 'Metformin',
      quantity: 60,
      unitPrice: 1500,
      amount: 90000,
      provisional: false,
    });
  });

  it('marks rows provisional when a medicine price is missing', () => {
    const rows = calculateMedicationBillingRows({
      residentId: 'resident-1',
      billingMonth: '2026-04',
      prescriptions: [prescription({})],
      medicines: [medicine({ price: undefined })],
    });

    expect(rows[0]).toMatchObject({
      amount: 0,
      provisional: true,
      missingPrice: true,
    });
  });

  it('excludes inactive prescriptions from medication billing', () => {
    const rows = calculateMedicationBillingRows({
      residentId: 'resident-1',
      billingMonth: '2026-04',
      prescriptions: [
        prescription({ id: 'rx-paused', status: 'Paused' }),
        prescription({ id: 'rx-completed', status: 'Completed' }),
      ],
      medicines: [medicine({ price: 1500 })],
    });

    expect(rows).toEqual([]);
  });
});
