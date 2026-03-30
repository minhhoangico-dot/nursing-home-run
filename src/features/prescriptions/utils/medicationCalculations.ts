interface QuantityCalculationInput {
  dosePerTime?: number | null;
  timesPerDay?: number | null;
  daysSupply?: number | null;
}

interface DaysSupplyCalculationInput {
  quantityDispensed?: number | null;
  dosePerTime?: number | null;
  timesPerDay?: number | null;
}

interface EndDateCalculationInput {
  startDate?: string | null;
  daysSupply?: number | null;
  isContinuous?: boolean | null;
}

const ROUNDING_PRECISION = 100;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function parseIsoDateOnly(value: string): Date | undefined {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

function isPositiveNumber(value?: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * ROUNDING_PRECISION) / ROUNDING_PRECISION;
}

function getDailyDose({
  dosePerTime,
  timesPerDay,
}: {
  dosePerTime?: number | null;
  timesPerDay?: number | null;
}): number | undefined {
  if (!isPositiveNumber(dosePerTime) || !isPositiveNumber(timesPerDay)) {
    return undefined;
  }

  return dosePerTime * timesPerDay;
}

export function calculateQuantityDispensed({
  dosePerTime,
  timesPerDay,
  daysSupply,
}: QuantityCalculationInput): number | undefined {
  const dailyDose = getDailyDose({ dosePerTime, timesPerDay });

  if (!dailyDose || !isPositiveNumber(daysSupply)) {
    return undefined;
  }

  return roundToTwoDecimals(dailyDose * daysSupply);
}

export function calculateDaysSupply({
  quantityDispensed,
  dosePerTime,
  timesPerDay,
}: DaysSupplyCalculationInput): number | undefined {
  const dailyDose = getDailyDose({ dosePerTime, timesPerDay });

  if (!dailyDose || !isPositiveNumber(quantityDispensed)) {
    return undefined;
  }

  return roundToTwoDecimals(quantityDispensed / dailyDose);
}

export function calculateMedicationEndDate({
  startDate,
  daysSupply,
  isContinuous,
}: EndDateCalculationInput): string | undefined {
  if (!startDate || isContinuous || !isPositiveNumber(daysSupply)) {
    return undefined;
  }

  const parsedStart = parseIsoDateOnly(startDate);

  if (!parsedStart) {
    return undefined;
  }

  const durationInCalendarDays = Math.ceil(daysSupply);
  const endDate = new Date(
    parsedStart.getTime() + (durationInCalendarDays - 1) * MILLISECONDS_PER_DAY,
  );

  return endDate.toISOString().slice(0, 10);
}
