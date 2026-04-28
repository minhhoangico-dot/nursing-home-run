import { Resident } from '@/src/types/resident';

export const generateClinicCode = (_resident: Partial<Resident>, existingCodes: string[] = []): string => {
    const yy = new Date().getFullYear().toString().slice(-2);
    const prefix = `${yy}-`;

    let maxSequence = 0;
    existingCodes.forEach(code => {
        if (code && code.startsWith(prefix)) {
            const sequence = parseInt(code.slice(prefix.length), 10);
            if (!isNaN(sequence) && sequence > maxSequence) {
                maxSequence = sequence;
            }
        }
    });

    const nextSequence = (maxSequence + 1).toString().padStart(4, '0');
    return `${prefix}${nextSequence}`;
};
