import { Resident } from '@/src/types/resident';

export const generateClinicCode = (resident: Partial<Resident>, existingCodes: string[] = []): string => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const birthYear = resident.dob ? new Date(resident.dob).getFullYear().toString().slice(-2) : '00';
    const genderCode = resident.gender === 'Nam' ? '01' : '02';

    const prefix = `${currentYear}${birthYear}${genderCode}`;

    // Find the max sequence for this prefix
    let maxSequence = 0;
    existingCodes.forEach(code => {
        if (code && code.startsWith(prefix) && code.length === 10) {
            const sequence = parseInt(code.slice(6));
            if (!isNaN(sequence) && sequence > maxSequence) {
                maxSequence = sequence;
            }
        }
    });

    const nextSequence = (maxSequence + 1).toString().padStart(4, '0');

    return `${prefix}${nextSequence}`;
};
