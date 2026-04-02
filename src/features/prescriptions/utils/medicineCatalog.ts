const collapseWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

export const normalizeMedicineText = (value?: string | null) =>
  collapseWhitespace((value ?? '').replace(/\u00a0/g, ' '));

export const normalizeMedicineRoute = (value?: string | null) => {
  const normalized = normalizeMedicineText(value);
  return normalized === '.' ? '' : normalized;
};

export const normalizeMedicineUnit = (value?: string | null) => {
  const normalized = normalizeMedicineText(value);
  if (!normalized) return '';
  const withoutDiacritics = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (withoutDiacritics === withoutDiacritics.toLowerCase()) {
    return withoutDiacritics.charAt(0).toUpperCase() + withoutDiacritics.slice(1);
  }
  return withoutDiacritics;
};

export const buildMedicineDisplayName = (
  activeIngredient?: string | null,
  tradeName?: string | null,
) => {
  const active = normalizeMedicineText(activeIngredient);
  const trade = normalizeMedicineText(tradeName);
  if (active && trade) return `${active} (${trade})`;
  return active || trade;
};
