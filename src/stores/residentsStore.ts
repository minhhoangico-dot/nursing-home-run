import { create } from 'zustand';
import { Resident, ResidentListItem } from '../types';
import { db } from '../services/databaseService';
import { mapResidentToListItem } from '../services/residentService';

type SelectedResident = ResidentListItem | Resident;

const residentDetailRequests = new Map<string, Promise<Resident>>();

const isResidentDetail = (resident: Resident | ResidentListItem): resident is Resident =>
    Array.isArray((resident as Resident).assessments) &&
    Array.isArray((resident as Resident).prescriptions) &&
    Array.isArray((resident as Resident).medicalHistory);

interface ResidentsState {
    residents: ResidentListItem[];
    residentDetails: Record<string, Resident>;
    selectedResident: SelectedResident | null;
    isLoading: boolean;
    isSyncing: boolean; // For background syncs
    error: string | null;

    fetchResidents: () => Promise<void>;
    fetchResidentDetail: (id: string) => Promise<Resident>;
    addResident: (resident: Resident) => Promise<void>;
    updateResident: (resident: Resident | ResidentListItem) => Promise<void>;
    deleteResident: (id: string) => Promise<void>; // Note: DB service needs delete method or we just hide it?
    selectResident: (resident: SelectedResident | null) => void;
}

export const useResidentsStore = create<ResidentsState>((set, get) => {
    const loadResidentDetail = async (id: string) => {
        const existingRequest = residentDetailRequests.get(id);
        if (existingRequest) {
            return existingRequest;
        }

        const request = db.residents
            .getById(id)
            .then((resident) => {
                set((state) => ({
                    residentDetails: {
                        ...state.residentDetails,
                        [id]: resident,
                    },
                    residents: state.residents.map((item) =>
                        item.id === id ? mapResidentToListItem(resident) : item,
                    ),
                    selectedResident: state.selectedResident?.id === id ? resident : state.selectedResident,
                }));
                return resident;
            })
            .catch((error) => {
                set({ error: (error as Error).message });
                throw error;
            })
            .finally(() => {
                residentDetailRequests.delete(id);
            });

        residentDetailRequests.set(id, request);
        return request;
    };

    return {
        residents: [],
        residentDetails: {},
        selectedResident: null,
        isLoading: false,
        isSyncing: false,
        error: null,

        fetchResidents: async () => {
            set({ isLoading: true, error: null });
            try {
                const residents = await db.residents.getAll();
                set({ residents, isLoading: false });
            } catch (error) {
                set({ error: (error as Error).message, isLoading: false });
            }
        },

        fetchResidentDetail: async (id) => {
            const cachedResident = get().residentDetails[id];
            if (cachedResident) {
                void loadResidentDetail(id).catch(() => undefined);
                return cachedResident;
            }

            return loadResidentDetail(id);
        },

        addResident: async (resident) => {
            set({ isSyncing: true, error: null });
            const currentResidents = get().residents;
            const currentResidentDetails = get().residentDetails;

            set({
                residents: [mapResidentToListItem(resident), ...currentResidents],
                residentDetails: {
                    ...currentResidentDetails,
                    [resident.id]: resident,
                },
            });

            try {
                await db.residents.upsert(resident);
                set({ isSyncing: false });
            } catch (error) {
                set({
                    residents: currentResidents,
                    residentDetails: currentResidentDetails,
                    error: (error as Error).message,
                    isSyncing: false,
                });
                throw error;
            }
        },

        updateResident: async (resident) => {
            set({ isSyncing: true, error: null });
            const currentResidents = get().residents;
            const currentResidentDetails = get().residentDetails;
            const currentSelected = get().selectedResident;

            const fullResident = isResidentDetail(resident)
                ? resident
                : {
                    ...(get().residentDetails[resident.id] || await get().fetchResidentDetail(resident.id)),
                    ...resident,
                };

            set({
                residents: currentResidents.map((item) =>
                    item.id === fullResident.id ? mapResidentToListItem(fullResident) : item,
                ),
                residentDetails: {
                    ...currentResidentDetails,
                    [fullResident.id]: fullResident,
                },
                selectedResident: currentSelected?.id === fullResident.id ? fullResident : currentSelected,
            });

            try {
                await db.residents.upsert(fullResident);
                set({ isSyncing: false });
            } catch (error) {
                set({
                    residents: currentResidents,
                    residentDetails: currentResidentDetails,
                    selectedResident: currentSelected,
                    error: (error as Error).message,
                    isSyncing: false,
                });
                throw error;
            }
        },

        deleteResident: async (id) => {
            const currentResidents = get().residents;
            const currentResidentDetails = get().residentDetails;
            const { [id]: _deletedResident, ...remainingResidentDetails } = currentResidentDetails;

            set({
                residents: currentResidents.filter((resident) => resident.id !== id),
                residentDetails: remainingResidentDetails,
                selectedResident: get().selectedResident?.id === id ? null : get().selectedResident,
            });
        },

        selectResident: (resident) => set({ selectedResident: resident }),
    };
});
