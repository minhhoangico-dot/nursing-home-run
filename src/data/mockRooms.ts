import { Resident, Room, MaintenanceRequest } from '../types/index';
import { BUILDING_STRUCTURE } from '../constants/facility';

export const generateRooms = (residents: Resident[], maintenanceRequests: MaintenanceRequest[] = []): Room[] => {
  const rooms: Room[] = [];

  const buildings = BUILDING_STRUCTURE
    .filter(b => b.name.startsWith('Tòa'))
    .map(b => ({ name: b.name, floors: b.floors.length }));

  const activeMaintenance = maintenanceRequests.filter(r => r.status === 'Pending' || r.status === 'In_Progress');

  buildings.forEach(b => {
    for (let f = 1; f <= b.floors; f++) {
      const floorName = `Tầng ${f}`;
      for (let i = 1; i <= 6; i++) {
        const roomNum = `${f}0${i}`;
        const type = i <= 2 ? '1 Giường' : i <= 4 ? '2 Giường' : '4 Giường';
        const bedCount = i <= 2 ? 1 : i <= 4 ? 2 : 4;

        const beds = Array.from({ length: bedCount }).map((_, idx) => {
          const char = String.fromCharCode(65 + idx);
          const bedId = `${b.name}-${roomNum}-${char}`;

          const resident = residents.find(r =>
            r.building === b.name &&
            r.room === roomNum &&
            r.bed === char &&
            r.status === 'Active'
          );

          const isUnderMaintenance = activeMaintenance.some(m =>
            m.location.includes(roomNum) &&
            (m.description.includes(`Giường ${char}`) || m.title.includes(`Giường ${char}`))
          );

          let status: 'Available' | 'Occupied' | 'Maintenance' = 'Available';
          if (resident) {
            status = 'Occupied';
          } else if (isUnderMaintenance) {
            status = 'Maintenance';
          }

          return {
            id: bedId,
            residentId: resident?.id,
            status: status
          };
        });

        rooms.push({
          id: `RM-${b.name}-${roomNum}`,
          number: roomNum,
          floor: floorName,
          building: b.name,
          type,
          beds: beds as any
        });
      }
    }
  });

  return rooms;
};