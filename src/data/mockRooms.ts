import { ResidentListItem, Room, MaintenanceRequest } from '../types/index';
import { BUILDING_STRUCTURE } from '../constants/facility';

export const SPECIAL_FLOOR_CONFIG: Record<string, Record<string, Array<{ number: string, beds: number, type: Room['type'] }>>> = {
  'Tòa B': {
    'Tầng 2': [
      { number: '201', beds: 2, type: '2 Giường' },
      { number: '202', beds: 1, type: '1 Giường' },
      { number: '203', beds: 1, type: '1 Giường' },
      { number: '204', beds: 2, type: '2 Giường' },
      { number: '205', beds: 2, type: '2 Giường' },
      { number: '206', beds: 2, type: '2 Giường' },
      { number: '207', beds: 3, type: '3 Giường' },
      { number: '208', beds: 3, type: '3 Giường' },
      { number: '209', beds: 3, type: '3 Giường' },
      { number: '210', beds: 3, type: '3 Giường' },
    ]
  },
  'Tòa A': {
    'Tầng 1': [
      { number: '102', beds: 2, type: '2 Giường' },
      { number: '103', beds: 5, type: '5 Giường' },
      { number: '104', beds: 9, type: '9 Giường' },
      { number: '105', beds: 1, type: '1 Giường' },
      { number: '106', beds: 1, type: '1 Giường' },
      { number: '107', beds: 5, type: '5 Giường' },
      { number: '110', beds: 2, type: '2 Giường' },
      { number: '111', beds: 5, type: '5 Giường' },
    ],
    'Tầng 2': [
      { number: '202', beds: 8, type: '8 Giường' },
      { number: '203', beds: 7, type: '7 Giường' },
      { number: '204', beds: 1, type: '1 Giường' },
      { number: '205', beds: 2, type: '2 Giường' },
      { number: '206', beds: 5, type: '5 Giường' },
      { number: '207', beds: 5, type: '5 Giường' },
      { number: '208', beds: 3, type: '3 Giường' },
      { number: '209', beds: 3, type: '3 Giường' },
      { number: '210', beds: 1, type: '1 Giường' },
      { number: '211', beds: 1, type: '1 Giường' },
      { number: '212', beds: 3, type: '3 Giường' },
      { number: '213', beds: 3, type: '3 Giường' },
    ],
    'Tầng 3': [
      { number: '302', beds: 2, type: '2 Giường' },
      { number: '303', beds: 5, type: '5 Giường' },
      { number: '304', beds: 5, type: '5 Giường' },
      { number: '305', beds: 2, type: '2 Giường' },
      { number: '306', beds: 1, type: '1 Giường' },
      { number: '307', beds: 1, type: '1 Giường' },
      { number: '308', beds: 5, type: '5 Giường' },
      { number: '309', beds: 5, type: '5 Giường' },
      { number: '310', beds: 7, type: '7 Giường' },
      { number: '311', beds: 3, type: '3 Giường' },
    ],
    'Tầng 4': [
      { number: '402', beds: 1, type: '1 Giường' },
      { number: '403', beds: 1, type: '1 Giường' },
      { number: '404', beds: 1, type: '1 Giường' },
      { number: '405', beds: 1, type: '1 Giường' },
      { number: '406', beds: 1, type: '1 Giường' },
      { number: '407', beds: 2, type: '2 Giường' },
      { number: '407A', beds: 2, type: '2 Giường' },
      { number: '408', beds: 1, type: '1 Giường' },
      { number: '408A', beds: 1, type: '1 Giường' },
      { number: '409', beds: 2, type: '2 Giường' },
      { number: '410', beds: 1, type: '1 Giường' },
      { number: '411', beds: 2, type: '2 Giường' },
      { number: 'Kính', beds: 2, type: '2 Giường' },
      { number: '412', beds: 2, type: '2 Giường' },
      { number: '413', beds: 2, type: '2 Giường' },
      { number: '414', beds: 2, type: '2 Giường' },
      { number: '415', beds: 2, type: '2 Giường' },
      { number: '416', beds: 2, type: '2 Giường' },
    ]
  }
};

export const generateRooms = (
  residents: ResidentListItem[],
  maintenanceRequests: MaintenanceRequest[] = [],
  customConfigs: typeof SPECIAL_FLOOR_CONFIG = SPECIAL_FLOOR_CONFIG
): Room[] => {
  const rooms: Room[] = [];

  const buildings = BUILDING_STRUCTURE
    .filter(b => b.name.startsWith('Tòa'))
    .map(b => ({ name: b.name, floors: b.floors.length }));

  const activeMaintenance = maintenanceRequests.filter(r => r.status === 'Pending' || r.status === 'In_Progress');

  buildings.forEach(b => {
    for (let f = 1; f <= b.floors; f++) {
      const floorName = `Tầng ${f}`;

      // Check for special configuration
      const specialConfig = customConfigs[b.name]?.[floorName];

      const roomsToGenerate: { roomNum: string; type: Room['type']; bedCount: number }[] = specialConfig
        ? specialConfig.map(c => ({
          roomNum: c.number,
          type: c.type,
          bedCount: c.beds
        }))
        : Array.from({ length: 6 }, (_, i) => {
          const idx = i + 1;
          return {
            roomNum: `${f}0${idx}`,
            type: (idx <= 2 ? '1 Giường' : idx <= 4 ? '2 Giường' : '4 Giường') as Room['type'],
            bedCount: idx <= 2 ? 1 : idx <= 4 ? 2 : 4
          };
        });

      roomsToGenerate.forEach(({ roomNum, type, bedCount }) => {
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
      });
    }
  });

  return rooms;
};
