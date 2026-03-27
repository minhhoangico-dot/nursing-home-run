import { describe, expect, it } from 'vitest';
import {
  buildMedicineDisplayName,
  normalizeMedicineRoute,
  normalizeMedicineUnit,
} from './medicineCatalog';

describe('buildMedicineDisplayName', () => {
  it('formats active ingredient and trade name as a single label', () => {
    expect(
      buildMedicineDisplayName('Desloratadine', 'Aerius 0.5mg/ml'),
    ).toBe('Desloratadine (Aerius 0.5mg/ml)');
  });

  it('falls back safely when one side is missing', () => {
    expect(buildMedicineDisplayName('Amlodipine', '')).toBe('Amlodipine');
  });
});

describe('normalizers', () => {
  it('normalizes junk route placeholders to empty string', () => {
    expect(normalizeMedicineRoute('.')).toBe('');
  });

  it('normalizes unit casing without losing the original meaning', () => {
    expect(normalizeMedicineUnit('gói')).toBe('Goi');
  });
});
