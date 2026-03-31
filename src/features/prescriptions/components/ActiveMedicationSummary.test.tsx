// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import type { ActiveMedicationRow } from '../../../types';
import { ActiveMedicationSummary } from './ActiveMedicationSummary';

const rows: ActiveMedicationRow[] = [
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
  {
    prescriptionId: 'prescription-1',
    sourcePrescriptionCode: 'DT-001',
    medicineName: 'Rosuvastatin',
    dosage: '1 vien',
    instructions: 'Toi',
    timeOfDay: 'evening',
    startDate: '2026-03-31',
    status: {
      active: true,
      nearEnd: true,
      exhausted: false,
      remainingDays: 2,
      estimatedExhaustionDate: '2026-04-02',
    },
  },
];

afterEach(() => {
  cleanup();
});

describe('ActiveMedicationSummary', () => {
  it('renders merged active rows grouped by morning, noon, afternoon, and evening', () => {
    render(<ActiveMedicationSummary rows={rows} />);

    expect(screen.getByText(/buoi sang/i)).toBeInTheDocument();
    expect(screen.getByText(/buoi toi/i)).toBeInTheDocument();
  });

  it('shows source prescription codes for duplicate medicines', () => {
    render(<ActiveMedicationSummary rows={rows} />);

    const morningSection = screen.getByLabelText(/buoi sang/i);
    expect(within(morningSection).getAllByText(/Amlodipine/i)).toHaveLength(2);
    expect(within(morningSection).getByText('DT-001')).toBeInTheDocument();
    expect(within(morningSection).getByText('DT-002')).toBeInTheDocument();
  });
});
