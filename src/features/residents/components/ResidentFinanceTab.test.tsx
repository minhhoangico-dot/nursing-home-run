import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ResidentFinanceTab } from './ResidentFinanceTab';
import type { Resident, ServicePrice } from '@/src/types';

vi.mock('@/src/stores/prescriptionStore', () => ({
  usePrescriptionsStore: () => ({
    prescriptions: [],
    medicines: [],
  }),
}));

const residentFixture: Resident = {
  id: 'RES-1',
  clinicCode: 'HS001',
  name: 'Nguyen Van A',
  dob: '1950-01-01',
  gender: 'Nam',
  room: '101',
  bed: 'A',
  floor: '1',
  building: 'A',
  careLevel: 2,
  status: 'Active',
  admissionDate: '2026-01-01',
  guardianName: 'Nguyen Van B',
  guardianPhone: '0900000000',
  balance: 0,
  assessments: [],
  prescriptions: [],
  medicalVisits: [],
  specialMonitoring: [],
  medicalHistory: [],
  allergies: [],
  vitalSigns: [],
  careLogs: [],
  currentConditionNote: '',
  lastMedicalUpdate: '2026-03-01',
  roomType: '2 Giường',
  dietType: 'Normal',
  isDiabetic: false,
};

const servicePricesFixture: ServicePrice[] = [
  {
    id: 'SVC-1',
    name: 'Vat ly tri lieu',
    category: 'OTHER',
    price: 250000,
    unit: 'Lan',
    billingType: 'ONE_OFF',
  },
];

describe('ResidentFinanceTab', () => {
  it('disables the quick-add finance control in read-only mode', () => {
    render(
      <ResidentFinanceTab
        resident={residentFixture}
        servicePrices={servicePricesFixture}
        usageRecords={[]}
        readOnly={true}
        onRecordUsage={() => {}}
      />,
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
