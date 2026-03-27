import { Medicine } from '@/src/types/medical';
import { buildMedicineDisplayName, normalizeMedicineText } from './medicineCatalog';

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

type MapMedicineRowToDbOptions = {
  forUpdate?: boolean;
};

const normalizeOptionalText = (value?: string | null) => {
  const normalized = normalizeMedicineText(value);
  return normalized ? normalized : null;
};

const hasOwn = <K extends PropertyKey>(value: object, key: K) =>
  Object.prototype.hasOwnProperty.call(value, key);

export const mapMedicineRowFromDb = (row: MedicineRow): Medicine => ({
  id: row.id ?? '',
  code: normalizeOptionalText(row.code) ?? undefined,
  name:
    normalizeMedicineText(row.name) ||
    buildMedicineDisplayName(row.active_ingredient, row.trade_name),
  tradeName: normalizeOptionalText(row.trade_name) ?? undefined,
  activeIngredient: normalizeOptionalText(row.active_ingredient) ?? undefined,
  unit: row.unit ?? '',
  route: normalizeOptionalText(row.route) ?? undefined,
  defaultDosage: normalizeOptionalText(row.default_dosage) ?? undefined,
  price: row.price ?? undefined,
  source: row.source ?? undefined,
  hisServiceId: row.his_service_id ?? undefined,
});

export const mapMedicineRowToDb = (
  medicine: Partial<Medicine>,
  options: MapMedicineRowToDbOptions = {},
) => {
  const code = normalizeOptionalText(medicine.code);
  const tradeName = normalizeOptionalText(medicine.tradeName);
  const activeIngredient = normalizeOptionalText(medicine.activeIngredient);
  const route = normalizeOptionalText(medicine.route);
  const defaultDosage = normalizeOptionalText(medicine.defaultDosage);
  const providedName = normalizeOptionalText(medicine.name);
  const derivedName = buildMedicineDisplayName(activeIngredient, tradeName);
  const name = providedName ?? (derivedName || null);

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (!options.forUpdate || hasOwn(medicine, 'code')) payload.code = code;
  if (!options.forUpdate || hasOwn(medicine, 'tradeName')) payload.trade_name = tradeName;
  if (!options.forUpdate || hasOwn(medicine, 'activeIngredient')) {
    payload.active_ingredient = activeIngredient;
  }
  if (!options.forUpdate || hasOwn(medicine, 'unit')) payload.unit = medicine.unit;
  if (!options.forUpdate || hasOwn(medicine, 'route')) payload.route = route;
  if (!options.forUpdate || hasOwn(medicine, 'defaultDosage')) {
    payload.default_dosage = defaultDosage;
  }
  if (!options.forUpdate || hasOwn(medicine, 'price')) payload.price = medicine.price;

  if (!options.forUpdate) {
    payload.name = name;
    payload.source = medicine.source ?? 'MANUAL';
    payload.his_service_id = medicine.hisServiceId ?? null;
    return payload;
  }

  const hasEnoughDataToRebuildName =
    (hasOwn(medicine, 'tradeName') && hasOwn(medicine, 'activeIngredient')) ||
    hasOwn(medicine, 'name');

  if (hasEnoughDataToRebuildName && name) {
    payload.name = name;
  }
  if (hasOwn(medicine, 'source')) payload.source = medicine.source ?? 'MANUAL';
  if (hasOwn(medicine, 'hisServiceId')) payload.his_service_id = medicine.hisServiceId ?? null;

  return payload;
};
