import { useMemo, useState } from 'react';
import { ArrowRight, BedDouble, Building, CheckCircle2 } from 'lucide-react';

import { Button, Modal } from '../../../components/ui/index';
import { generateRooms } from '../../../data/index';
import { ResidentListItem } from '../../../types/index';

interface TransferRoomModalProps {
  resident: ResidentListItem;
  allResidents: ResidentListItem[];
  readOnly?: boolean;
  onClose: () => void;
  onSave: (data: {
    room: string;
    bed: string;
    floor: string;
    building: string;
    roomType: string;
  }) => Promise<void> | void;
}

export const TransferRoomModal = ({
  resident,
  allResidents,
  readOnly = false,
  onClose,
  onSave,
}: TransferRoomModalProps) => {
  const [selectedBuilding, setSelectedBuilding] = useState(resident.building || 'Tòa A');
  const [selectedFloor, setSelectedFloor] = useState(resident.floor);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rooms = useMemo(() => generateRooms(allResidents), [allResidents]);
  const availableRooms = rooms.filter(
    (room) => room.building === selectedBuilding && room.floor === selectedFloor,
  );
  const selectedRoom = availableRooms.find((room) => room.id === selectedRoomId);
  const availableBeds = selectedRoom
    ? selectedRoom.beds.filter((bed) => bed.status === 'Available')
    : [];

  const floors =
    selectedBuilding === 'Tòa A'
      ? ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4']
      : ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng 5'];

  const handleTransfer = async () => {
    if (readOnly) {
      onClose();
      return;
    }

    if (!selectedRoom || !selectedBedId || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        room: selectedRoom.number,
        bed: selectedBedId.split('-')[2],
        floor: selectedRoom.floor,
        building: selectedRoom.building,
        roomType: selectedRoom.type,
      });
    } catch {
      // The parent handles the error toast; keep the modal open for retry.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Chuyển phòng / Giường" onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-slate-500">Hiện tại</p>
            <p className="flex items-center gap-2 font-bold text-slate-800">
              <BedDouble className="h-4 w-4 text-slate-500" />
              {`P.${resident.room} - Giường ${resident.bed}`}
            </p>
            <p className="text-sm text-slate-500">{`${resident.building} - ${resident.floor}`}</p>
          </div>

          <ArrowRight className="h-5 w-5 text-slate-400" />

          <div className="text-right">
            <p className="mb-1 text-xs font-bold uppercase text-teal-600">Chuyển đến</p>
            <p className="font-bold text-teal-800">
              {selectedRoom ? `P.${selectedRoom.number}` : '...'}
              {' - '}
              {selectedBedId ? `Giường ${selectedBedId.split('-')[2]}` : '...'}
            </p>
            <p className="text-sm text-teal-600">{`${selectedBuilding} - ${selectedFloor}`}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Chọn Tòa nhà</label>
            <div className="flex gap-2">
              {['Tòa A', 'Tòa B'].map((building) => (
                <button
                  key={building}
                  type="button"
                  disabled={readOnly}
                  onClick={() => {
                    if (readOnly) return;
                    setSelectedBuilding(building);
                    setSelectedRoomId('');
                    setSelectedBedId('');
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm transition-colors ${
                    selectedBuilding === building
                      ? 'border-slate-800 bg-slate-800 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                  } ${readOnly ? 'pointer-events-none cursor-not-allowed opacity-60' : ''}`}
                >
                  <Building className="h-4 w-4" />
                  {building}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Chọn Tầng</label>
            <div className="grid grid-cols-5 gap-2">
              {floors.map((floor) => (
                <button
                  key={floor}
                  type="button"
                  disabled={readOnly}
                  onClick={() => {
                    if (readOnly) return;
                    setSelectedFloor(floor);
                    setSelectedRoomId('');
                    setSelectedBedId('');
                  }}
                  className={`rounded-lg border py-2 text-sm transition-colors ${
                    selectedFloor === floor
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-teal-400'
                  } ${readOnly ? 'pointer-events-none cursor-not-allowed opacity-60' : ''}`}
                >
                  {floor.replace('Tầng ', 'T')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Chọn Phòng</label>
            <select
              disabled={readOnly}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={selectedRoomId}
              onChange={(event) => {
                if (readOnly) return;
                setSelectedRoomId(event.target.value);
                setSelectedBedId('');
              }}
            >
              <option value="">-- Chọn phòng --</option>
              {availableRooms.map((room) => {
                const freeBeds = room.beds.filter((bed) => bed.status === 'Available').length;

                return (
                  <option key={room.id} value={room.id} disabled={freeBeds === 0}>
                    {`Phòng ${room.number} (${room.type}) - Trống ${freeBeds} giường`}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Chọn Giường</label>
            <div className="grid grid-cols-2 gap-3">
              {availableBeds.length > 0 ? (
                availableBeds.map((bed) => (
                  <div
                    key={bed.id}
                    aria-disabled={readOnly}
                    onClick={() => {
                      if (readOnly) return;
                      setSelectedBedId(bed.id);
                    }}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      selectedBedId === bed.id
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-slate-200 bg-white hover:border-teal-300'
                    } ${readOnly ? 'pointer-events-none cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  >
                    <span className="font-bold">{`Giường ${bed.id.split('-')[2]}`}</span>
                    {selectedBedId === bed.id && <CheckCircle2 className="h-4 w-4 text-teal-600" />}
                  </div>
                ))
              ) : (
                <div className="col-span-2 rounded-lg bg-slate-50 py-4 text-center text-sm italic text-slate-400">
                  {selectedRoomId ? 'Không còn giường trống' : 'Vui lòng chọn phòng trước'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Hủy bỏ
          </Button>

          {!readOnly && (
            <Button
              onClick={() => void handleTransfer()}
              disabled={!selectedRoomId || !selectedBedId || isSubmitting}
            >
              Xác nhận chuyển
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
