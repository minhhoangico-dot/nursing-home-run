import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

import { AdmissionWizard } from './AdmissionWizard';
import type { ServicePrice } from '@/src/types';
import { toast } from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/src/stores/roomConfigStore', () => ({
  useRoomConfigStore: () => ({ configs: [] }),
}));

const catalogFixture: ServicePrice[] = [
  {
    id: 'ROOM_2',
    name: 'Phong 2 nguoi',
    category: 'ROOM',
    price: 4500000,
    unit: 'Thang',
    billingType: 'FIXED',
    code: '2-bed',
  },
  {
    id: 'CARE_2_2-bed',
    name: 'Cham soc cap 2',
    category: 'CARE',
    price: 3000000,
    unit: 'Thang',
    billingType: 'FIXED',
    code: 'CL2_2-bed',
  },
  {
    id: 'MEAL_1',
    name: 'An tai nha an',
    category: 'MEAL',
    price: 1400000,
    unit: 'Thang',
    billingType: 'FIXED',
    code: 'standard',
  },
];

const clickContinue = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /Ti.p t.c/i }));
};

const fillRequiredFieldsAndReachServiceStep = async (container: HTMLElement) => {
  const user = userEvent.setup();

  const stepOneTextboxes = screen.getAllByRole('textbox');
  await user.type(stepOneTextboxes[0], 'Nguyen Van A');
  fireEvent.change(container.querySelector('input[type="date"]') as HTMLInputElement, {
    target: { value: '1950-01-01' },
  });
  await clickContinue(user);

  const stepTwoTextboxes = screen.getAllByRole('textbox');
  await user.type(stepTwoTextboxes[0], 'Nguyen Van B');
  await user.type(stepTwoTextboxes[1], '0900000000');
  await clickContinue(user);

  await user.click(screen.getByLabelText(/B. qua/i));

  return user;
};

describe('AdmissionWizard fixed services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('RES-NEW' as `${string}-${string}-${string}-${string}-${string}`);
  });

  it('blocks continuing when required fixed service categories are missing', async () => {
    const onSave = vi.fn();
    const { container } = render(
      <AdmissionWizard
        servicePrices={[]}
        onSave={onSave}
        onCancel={() => {}}
      />,
    );

    const user = await fillRequiredFieldsAndReachServiceStep(container);
    await clickContinue(user);

    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/dịch vụ cố định/i));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('passes fixed service assignments when admission is saved', async () => {
    const onSave = vi.fn();
    const { container } = render(
      <AdmissionWizard
        servicePrices={catalogFixture}
        onSave={onSave}
        onCancel={() => {}}
      />,
    );

    const user = await fillRequiredFieldsAndReachServiceStep(container);
    await clickContinue(user);
    await user.click(screen.getByRole('button', { name: /L.u kh.ng t.i/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'RES-NEW' }),
        expect.arrayContaining([
          expect.objectContaining({ residentId: 'RES-NEW', category: 'ROOM', serviceId: 'ROOM_2' }),
          expect.objectContaining({ residentId: 'RES-NEW', category: 'CARE', serviceId: 'CARE_2_2-bed' }),
          expect.objectContaining({ residentId: 'RES-NEW', category: 'MEAL', serviceId: 'MEAL_1' }),
        ]),
      );
    });
  });
});
