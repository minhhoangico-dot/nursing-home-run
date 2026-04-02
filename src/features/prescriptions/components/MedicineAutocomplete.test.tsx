import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { MedicineAutocomplete } from './MedicineAutocomplete';

describe('MedicineAutocomplete', () => {
  test('matches medicines by active ingredient and shows a secondary metadata line', async () => {
    const user = userEvent.setup();

    render(
      <MedicineAutocomplete
        medicines={[
          {
            id: 'm1',
            name: 'Amlodipin',
            activeIngredient: 'Amlodipine',
            strength: '5mg',
            route: 'Uống',
            unit: 'viên',
          },
        ]}
        value=""
        onChange={() => {}}
        onSelect={() => {}}
      />,
    );

    await user.type(screen.getByRole('textbox'), 'Amlodipine');

    expect(screen.getByText('Amlodipin')).toBeInTheDocument();
    expect(screen.getByText(/5mg/i)).toBeInTheDocument();
  });

  test('selects the first suggestion on enter', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <MedicineAutocomplete
        medicines={[
          {
            id: 'm1',
            name: 'Amlodipin',
            activeIngredient: 'Amlodipine',
            strength: '5mg',
            route: 'Uống',
            unit: 'viên',
          },
        ]}
        value=""
        onChange={() => {}}
        onSelect={onSelect}
      />,
    );

    await user.type(screen.getByRole('textbox'), 'Amlod');
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'm1', name: 'Amlodipin' }),
    );
  });
});
