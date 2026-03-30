import { describe, expect, test } from 'vitest';

import {
  calculateDaysSupply,
  calculateMedicationEndDate,
  calculateQuantityDispensed,
} from './medicationCalculations';

describe('calculateQuantityDispensed', () => {
  test('computes quantity from dose per time, times per day, and days supply', () => {
    expect(
      calculateQuantityDispensed({
        dosePerTime: 1,
        timesPerDay: 2,
        daysSupply: 7,
      }),
    ).toBe(14);
  });

  test('returns undefined when inputs are incomplete', () => {
    expect(
      calculateQuantityDispensed({
        dosePerTime: 1,
        timesPerDay: undefined,
        daysSupply: 7,
      }),
    ).toBeUndefined();
  });
});

describe('calculateDaysSupply', () => {
  test('computes days supply from quantity and dose structure', () => {
    expect(
      calculateDaysSupply({
        quantityDispensed: 20,
        dosePerTime: 1,
        timesPerDay: 2,
      }),
    ).toBe(10);
  });

  test('supports fractional daily dose structures', () => {
    expect(
      calculateDaysSupply({
        quantityDispensed: 15,
        dosePerTime: 0.5,
        timesPerDay: 2,
      }),
    ).toBe(15);
  });
});

describe('calculateMedicationEndDate', () => {
  test('treats the start date as day one', () => {
    expect(
      calculateMedicationEndDate({
        startDate: '2026-03-30',
        daysSupply: 7,
        isContinuous: false,
      }),
    ).toBe('2026-04-05');
  });

  test('returns undefined for continuous medications', () => {
    expect(
      calculateMedicationEndDate({
        startDate: '2026-03-30',
        daysSupply: 30,
        isContinuous: true,
      }),
    ).toBeUndefined();
  });
});
