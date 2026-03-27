import { Medicine } from '@/src/types/medical';
import { buildMedicineDisplayName } from './medicineCatalog';

type MedicineRow = {
  id?: string;
  code?: string | null;
  name?: string | null;
  trade_name?: string | null;
  active_ingredient?: string | null;
  unit?: string | null;
  route?: string | null;
  default_dosage?: string | null;
  price?: number | null;
  source?: 'HIS_IMPORT' | 'MANUAL' | null;
  his_service_id?: number | null;
};

export const mapMedicineRowFromDb = (row: MedicineRow): Medicine => ({
  id: row.id ?? '',
  code: row.code ?? undefined,
  name:
    row.name ??
    buildMedicineDisplayName(row.active_ingredient, row.trade_name),
  tradeName: row.trade_name ?? undefined,
  activeIngredient: row.active_ingredient ?? undefined,
  unit: row.unit ?? '',
  route: row.route ?? undefined,
  defaultDosage: row.default_dosage ?? undefined,
  price: row.price ?? undefined,
  source: row.source ?? undefined,
  hisServiceId: row.his_service_id ?? undefined,
});

export const mapMedicineRowToDb = (medicine: Partial<Medicine>) => ({
  code: medicine.code,
  name:
    medicine.name ??
    buildMedicineDisplayName(medicine.activeIngredient, medicine.tradeName),
  trade_name: medicine.tradeName,
  active_ingredient: medicine.activeIngredient,
  unit: medicine.unit,
  route: medicine.route,
  default_dosage: medicine.defaultDosage,
  price: medicine.price,
  source: medicine.source ?? 'MANUAL',
  his_service_id: medicine.hisServiceId ?? null,
  updated_at: new Date().toISOString(),
});
