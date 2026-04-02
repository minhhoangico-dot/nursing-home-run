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

interface RoomConfigState {
    configs: BuildingConfig;
    updateRoom: (building: string, floor: string, room: RoomConfig) => void;
    addRoom: (building: string, floor: string, room: RoomConfig) => void;
    deleteRoom: (building: string, floor: string, roomNumber: string) => void;
    updateBuildingConfig: (building: string, floor: string, rooms: RoomConfig[]) => void;
    resetToDefaults: () => void;
}

export const useRoomConfigStore = create<RoomConfigState>()(
    persist(
        (set) => ({
            configs: SPECIAL_FLOOR_CONFIG,

            updateRoom: (building, floor, updatedRoom) => set((state) => {
                const buildingConfig = state.configs[building] || {};
                const floorConfig = buildingConfig[floor] || [];

                const newFloorConfig = floorConfig.map((room) =>
                    room.number === updatedRoom.number ? updatedRoom : room
                );

                return {
                    configs: {
                        ...state.configs,
                        [building]: {
                            ...state.configs[building],
                            [floor]: newFloorConfig,
                        },
                    },
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
                            [floor]: [...floorConfig, newRoom],
                        },
                    },
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
                            [floor]: floorConfig.filter((room) => room.number !== roomNumber),
                        },
                    },
                };
            }),

            updateBuildingConfig: (building, floor, rooms) => set((state) => ({
                configs: {
                    ...state.configs,
                    [building]: {
                        ...state.configs[building],
                        [floor]: rooms,
                    },
                },
            })),

            resetToDefaults: () => set({ configs: SPECIAL_FLOOR_CONFIG }),
        }),
        {
            name: 'room-config-storage',
            version: 2,
            migrate: (persistedState: Partial<RoomConfigState> | undefined) => ({
                ...persistedState,
                configs: persistedState?.configs || SPECIAL_FLOOR_CONFIG,
            }),
        }
    )
);
