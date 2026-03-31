// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import type { Medicine } from '../../../types/medical';
import { DrugMasterDialog } from './DrugMasterDialog';

const medicines: Medicine[] = [
  {
    id: 'medicine-1',
    name: 'Aerius',
    activeIngredient: 'Desloratadine',
    unit: 'Vien',
    route: 'Uong',
    strength: '5mg',
  },
  {
    id: 'medicine-2',
    name: 'Rosuvastatin',
    activeIngredient: 'Rosuvastatin',
    unit: 'Vien',
    route: 'Uong',
    strength: '10mg',
  },
];

describe('DrugMasterDialog', () => {
  it('filters by medicine name and active ingredient', async () => {
    render(
      <DrugMasterDialog
        open
        medicines={medicines}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        onCreateMedicine={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/tim thuoc/i), {
      target: { value: 'deslo' },
    });

    expect(screen.getByRole('button', { name: /aerius/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /rosuvastatin/i })).not.toBeInTheDocument();
  });

  it('returns the selected medicine to the caller', async () => {
    const onSelect = vi.fn();

    render(
      <DrugMasterDialog
        open
        medicines={medicines}
        onClose={vi.fn()}
        onSelect={onSelect}
        onCreateMedicine={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /rosuvastatin/i }));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'medicine-2' }));
  });
});
