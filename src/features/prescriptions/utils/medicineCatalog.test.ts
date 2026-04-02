import { describe, expect, it } from 'vitest';
import {
  buildMedicineDisplayName,
  normalizeMedicineRoute,
  normalizeMedicineText,
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
  it('normalizes medicine text by collapsing whitespace and nbsp characters', () => {
    expect(normalizeMedicineText('  Deslo\u00a0ratadine   5 mg  ')).toBe(
      'Deslo ratadine 5 mg',
    );
  });

  it('normalizes junk route placeholders to empty string', () => {
    expect(normalizeMedicineRoute('.')).toBe('');
  });

  it('normalizes unit casing without losing the original meaning', () => {
    expect(normalizeMedicineUnit('g\u00f3i')).toBe('Goi');
  });

  it('preserves mixed-case technical units', () => {
    expect(normalizeMedicineUnit('mL')).toBe('mL');
    expect(normalizeMedicineUnit('IU')).toBe('IU');
    expect(normalizeMedicineUnit('mcg/mL')).toBe('mcg/mL');
  });
});
