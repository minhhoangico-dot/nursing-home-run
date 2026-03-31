import { ActiveMedicationRow, MedicationLineStatus, Prescription, PrescriptionItem, PrescriptionItemSchedule } from '../../../types/medical';

const CLINIC_TIME_ZONE = 'Asia/Saigon';
const TIME_OF_DAY_ORDER: Record<ActiveMedicationRow['timeOfDay'], number> = {
  morning: 0,
  noon: 1,
  afternoon: 2,
  evening: 3,
};

const DAY_MS = 24 * 60 * 60 * 1000;

const formatDateInClinicTime = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const parseDateOnly = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
};

const addDays = (value: string, days: number) =>
  formatDateInClinicTime(new Date(parseDateOnly(value) + days * DAY_MS));

const getTodayClinicDate = (today: Date) => formatDateInClinicTime(today);

const getTimesOfDayFromSchedule = (schedule?: PrescriptionItemSchedule) => {
  if (!schedule) return [] as ActiveMedicationRow['timeOfDay'][];

  return ([
    ['morning', schedule.morning],
    ['noon', schedule.noon],
    ['afternoon', schedule.afternoon],
    ['evening', schedule.evening],
  ] as const)
    .filter(([, enabled]) => enabled)
    .map(([timeOfDay]) => timeOfDay);
};

export const getAdministrationsPerDay = (schedule?: PrescriptionItemSchedule, fallback = 0) =>
  Math.max(getTimesOfDayFromSchedule(schedule).length, fallback, 1);

export const getEstimatedDaysSupply = (quantitySupplied?: number, administrationsPerDay?: number) =>
  Math.floor((quantitySupplied ?? 0) / Math.max(administrationsPerDay ?? 1, 1));

export const getEstimatedExhaustionDate = ({
  startDate,
  quantitySupplied,
  administrationsPerDay,
}: {
  startDate?: string;
  quantitySupplied?: number;
  administrationsPerDay?: number;
}) => {
  if (!startDate) return null;
  const estimatedDaysSupply = getEstimatedDaysSupply(quantitySupplied, administrationsPerDay);
  return addDays(startDate, Math.max(estimatedDaysSupply - 1, 0));
};

const getRemainingDays = (estimatedExhaustionDate: string | null, today: Date) => {
  if (!estimatedExhaustionDate) return null;
  return Math.floor((parseDateOnly(estimatedExhaustionDate) - parseDateOnly(getTodayClinicDate(today))) / DAY_MS) + 1;
};

const isWithinDateRange = (item: PrescriptionItem, today: Date) => {
  const todayDate = getTodayClinicDate(today);
  const startsOnOrBeforeToday = !item.startDate || item.startDate <= todayDate;
  const endsOnOrAfterToday = item.continuous || !item.endDate || item.endDate >= todayDate;
  return startsOnOrBeforeToday && endsOnOrAfterToday;
};

export const getMedicationLineStatus = (item: PrescriptionItem, today = new Date()): MedicationLineStatus => {
  const estimatedExhaustionDate = getEstimatedExhaustionDate({
    startDate: item.startDate,
    quantitySupplied: item.quantitySupplied ?? item.quantity,
    administrationsPerDay: item.administrationsPerDay ?? getAdministrationsPerDay(item.schedule, item.timesOfDay.length),
  });
  const remainingDays = getRemainingDays(estimatedExhaustionDate, today);
  const exhausted = remainingDays !== null ? remainingDays <= 0 : false;
  const activeByDate = isWithinDateRange(item, today);
  const active = activeByDate && !exhausted;

  return {
    active,
    nearEnd: active && remainingDays !== null && remainingDays <= 2,
    exhausted,
    remainingDays,
    estimatedExhaustionDate,
  };
};

export const buildActiveMedicationRows = (prescriptions: Prescription[], today = new Date()): ActiveMedicationRow[] =>
  prescriptions
    .filter((prescription) => prescription.status === 'Active')
    .flatMap((prescription) =>
      prescription.items.flatMap((item) => {
        const status = getMedicationLineStatus(item, today);
        if (!status.active) return [];

        return getTimesOfDayFromSchedule(item.schedule).map((timeOfDay) => ({
          prescriptionId: prescription.id,
          sourcePrescriptionCode: prescription.code,
          medicineName: item.medicineName,
          dosage: item.dosage,
          instructions: item.instructions,
          timeOfDay,
          startDate: item.startDate,
          status,
        }));
      }),
    )
    .sort((left, right) => {
      const timeDelta = TIME_OF_DAY_ORDER[left.timeOfDay] - TIME_OF_DAY_ORDER[right.timeOfDay];
      if (timeDelta !== 0) return timeDelta;

      const nameDelta = left.medicineName.localeCompare(right.medicineName);
      if (nameDelta !== 0) return nameDelta;

      const leftStart = left.startDate ?? '';
      const rightStart = right.startDate ?? '';
      const startDelta = leftStart.localeCompare(rightStart);
      if (startDelta !== 0) return startDelta;

      return left.sourcePrescriptionCode.localeCompare(right.sourcePrescriptionCode);
    });
