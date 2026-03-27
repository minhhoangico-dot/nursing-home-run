import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Room } from '../types';
import { SPECIAL_FLOOR_CONFIG } from '../data/mockRooms';

export interface RoomConfig {
    number: string;
    beds: number;
    type: Room['type'];
}

export interface FloorConfig {
    [floorName: string]: RoomConfig[];
}

export interface BuildingConfig {
    [buildingName: string]: FloorConfig;
}

export interface FacilityInfo {
    taxCode: string; // Add taxCode based on standard business requirements, though not explicitly asked, it's good practice.
    // Actually, stick to what was in FacilityConfig: name, address, phone, email, totalFloors, roomsPerFloor (though rooms per floor is less relevant now with custom rooms, we keep it for general info or calculations if needed, or maybe drop it?)
    // The user wants to "remove redundant Structure section". So I should probably drop totalFloors/roomsPerFloor from the Editable config if they are derived from dynamic data, BUT the store might want to keep the "Global" facility settings.
    // Let's look at the previous FacilityConfig state:
    // name, address, phone, email, totalFloors, roomsPerFloor.

    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    // We can probably drop structure info from "Setting" if we are doing dynamic structure.
}

interface RoomConfigState {
    configs: BuildingConfig;
    facility: FacilityInfo;
    updateRoom: (building: string, floor: string, room: RoomConfig) => void;
    addRoom: (building: string, floor: string, room: RoomConfig) => void;
    deleteRoom: (building: string, floor: string, roomNumber: string) => void;
    updateBuildingConfig: (building: string, floor: string, rooms: RoomConfig[]) => void;
    updateFacilityConfig: (info: FacilityInfo) => void;
    resetToDefaults: () => void;
}

export const useRoomConfigStore = create<RoomConfigState>()(
    persist(
        (set) => ({
            configs: SPECIAL_FLOOR_CONFIG,
            facility: {
                name: 'Viện Dưỡng Lão FDC',
                address: '123 Đường ABC, Quận 7, TP.HCM',
                phone: '028 1234 5678',
                email: 'contact@fdc.vn',
                taxCode: '0123456789',
                website: ''
            },

            updateRoom: (building, floor, updatedRoom) => set((state) => {
                const buildingConfig = state.configs[building] || {};
                const floorConfig = buildingConfig[floor] || [];

                const newFloorConfig = floorConfig.map(r =>
                    r.number === updatedRoom.number ? updatedRoom : r
                );

                return {
                    configs: {
                        ...state.configs,
                        [building]: {
                            ...state.configs[building],
                            [floor]: newFloorConfig
                        }
                    }
                };
            }),

            addRoom: (building, floor, newRoom) => set((state) => {
                const buildingConfig = state.configs[building] || {};
                const floorConfig = buildingConfig[floor] || [];

                return {
                    configs: {
                        ...state.configs,
                        [building]: {
                            ...state.configs[building],
                            [floor]: [...floorConfig, newRoom]
                        }
                    }
                };
            }),

            deleteRoom: (building, floor, roomNumber) => set((state) => {
                const buildingConfig = state.configs[building] || {};
                const floorConfig = buildingConfig[floor] || [];

                return {
                    configs: {
                        ...state.configs,
                        [building]: {
                            ...state.configs[building],
                            [floor]: floorConfig.filter(r => r.number !== roomNumber)
                        }
                    }
                };
            }),

            updateBuildingConfig: (building, floor, rooms) => set((state) => ({
                configs: {
                    ...state.configs,
                    [building]: {
                        ...state.configs[building],
                        [floor]: rooms
                    }
                }
            })),

            updateFacilityConfig: (info) => set({ facility: info }),

            resetToDefaults: () => set({ configs: SPECIAL_FLOOR_CONFIG }),
        }),
        {
            name: 'room-config-storage',
            version: 1,
        }
    )
);

