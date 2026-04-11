import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, vi } from 'vitest';
import { ResidentFinanceTab } from './ResidentFinanceTab';
import type { Medicine, Prescription, Resident, ServicePrice } from '@/src/types';

let prescriptionState: { prescriptions: Prescription[]; medicines: Medicine[] } = {
  prescriptions: [],
  medicines: [],
};

vi.mock('@/src/stores/prescriptionStore', () => ({
  usePrescriptionsStore: () => prescriptionState,
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
  beforeEach(() => {
    prescriptionState = {
      prescriptions: [],
      medicines: [],
    };
  });

  it('disables the quick-add finance control in read-only mode', () => {
    render(
      <MemoryRouter>
        <ResidentFinanceTab
          resident={residentFixture}
          servicePrices={servicePricesFixture}
          usageRecords={[]}
          readOnly={true}
          onRecordUsage={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders calculated medication billing rows with provisional state', () => {
    prescriptionState = {
      prescriptions: [
        {
          id: 'rx-1',
          code: 'DT-001',
          residentId: 'RES-1',
          doctorId: 'doctor-1',
          doctorName: 'BS A',
          diagnosis: 'Theo doi',
          prescriptionDate: '2026-04-01',
          startDate: new Date().toISOString().slice(0, 10),
          status: 'Active',
          items: [
            {
              id: 'item-1',
              prescriptionId: 'rx-1',
              medicineId: 'med-1',
              medicineName: 'Metformin',
              dosage: '1 vien',
              frequency: '2 lan/ngay',
              timesOfDay: ['Sang', 'Toi'],
              quantityDispensed: 60,
            },
            {
              id: 'item-2',
              prescriptionId: 'rx-1',
              medicineId: 'missing-price',
              medicineName: 'No price medicine',
              dosage: '1 vien',
              frequency: '1 lan/ngay',
              timesOfDay: ['Sang'],
              quantityDispensed: 10,
            },
          ],
        },
      ],
      medicines: [
        {
          id: 'med-1',
          name: 'Metformin',
          unit: 'vien',
          price: 1500,
        },
      ],
    };

    render(
      <MemoryRouter>
        <ResidentFinanceTab
          resident={residentFixture}
          servicePrices={servicePricesFixture}
          usageRecords={[]}
          onRecordUsage={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Metformin')).toBeInTheDocument();
    expect(screen.getAllByText(/90.000/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tạm tính/i).length).toBeGreaterThan(0);
  });

  it('records quick-add service usage with a traceable description', () => {
    const onRecordUsage = vi.fn();

    render(
      <MemoryRouter>
        <ResidentFinanceTab
          resident={residentFixture}
          servicePrices={servicePricesFixture}
          usageRecords={[]}
          onRecordUsage={onRecordUsage}
        />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'SVC-1' } });

    expect(onRecordUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceId: 'SVC-1',
        description: expect.stringContaining('Quick-add from resident finance tab'),
      }),
    );
  });
});
