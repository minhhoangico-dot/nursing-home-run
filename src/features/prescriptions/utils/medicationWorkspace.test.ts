import { describe, expect, it } from 'vitest';

import type { Prescription, Resident } from '@/src/types';
import {
  buildMedicationSummaryCsv,
  buildMedicationWorkspaceSummary,
} from './medicationWorkspace';

const resident = (overrides: Partial<Resident>): Resident => ({
  id: overrides.id ?? 'r1',
  name: overrides.name ?? 'Lan',
  dob: '1940-01-01',
  gender: 'Nữ',
  room: overrides.room ?? '101',
  bed: overrides.bed ?? 'A',
  floor: 'Tang 2',
  building: 'A',
  careLevel: 2,
  status: 'Active',
  admissionDate: '2026-01-01',
  guardianName: 'Guardian',
  guardianPhone: '0900000000',
  balance: 0,
  assessments: [],
  prescriptions: [],
  medicalVisits: [],
  specialMonitoring: [],
  medicalHistory: [],
  allergies: [],
  careLogs: [],
  currentConditionNote: '',
  lastMedicalUpdate: '2026-04-10',
  roomType: '2 Giường',
  dietType: 'Normal',
  isDiabetic: false,
});

const prescription = (overrides: Partial<Prescription>): Prescription => ({
  id: overrides.id ?? 'rx-1',
  code: overrides.code ?? 'DT-001',
  residentId: overrides.residentId ?? 'r1',
  doctorId: 'doctor-1',
  doctorName: 'BS A',
  diagnosis: overrides.diagnosis ?? 'Theo doi',
  prescriptionDate: '2026-04-01',
  startDate: '2026-04-01',
  endDate: overrides.endDate,
  status: overrides.status ?? 'Active',
  notes: overrides.notes,
  items: overrides.items ?? [
    {
      id: 'item-1',
      prescriptionId: overrides.id ?? 'rx-1',
      medicineName: 'Atorvastatin',
      dosage: '1 vien',
      frequency: '1 lan/ngay',
      timesOfDay: ['Toi'],
      quantity: 10,
      daysSupply: 10,
      startDate: '2026-04-01',
      endDate: '2026-04-12',
    },
  ],
});

describe('medication workspace summary', () => {
  it('combines active medication rows with resident deep links and near-end alerts', () => {
    const summary = buildMedicationWorkspaceSummary({
      today: '2026-04-10',
      residents: [resident({ id: 'r1', name: 'Lan' })],
      prescriptions: [prescription({ residentId: 'r1' })],
    });

    expect(summary.activeRows).toHaveLength(1);
    expect(summary.activeRows[0]).toMatchObject({
      residentId: 'r1',
      residentName: 'Lan',
      residentPath: '/residents/r1',
      medicineName: 'Atorvastatin',
      isNearingEndDate: true,
    });
    expect(summary.pendingAlerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: expect.stringContaining('Atorvastatin'),
          to: '/residents/r1',
          tone: 'warning',
        }),
      ]),
    );
  });

  it('tracks paused prescriptions while excluding completed prescriptions from active rows', () => {
    const summary = buildMedicationWorkspaceSummary({
      today: '2026-04-10',
      residents: [resident({ id: 'r1', name: 'Lan' })],
      prescriptions: [
        prescription({ id: 'rx-paused', status: 'Paused', residentId: 'r1' }),
        prescription({ id: 'rx-completed', status: 'Completed', residentId: 'r1' }),
      ],
    });

    expect(summary.activeRows).toEqual([]);
    expect(summary.pendingAlerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: expect.stringContaining('DT-001'),
          tone: 'info',
        }),
      ]),
    );
  });

  it('exports active medication rows with resident and prescription columns', () => {
    const summary = buildMedicationWorkspaceSummary({
      today: '2026-04-10',
      residents: [resident({ id: 'r1', name: 'Lan', room: '101' })],
      prescriptions: [prescription({ residentId: 'r1' })],
    });

    expect(buildMedicationSummaryCsv(summary.activeRows)).toContain(
      'Resident,Room,Bed,Medicine,Dosage,Frequency,Prescription,End Date',
    );
    expect(buildMedicationSummaryCsv(summary.activeRows)).toContain('Lan,101,A,Atorvastatin');
  });
});
