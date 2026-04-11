import { describe, expect, it } from 'vitest';

import type { Incident, Prescription, ProcedureRecord, Resident, ServiceUsage } from '@/src/types';
import type { DailyMonitoringRecord } from '@/src/types/dailyMonitoring';
import { buildTodayDashboard } from './todayDashboard';

const resident = (overrides: Partial<Resident>): Resident => ({
  id: overrides.id ?? 'resident-1',
  name: overrides.name ?? 'Nguyen Van A',
  dob: '1940-01-01',
  gender: 'Nam',
  room: overrides.room ?? '101',
  bed: 'A',
  floor: 'Tang 3',
  building: 'A',
  careLevel: 2,
  status: overrides.status ?? 'Active',
  admissionDate: '2026-01-01',
  guardianName: 'Guardian',
  guardianPhone: '0900000000',
  balance: overrides.balance ?? 0,
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
  residentId: overrides.residentId ?? 'resident-1',
  doctorId: 'doctor-1',
  doctorName: 'BS A',
  diagnosis: 'Theo doi',
  prescriptionDate: '2026-04-01',
  startDate: '2026-04-01',
  endDate: overrides.endDate,
  status: overrides.status ?? 'Active',
  items: overrides.items ?? [
    {
      id: 'item-1',
      prescriptionId: 'rx-1',
      medicineName: 'Metformin',
      dosage: '1 vien',
      frequency: '2 lan/ngay',
      timesOfDay: ['Sang'],
      quantity: 10,
      daysSupply: 10,
      startDate: '2026-04-01',
      endDate: '2026-04-12',
    },
  ],
});

const today = '2026-04-10';

const baseInput = {
  today,
  residents: [
    resident({ id: 'resident-1', name: 'Lan', balance: -6_000_000 }),
    resident({ id: 'resident-2', name: 'Minh', room: '102' }),
  ],
  dailyRecords: [
    {
      id: 'dm-1',
      resident_id: 'resident-1',
      record_date: today,
      blood_sugar: 220,
      temperature: 37.1,
    } satisfies DailyMonitoringRecord,
  ],
  procedureRecords: [
    {
      id: 'pr-1',
      residentId: 'resident-1',
      recordDate: today,
      injection: true,
      ivDrip: false,
      gastricTube: false,
      urinaryCatheter: false,
      bladderWash: false,
      bloodSugarTest: false,
      bloodPressure: false,
      oxygenTherapy: false,
      woundDressing: false,
      injectionCount: 1,
      ivDripCount: 0,
      gastricTubeCount: 0,
      urinaryCatheterCount: 0,
      bladderWashCount: 0,
      bloodSugarTestCount: 0,
      bloodPressureCount: 0,
      oxygenTherapyCount: 0,
      woundDressingCount: 0,
      createdAt: today,
    } satisfies ProcedureRecord,
  ],
  incidents: [
    {
      id: 'inc-1',
      date: today,
      time: '08:00',
      type: 'Fall',
      severity: 'High',
      residentId: 'resident-1',
      residentName: 'Lan',
      location: 'P101',
      description: 'Fall',
      immediateAction: 'Observe',
      reporter: 'Nurse',
      status: 'New',
    } satisfies Incident,
  ],
  usageRecords: [
    {
      id: 'usage-1',
      residentId: 'resident-1',
      serviceId: 'svc-1',
      serviceName: 'Cham soc',
      date: today,
      quantity: 1,
      unitPrice: 100000,
      totalAmount: 100000,
      status: 'Unbilled',
    } satisfies ServiceUsage,
  ],
  prescriptions: [prescription({})],
};

describe('buildTodayDashboard', () => {
  it('summarizes nursing work that still needs charting', () => {
    const summary = buildTodayDashboard({ ...baseInput, role: 'NURSE' });

    expect(summary.title).toContain('Điều dưỡng');
    expect(summary.cards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Chưa nhập chỉ số', value: 1 }),
        expect.objectContaining({ label: 'Thủ thuật hôm nay', value: 1 }),
      ]),
    );
    expect(summary.alerts[0]).toMatchObject({
      title: expect.stringContaining('Minh'),
      to: '/daily-monitoring',
    });
  });

  it('surfaces clinical alerts for doctors', () => {
    const summary = buildTodayDashboard({ ...baseInput, role: 'DOCTOR' });

    expect(summary.title).toContain('Bác sĩ');
    expect(summary.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: expect.stringContaining('Đường huyết') }),
        expect.objectContaining({ title: expect.stringContaining('sắp hết') }),
      ]),
    );
  });

  it('summarizes incident pressure for supervisors', () => {
    const summary = buildTodayDashboard({ ...baseInput, role: 'SUPERVISOR' });

    expect(summary.title).toContain('Trưởng tầng');
    expect(summary.cards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Sự cố mới', value: 1 }),
      ]),
    );
  });

  it('summarizes finance exceptions for accountants', () => {
    const summary = buildTodayDashboard({ ...baseInput, role: 'ACCOUNTANT' });

    expect(summary.title).toContain('Kế toán');
    expect(summary.cards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'NCT đang nợ', value: 1 }),
        expect.objectContaining({ label: 'Dịch vụ chưa chốt', value: 1 }),
      ]),
    );
  });
});
