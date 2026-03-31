// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import type { Prescription } from '../../../types';
import { PrescriptionCard } from './PrescriptionCard';

const prescription: Prescription = {
  id: 'prescription-1',
  code: 'DT-001',
  residentId: 'resident-1',
  doctorId: 'doctor-1',
  doctorName: 'Bac si A',
  diagnosis: 'Tang huyet ap',
  prescriptionDate: '2026-03-31',
  startDate: '2026-03-31',
  status: 'Active',
  notes: 'Theo doi huyet ap',
  items: [
    {
      id: 'item-1',
      prescriptionId: 'prescription-1',
      medicineId: 'medicine-1',
      medicineName: 'Amlodipine',
      dosage: '1 vien',
      frequency: '2 lan/ngay',
      timesOfDay: ['Sang', 'Toi'],
      quantity: 4,
      quantitySupplied: 4,
      administrationsPerDay: 2,
      startDate: '2026-03-31',
      schedule: {
        morning: true,
        noon: false,
        afternoon: false,
        evening: true,
      },
    },
  ],
};

describe('PrescriptionCard', () => {
  it('shows near-end badges when any line has two or fewer days remaining', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-31T03:00:00.000Z'));

    render(
      <PrescriptionCard
        prescription={prescription}
        onAdjust={vi.fn()}
        onDuplicate={vi.fn()}
        onPause={vi.fn()}
        onComplete={vi.fn()}
        onPrint={vi.fn()}
        onViewHistory={vi.fn()}
      />,
    );

    expect(screen.getByText(/sap het trong 2 ngay/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Dieu chinh$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Lich su dieu chinh$/i })).toBeInTheDocument();

    vi.useRealTimers();
  });
});
