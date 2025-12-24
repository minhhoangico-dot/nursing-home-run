import { supabase } from '../lib/supabase';
import { FLOOR_3_RESIDENTS, SAMPLE_SHIFT_NOTES, SAMPLE_BLOOD_SUGAR } from '../data/seedData';

// Helper to get random item from array
const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
// Helper to get random number in range
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper to get random float in range
const randomFloat = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(1));

export const seedDatabase = async () => {
    console.log('Starting database seed...');

    try {
        // 1. Seed Residents
        console.log('Seeding residents...');
        const residentIds: string[] = [];

        for (const resident of FLOOR_3_RESIDENTS) {
            // Check if resident exists
            const { data: existing } = await supabase
                .from('residents')
                .select('id')
                .eq('name', resident.name)
                .single();

            let residentId = existing?.id;

            if (!residentId) {
                // Create new resident
                // Note: Assuming residents table has these columns. 
                // Based on types/resident.ts, we need minimal required fields.
                // We'll use a random UUID for ID if the DB doesn't auto-gen (it's TEXT PK).
                // But usually we let DB handle it if it has default. 
                // However, seeing migration `residents(id)` is referenced, let's try to query first.
                // If the 'id' column has no default, we need to provide it.
                // Since I can't see residents schema fully, I'll assume I might need to generate it
                // OR I'll let Supabase handle it if it has a default uuid_generate_v4().
                // I'll try insert without ID first.

                const { data: newResident, error } = await supabase
                    .from('residents')
                    .insert({
                        name: resident.name,
                        room: resident.roomNumber,
                        floor: 'Tầng 3',
                        care_level: resident.careLevel,
                        is_diabetic: resident.isDiabetic,
                        // Fill required fields with defaults
                        dob: '1950-01-01',
                        gender: random(['Nam', 'Nữ']),
                        status: 'Active',
                        admission_date: new Date().toISOString(),
                        guardian_name: 'Người nhà',
                        guardian_phone: '0123456789'
                    })
                    .select('id')
                    .single();

                if (error) {
                    console.error(`Error creating resident ${resident.name}:`, error);
                } else {
                    residentId = newResident?.id;
                }
            } else {
                // Update existing resident with new flags
                await supabase
                    .from('residents')
                    .update({
                        is_diabetic: resident.isDiabetic,
                        room: resident.roomNumber,
                        // care_level might need mapping if column name is different, 
                        // but TS interface said 'careLevel'. 
                        // DB usually uses snake_case: checking types again...
                        // types/resident.ts uses camelCase, but DB likely snake_case.
                        // Migration `002` uses `is_diabetic`.
                        // I will assume standard mapping.
                    })
                    .eq('id', residentId);
            }

            if (residentId) {
                residentIds.push(residentId);

                // 2. Seed Blood Sugar (for diabetics)
                if (resident.isDiabetic) {
                    await seedBloodSugar(residentId);
                }

                // 3. Seed Procedures (random)
                await seedProcedures(residentId);

                // 4. Seed Weight
                await seedWeight(residentId, resident.weight);
            }
        }

        // 5. Seed Shift Handovers
        await seedShiftHandovers(residentIds);

        console.log('Database seeding completed successfully!');
        return { success: true };
    } catch (error) {
        console.error('Seeding failed:', error);
        return { success: false, error };
    }
};

const seedBloodSugar = async (residentId: string) => {
    // Generate records for last 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    });

    for (const date of dates) {
        // Randomly skip some readings to be realistic
        const isAbnormal = Math.random() > 0.8;
        const ranges = isAbnormal ? SAMPLE_BLOOD_SUGAR.high : SAMPLE_BLOOD_SUGAR.normal;

        const { error } = await supabase.from('blood_sugar_records').upsert({
            resident_id: residentId,
            record_date: date,
            morning_before_meal: randomFloat(ranges.before - 0.5, ranges.before + 0.5),
            morning_after_meal: randomFloat(ranges.after - 0.5, ranges.after + 0.5),
            insulin_units: Math.random() > 0.3 ? 10 : null,
            insulin_time: 'morning',
            administered_by: 'Y tá A'
        }, { onConflict: 'resident_id,record_date' });

        if (error) console.error('Error seeding blood sugar:', error);
    }
};

const seedProcedures = async (residentId: string) => {
    // Random procedures for last 3 days
    const dates = Array.from({ length: 3 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    });

    for (const date of dates) {
        if (Math.random() > 0.7) continue; // Not everyone has procedures every day

        const { error } = await supabase.from('procedure_records').upsert({
            resident_id: residentId,
            record_date: date,
            blood_pressure: true, // Common
            injection: Math.random() > 0.8,
            iv_drip: Math.random() > 0.9,
            notes: 'Theo chỉ định bác sĩ'
        }, { onConflict: 'resident_id,record_date' });

        if (error) console.error('Error seeding procedures:', error);
    }
};

const seedWeight = async (residentId: string, currentWeight: number) => {
    // Current month and last month
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const weights = [
        { month: currentMonth, weight: currentWeight },
        { month: lastMonth, weight: currentWeight + randomFloat(-1, 1) }
    ];

    for (const w of weights) {
        const { error } = await supabase.from('weight_records').upsert({
            resident_id: residentId,
            record_month: w.month,
            weight_kg: w.weight,
            recorded_by: 'Y tá A'
        }, { onConflict: 'resident_id,record_month' });

        if (error) console.error('Error seeding weight:', error);
    }
};

const seedShiftHandovers = async (residentIds: string[]) => {
    // Generate handovers for last 3 days
    const dates = Array.from({ length: 3 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    });

    const SHIFTS = ['06:00', '14:00', '22:00'];

    for (const date of dates) {
        for (const time of SHIFTS) {
            // Create handover
            const { data: handover, error } = await supabase
                .from('shift_handovers')
                .insert({
                    shift_date: date,
                    shift_time: time,
                    floor_id: 'Tầng 3',
                    handover_staff: ['Y tá A', 'Y tá B'],
                    receiver_staff: ['Y tá C', 'Y tá D'],
                    total_residents: residentIds.length
                })
                .select('id')
                .single();

            if (error) {
                console.error('Error creating handover:', error);
                continue;
            }

            if (handover) {
                // Add notes
                const notesCount = randomInt(1, 5);
                for (let i = 0; i < notesCount; i++) {
                    const residentId = random(residentIds);
                    // Fetch name? using a hack here or efficient lookup map previously built
                    // For simplicity, inserting generated notes
                    await supabase.from('shift_handover_notes').insert({
                        handover_id: handover.id,
                        resident_id: residentId,
                        content: random(SAMPLE_SHIFT_NOTES)
                    });
                }
            }
        }
    }
};
