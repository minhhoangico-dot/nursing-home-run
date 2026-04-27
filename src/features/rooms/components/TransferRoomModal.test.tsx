import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TransferRoomModal } from './TransferRoomModal';

const { BUILDING, FLOOR, ROOM_TYPE, generatedRooms } = vi.hoisted(() => ({
  BUILDING: 'T\u00f2a A',
  FLOOR: 'T\u1ea7ng 2',
  ROOM_TYPE: '2 Gi\u01b0\u1eddng',
  generatedRooms: [
    {
      id: 'room-203',
      number: '203',
      type: '2 Gi\u01b0\u1eddng',
      building: 'T\u00f2a A',
      floor: 'T\u1ea7ng 2',
      beds: [{ id: 'bed-203-C', status: 'Available', residentId: null }],
    },
  ],
}));

vi.mock('../../../data/index', () => ({
  generateRooms: () => generatedRooms,
}));

describe('TransferRoomModal', () => {
  it('does not close when the transfer save rejects', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSave = vi.fn().mockRejectedValue(new Error('Supabase write failed'));

    render(
      <TransferRoomModal
        resident={{
          id: 'resident-1',
          name: 'Resident One',
          dob: '1950-01-01',
          gender: 'Nam',
          room: '202',
          bed: 'B',
          floor: FLOOR,
          building: BUILDING,
          careLevel: 2,
          status: 'Active',
          admissionDate: '2026-01-01',
          guardianName: 'Guardian',
          guardianPhone: '0900000000',
          balance: 0,
          currentConditionNote: 'Stable',
          lastMedicalUpdate: '2026-04-01',
          roomType: ROOM_TYPE,
          dietType: 'Normal',
          isDiabetic: false,
        }}
        allResidents={[]}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    await user.selectOptions(screen.getByRole('combobox'), 'room-203');

    const bedLabel = screen.getByText(
      (_, element) => element?.tagName === 'SPAN' && element.textContent?.endsWith(' C') === true,
    );

    await user.click(bedLabel);
    await user.click(screen.getByRole('button', { name: /chuy\u1ec3n/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
