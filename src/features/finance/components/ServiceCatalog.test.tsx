import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ServiceCatalog } from './ServiceCatalog';
import type { ServicePrice } from '@/src/types';

const serviceFixture: ServicePrice = {
  id: 'SVC-1',
  name: 'Vat ly tri lieu',
  category: 'OTHER',
  price: 250000,
  unit: 'Lan',
  billingType: 'FIXED',
};

describe('ServiceCatalog', () => {
  it('disables service mutations in read-only mode', () => {
    render(
      <ServiceCatalog
        services={[serviceFixture]}
        readOnly={true}
        onAdd={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
        onRecordUsage={() => {}}
      />,
    );

    expect(screen.getByRole('button', { name: /Thêm dịch vụ/i })).toBeDisabled();
    screen.getAllByLabelText('service-record-SVC-1').forEach((button) => {
      expect(button).toBeDisabled();
    });
    screen.getAllByLabelText('service-edit-SVC-1').forEach((button) => {
      expect(button).toBeDisabled();
    });
    screen.getAllByLabelText('service-delete-SVC-1').forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('creates fixed-tab services with a monthly unit', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(
      <ServiceCatalog
        services={[]}
        onAdd={onAdd}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    const addButton = screen.getByRole('button', { name: /Th.*m/i });
    await user.click(addButton);
    await user.type(screen.getByRole('textbox'), 'Giat do thang');
    await user.clear(screen.getByRole('spinbutton'));
    await user.type(screen.getByRole('spinbutton'), '120000');
    await user.click(screen.getByRole('button', { name: /L.u/i }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Giat do thang',
        billingType: 'FIXED',
        unit: 'Tháng',
      }),
    );
  });
});
