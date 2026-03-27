import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MedicineCatalogManager } from './MedicineCatalogManager';

const storeState = {
  medicines: [
    {
      id: '1',
      code: 'BSGD00012',
      name: 'Desloratadine (Aerius 0.5mg/ml)',
      tradeName: 'Aerius 0.5mg/ml',
      activeIngredient: 'Desloratadine',
      unit: 'Lo',
      route: 'Uong',
      source: 'HIS_IMPORT' as const,
    },
  ],
  fetchMedicines: vi.fn(),
  createMedicine: vi.fn(),
  updateMedicine: vi.fn(),
  deleteMedicine: vi.fn(),
  isLoading: false,
};

vi.mock('../../../stores/prescriptionStore', () => ({
  usePrescriptionsStore: () => storeState,
}));

describe('MedicineCatalogManager', () => {
  beforeEach(() => {
    storeState.fetchMedicines.mockReset();
    storeState.createMedicine.mockReset();
    storeState.updateMedicine.mockReset();
    storeState.deleteMedicine.mockReset();
  });

  it('renders catalog columns with source visibility', () => {
    render(<MedicineCatalogManager />);

    expect(screen.getByText('BSGD00012')).toBeInTheDocument();
    expect(screen.getByText('Desloratadine (Aerius 0.5mg/ml)')).toBeInTheDocument();
    expect(screen.getByText('Aerius 0.5mg/ml')).toBeInTheDocument();
    expect(screen.getByText('HIS')).toBeInTheDocument();
  });

  it('shows a read-only derived display name preview in the manual form', () => {
    render(<MedicineCatalogManager />);

    fireEvent.click(screen.getByRole('button', { name: /thêm thuốc mới/i }));

    const activeIngredientInput = screen.getByLabelText(/hoạt chất/i);
    const tradeNameInput = screen.getByLabelText(/tên thương mại/i);
    const displayNamePreview = screen.getByLabelText(/tên hiển thị/i);

    expect(displayNamePreview).toHaveAttribute('readonly');

    fireEvent.change(activeIngredientInput, {
      target: { value: 'Amlodipine' },
    });
    fireEvent.change(tradeNameInput, {
      target: { value: 'Norvasc 5mg' },
    });

    expect(displayNamePreview).toHaveValue('Amlodipine (Norvasc 5mg)');
  });
});
