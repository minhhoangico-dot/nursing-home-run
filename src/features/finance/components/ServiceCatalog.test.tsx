import { render, screen } from '@testing-library/react';
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
});
