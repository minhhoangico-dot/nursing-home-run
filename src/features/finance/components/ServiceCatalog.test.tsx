import { render, screen, within } from '@testing-library/react';
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

const serviceListFixture: ServicePrice[] = [
  {
    id: 'SVC-3',
    name: 'Vat ly tri lieu',
    category: 'OTHER',
    price: 250000,
    unit: 'Lan',
    billingType: 'FIXED',
  },
  {
    id: 'SVC-1',
    name: 'An sang dac biet',
    category: 'MEAL',
    price: 90000,
    unit: 'Thang',
    billingType: 'FIXED',
  },
  {
    id: 'SVC-2',
    name: 'Cham soc cap do 2',
    category: 'CARE',
    price: 5000000,
    unit: 'Thang',
    billingType: 'FIXED',
  },
];

const getDesktopServiceNames = () => {
  const table = screen.getByRole('table');
  const rows = within(table).getAllByRole('row').slice(1);

  return rows.map((row) => within(row).getAllByRole('cell')[0].textContent);
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

    const addButton = screen.getByRole('button', { name: /Thêm dịch vụ/i });
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

  it('sorts fixed services by service name by default', () => {
    render(
      <ServiceCatalog
        services={serviceListFixture}
        onAdd={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(getDesktopServiceNames()).toEqual([
      'An sang dac biet',
      'Cham soc cap do 2',
      'Vat ly tri lieu',
    ]);
  });

  it('toggles service name sorting from the service name header', async () => {
    const user = userEvent.setup();

    render(
      <ServiceCatalog
        services={serviceListFixture}
        onAdd={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Sap xep theo ten dich vu/i }));

    expect(getDesktopServiceNames()).toEqual([
      'Vat ly tri lieu',
      'Cham soc cap do 2',
      'An sang dac biet',
    ]);
  });

  it('sorts services by category name when the category header is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ServiceCatalog
        services={serviceListFixture}
        onAdd={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Sap xep theo danh muc/i }));

    expect(getDesktopServiceNames()).toEqual([
      'Cham soc cap do 2',
      'Vat ly tri lieu',
      'An sang dac biet',
    ]);
  });

  it('searches services by service name and category label', async () => {
    const user = userEvent.setup();

    render(
      <ServiceCatalog
        services={serviceListFixture}
        onAdd={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    await user.type(screen.getByLabelText(/Tim ten hoac danh muc/i), 'dinh duong');

    expect(getDesktopServiceNames()).toEqual(['An sang dac biet']);
  });

  it('filters services by category', async () => {
    const user = userEvent.setup();

    render(
      <ServiceCatalog
        services={serviceListFixture}
        onAdd={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/Loc danh muc/i), 'CARE');

    expect(getDesktopServiceNames()).toEqual(['Cham soc cap do 2']);
  });
});
