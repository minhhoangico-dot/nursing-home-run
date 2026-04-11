import type { Medicine, Prescription, PrescriptionItem } from '@/src/types';
import { normalizePrescriptionStatus } from '@/src/types/medical';

export interface MedicationBillingInput {
  residentId: string;
  billingMonth: string;
  prescriptions: Prescription[];
  medicines: Medicine[];
}

export interface MedicationBillingRow {
  id: string;
  prescriptionId: string;
  prescriptionCode: string;
  medicineId?: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  date: string;
  provisional: boolean;
  missingPrice: boolean;
  missingQuantity: boolean;
  note?: string;
}

const getMonthBounds = (billingMonth: string) => {
  const [year, month] = billingMonth.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));

  return { start, end };
};

const parseDateOnly = (value?: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const prescriptionOverlapsMonth = (prescription: Prescription, billingMonth: string) => {
  const { start, end } = getMonthBounds(billingMonth);
  const startsAt = parseDateOnly(prescription.startDate) ?? parseDateOnly(prescription.prescriptionDate);
  const endsAt = parseDateOnly(prescription.endDate);

  if (!startsAt) return false;
  if (startsAt > end) return false;

  return !endsAt || endsAt >= start;
};

const findMedicine = (item: PrescriptionItem, medicines: Medicine[]) => {
  if (item.medicineId) {
    const byId = medicines.find((medicine) => medicine.id === item.medicineId);
    if (byId) return byId;
  }

  const itemName = item.medicineName.trim().toLowerCase();

  return medicines.find((medicine) => medicine.name.trim().toLowerCase() === itemName);
};

const getQuantity = (item: PrescriptionItem) =>
  item.quantityDispensed ?? item.quantity ?? item.quantitySupplied ?? 0;

export function calculateMedicationBillingRows({
  residentId,
  billingMonth,
  prescriptions,
  medicines,
}: MedicationBillingInput): MedicationBillingRow[] {
  return prescriptions
    .filter((prescription) => prescription.residentId === residentId)
    .filter((prescription) => normalizePrescriptionStatus(prescription.status) === 'Active')
    .filter((prescription) => prescriptionOverlapsMonth(prescription, billingMonth))
    .flatMap((prescription) =>
      prescription.items.map((item) => {
        const medicine = findMedicine(item, medicines);
        const quantity = getQuantity(item);
        const unitPrice = medicine?.price ?? 0;
        const missingPrice = unitPrice <= 0;
        const missingQuantity = quantity <= 0;
        const noteParts = [
          missingPrice ? 'Chưa có giá thuốc' : undefined,
          missingQuantity ? 'Chưa có số lượng cấp phát' : undefined,
        ].filter(Boolean);

        return {
          id: `${prescription.id}-${item.id}`,
          prescriptionId: prescription.id,
          prescriptionCode: prescription.code,
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          quantity,
          unitPrice,
          amount: quantity * unitPrice,
          date: item.startDate ?? prescription.startDate,
          provisional: missingPrice || missingQuantity,
          missingPrice,
          missingQuantity,
          note: noteParts.length ? noteParts.join('; ') : undefined,
        };
      }),
    );
}
