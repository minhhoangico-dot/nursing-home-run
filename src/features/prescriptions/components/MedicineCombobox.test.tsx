import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Medicine } from '../../../types';
import { MedicineCombobox } from './MedicineCombobox';

const buildMedicine = (
  id: string,
  overrides: Partial<Medicine> = {},
): Medicine => ({
  id,
  name: `Medicine ${id}`,
  unit: 'Vien',
  ...overrides,
});

const matchingMedicines = [
  buildMedicine('1', {
    code: 'BSGD00007',
    name: 'Acetylcysteine 100mg (Acemuc 100mg)',
    tradeName: 'Acemuc 100mg',
    activeIngredient: 'Acetylcysteine 100mg',
  }),
  buildMedicine('2', {
    code: 'BSGD01163',
    name: 'Acetylcysteine 200mg (Acemuc 200mg)',
    tradeName: 'Acemuc 200mg',
    activeIngredient: 'Acetylcysteine 200mg',
  }),
  buildMedicine('3', {
    code: 'BSGD00031',
    name: 'Acetylcysteine 200mg (Acemuc 200mg goi)',
    tradeName: 'Acemuc 200mg goi',
    activeIngredient: 'Acetylcysteine 200mg',
  }),
  buildMedicine('4', {
    code: 'BSGD10001',
    name: 'Acetylcysteine 300mg (Acemuc 300mg)',
    tradeName: 'Acemuc 300mg',
    activeIngredient: 'Acetylcysteine 300mg',
  }),
  buildMedicine('5', {
    code: 'BSGD10002',
    name: 'Acetylcysteine 400mg (Acemuc 400mg)',
    tradeName: 'Acemuc 400mg',
    activeIngredient: 'Acetylcysteine 400mg',
  }),
  buildMedicine('6', {
    code: 'BSGD10003',
    name: 'Acetylcysteine 500mg (Acemuc 500mg)',
    tradeName: 'Acemuc 500mg',
    activeIngredient: 'Acetylcysteine 500mg',
  }),
  buildMedicine('7', {
    code: 'BSGD10004',
    name: 'Acetylcysteine 600mg (Acemuc 600mg)',
    tradeName: 'Acemuc 600mg',
    activeIngredient: 'Acetylcysteine 600mg',
  }),
  buildMedicine('8', {
    code: 'BSGD10005',
    name: 'Acetylcysteine 700mg (Acemuc 700mg)',
    tradeName: 'Acemuc 700mg',
    activeIngredient: 'Acetylcysteine 700mg',
  }),
  buildMedicine('9', {
    code: 'BSGD10006',
    name: 'Acetylcysteine 800mg (Acemuc 800mg)',
    tradeName: 'Acemuc 800mg',
    activeIngredient: 'Acetylcysteine 800mg',
  }),
  buildMedicine('10', {
    code: 'BSGD10007',
    name: 'Acetylcysteine 900mg (Acemuc 900mg)',
    tradeName: 'Acemuc 900mg',
    activeIngredient: 'Acetylcysteine 900mg',
  }),
  buildMedicine('11', {
    code: 'BSGD10008',
    name: 'Acetylcysteine 1000mg (Acemuc 1000mg)',
    tradeName: 'Acemuc 1000mg',
    activeIngredient: 'Acetylcysteine 1000mg',
  }),
  buildMedicine('12', {
    code: 'BSGD10009',
    name: 'Acetylcysteine 1100mg (Acemuc 1100mg)',
    tradeName: 'Acemuc 1100mg',
    activeIngredient: 'Acetylcysteine 1100mg',
  }),
];

const renderHarness = (medicines: Medicine[]) => {
  const selected: string[] = [];

  const Harness = () => {
    const [value, setValue] = useState('');

    return (
      <>
        <MedicineCombobox
          medicines={medicines}
          value={value}
          onInputChange={setValue}
          onSelect={(medicine) => {
            selected.push(medicine.name);
            setValue(medicine.name);
          }}
          placeholder="Tim ten thuoc..."
        />
        <div data-testid="selected-name">{selected[selected.length - 1] ?? ''}</div>
      </>
    );
  };

  return {
    selected,
    ...render(<Harness />),
  };
};

describe('MedicineCombobox', () => {
  it('renders at most 10 matching suggestions and supports search by code, trade name, and active ingredient', () => {
    renderHarness(matchingMedicines);

    const input = screen.getByPlaceholderText('Tim ten thuoc...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'acemuc' } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(10);
    expect(screen.queryByText('Acetylcysteine 1100mg (Acemuc 1100mg)')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'BSGD00007' } });
    expect(screen.getByRole('option', { name: /Acetylcysteine 100mg/ })).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Acetylcysteine 200mg' } });
    expect(screen.getByRole('option', { name: /Acetylcysteine 200mg \(Acemuc 200mg\)/ })).toBeInTheDocument();
  });

  it('selects the highlighted suggestion with keyboard navigation', () => {
    renderHarness(matchingMedicines.slice(0, 3));

    const input = screen.getByPlaceholderText('Tim ten thuoc...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Ace' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByTestId('selected-name')).toHaveTextContent(
      'Acetylcysteine 200mg (Acemuc 200mg)',
    );
  });
});
