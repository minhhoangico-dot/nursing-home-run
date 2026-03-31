// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import type { PrescriptionSnapshot } from '../../../types';
import { PrescriptionHistoryDrawer } from './PrescriptionHistoryDrawer';

const snapshots: PrescriptionSnapshot[] = [
  {
    id: 'snapshot-1',
    prescriptionId: 'prescription-1',
    version: 1,
    snapshotAt: '2026-03-31T09:00:00.000Z',
    actor: 'Bac si A',
    changeReason: 'adjust',
    headerPayload: {
      diagnosis: 'Tang huyet ap',
    },
    itemsPayload: [
      {
        medicine_name: 'Amlodipine',
        dosage: '1 vien',
      },
    ],
  },
];

describe('PrescriptionHistoryDrawer', () => {
  it('shows snapshot versions for an adjusted prescription', () => {
    render(<PrescriptionHistoryDrawer open snapshots={snapshots} onClose={vi.fn()} />);

    expect(screen.getByText(/phien ban 1/i)).toBeInTheDocument();
    expect(screen.getByText(/amlodipine/i)).toBeInTheDocument();
  });
});
