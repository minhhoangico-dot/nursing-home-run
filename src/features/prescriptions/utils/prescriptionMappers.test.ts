import { describe, expect, it } from 'vitest';
import {
  mapPrescriptionFromDb,
  mapPrescriptionItemFromDb,
  mapPrescriptionItemToDb,
  mapPrescriptionToDb,
} from './prescriptionMappers';

describe('mapPrescriptionItemFromDb', () => {
  it('hydrates schedule, quantity supplied, and date fields from db rows', () => {
    expect(
      mapPrescriptionItemFromDb({
        id: 'item-1',
        prescription_id: 'prescription-1',
        medicine_id: 'medicine-1',
        medicine_name: 'Rosuvastatin',
        dosage: '1 vien',
        frequency: '2 lan/ngay',
        instructions: 'Sau an',
        start_date: '2026-03-31',
        end_date: '2026-04-05',
        continuous: false,
        quantity_supplied: 10,
        administrations_per_day: 2,
        morning: true,
        noon: false,
        afternoon: false,
        evening: true,
      }),
    ).toMatchObject({
      id: 'item-1',
      prescriptionId: 'prescription-1',
      quantitySupplied: 10,
      administrationsPerDay: 2,
      schedule: {
        morning: true,
        noon: false,
        afternoon: false,
        evening: true,
      },
    });
  });
});

describe('mapPrescriptionItemToDb', () => {
  it('serializes the expanded UI item shape into db fields', () => {
    expect(
      mapPrescriptionItemToDb({
        medicineId: 'medicine-1',
        medicineName: 'Rosuvastatin',
        dosage: '1 vien',
        frequency: '2 lan/ngay',
        instructions: 'Sau an',
        startDate: '2026-03-31',
        endDate: '2026-04-05',
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
      medicine_id: 'medicine-1',
      medicine_name: 'Rosuvastatin',
      quantity_supplied: 10,
      administrations_per_day: 2,
      morning: true,
      noon: false,
      afternoon: false,
      evening: true,
    });
  });
});

describe('mapPrescriptionFromDb', () => {
  it('maps nested prescription rows into the expanded ui model', () => {
    expect(
      mapPrescriptionFromDb({
        id: 'prescription-1',
        code: 'DT-001',
        resident_id: 'resident-1',
        doctor_id: 'doctor-1',
        doctor_name: 'Dr A',
        diagnosis: 'Tang huyet ap',
        prescription_date: '2026-03-31',
        start_date: '2026-03-31',
        end_date: '2026-04-05',
        status: 'Active',
        notes: 'Theo doi',
        items: [
          {
            id: 'item-1',
            prescription_id: 'prescription-1',
            medicine_id: 'medicine-1',
            medicine_name: 'Rosuvastatin',
            dosage: '1 vien',
            frequency: '2 lan/ngay',
            instructions: 'Sau an',
            start_date: '2026-03-31',
            end_date: '2026-04-05',
            continuous: false,
            quantity_supplied: 10,
            administrations_per_day: 2,
            morning: true,
            noon: false,
            afternoon: false,
            evening: true,
          },
        ],
      }),
    ).toMatchObject({
      id: 'prescription-1',
      residentId: 'resident-1',
      doctorName: 'Dr A',
      items: [
        expect.objectContaining({
          quantitySupplied: 10,
          administrationsPerDay: 2,
        }),
      ],
    });
  });
});

describe('mapPrescriptionToDb', () => {
  it('maps prescription headers into db fields', () => {
    expect(
      mapPrescriptionToDb({
        code: 'DT-001',
        residentId: 'resident-1',
        doctorId: 'doctor-1',
        doctorName: 'Dr A',
        diagnosis: 'Tang huyet ap',
        prescriptionDate: '2026-03-31',
        startDate: '2026-03-31',
        endDate: '2026-04-05',
        status: 'Active',
        notes: 'Theo doi',
        items: [],
      }),
    ).toMatchObject({
      resident_id: 'resident-1',
      doctor_id: 'doctor-1',
      prescription_date: '2026-03-31',
    });
  });
});
