import { create } from 'zustand';
import { ShiftHandover } from '../types';
import { supabase } from '../lib/supabase';

interface ShiftHandoverState {
    handovers: ShiftHandover[];
    isLoading: boolean;
    error: string | null;
    fetchHandovers: (floorId?: string) => Promise<void>;
    createHandover: (handover: Omit<ShiftHandover, 'id' | 'createdAt' | 'notes'> & { notes: any[] }) => Promise<void>;
}

export const useShiftHandoverStore = create<ShiftHandoverState>((set) => ({
    handovers: [],
    isLoading: false,
    error: null,

    fetchHandovers: async (floorId) => {
        set({ isLoading: true, error: null });
        try {
            let query = supabase
                .from('shift_handovers')
                .select(`
          *,
          notes:shift_handover_notes(*)
        `)
                .order('shift_date', { ascending: false });

            if (floorId) {
                query = query.eq('floor_id', floorId);
            }

            const { data, error } = await query;
            if (error) throw error;

            set({
                handovers: (data || []).map((d: any) => ({
                    id: d.id,
                    shiftDate: d.shift_date,
                    shiftTime: d.shift_time,
                    floorId: d.floor_id,
                    handoverStaff: d.handover_staff,
                    receiverStaff: d.receiver_staff,
                    totalResidents: d.total_residents,
                    notes: (d.notes || []).map((n: any) => ({
                        id: n.id,
                        handoverId: n.handover_id,
                        residentId: n.resident_id,
                        residentName: n.resident_name,
                        content: n.content,
                        createdAt: n.created_at
                    })),
                    createdAt: d.created_at,
                    createdBy: d.created_by
                })),
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    createHandover: async (handoverData) => {
        set({ isLoading: true });
        try {
            // 1. Create Handover Record
            const { data: handover, error: handoverError } = await supabase
                .from('shift_handovers')
                .insert({
                    shift_date: handoverData.shiftDate,
                    shift_time: handoverData.shiftTime,
                    floor_id: handoverData.floorId,
                    handover_staff: handoverData.handoverStaff,
                    receiver_staff: handoverData.receiverStaff,
                    total_residents: handoverData.totalResidents
                })
                .select()
                .single();

            if (handoverError) throw handoverError;

            // 2. Create Notes
            if (handoverData.notes && handoverData.notes.length > 0) {
                const notesToInsert = handoverData.notes.map(note => ({
                    handover_id: handover.id,
                    resident_id: note.residentId,
                    resident_name: note.residentName,
                    content: note.content
                }));

                const { error: notesError } = await supabase
                    .from('shift_handover_notes')
                    .insert(notesToInsert);

                if (notesError) throw notesError;
            }

            // Refresh list
            const store = useShiftHandoverStore.getState();
            store.fetchHandovers(handoverData.floorId);
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    }
}));
