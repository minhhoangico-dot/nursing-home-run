import type { FixedServiceCategory, ResidentFixedServiceAssignment, ServicePrice } from '@/src/types';

export const REQUIRED_FIXED_SERVICE_CATEGORIES: FixedServiceCategory[] = ['ROOM', 'MEAL', 'CARE'];

const normalizeText = (value?: string | number) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const firstNumber = (value?: string) => normalizeText(value).match(/\d+/)?.[0];

const isActiveAssignment = (assignment: ResidentFixedServiceAssignment) => assignment.status === 'Active';

const isFixedService = (service: ServicePrice) => service.billingType === 'FIXED';

export const createFixedServiceAssignment = ({
  residentId,
  service,
  effectiveFrom,
  quantity = 1,
  id,
}: {
  residentId: string;
  service: ServicePrice;
  effectiveFrom: string;
  quantity?: number;
  id?: string;
}): ResidentFixedServiceAssignment => {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

  return {
    id: id || `RFS-${residentId}-${service.id}`,
    residentId,
    serviceId: service.id,
    serviceName: service.name,
    category: service.category,
    unitPrice: service.price,
    quantity: safeQuantity,
    totalAmount: service.price * safeQuantity,
    effectiveFrom,
    status: 'Active',
  };
};

export const getMissingRequiredFixedCategories = (
  assignments: ResidentFixedServiceAssignment[],
): FixedServiceCategory[] => {
  const activeCategories = new Set(
    assignments
      .filter(isActiveAssignment)
      .map((assignment) => assignment.category),
  );

  return REQUIRED_FIXED_SERVICE_CATEGORIES.filter((category) => !activeCategories.has(category));
};

const findRoomService = (services: ServicePrice[], roomType?: string) => {
  const roomNumber = firstNumber(roomType);
  const roomServices = services.filter((service) => isFixedService(service) && service.category === 'ROOM');

  return (
    roomServices.find((service) => roomNumber && normalizeText(service.code).includes(`${roomNumber}-bed`)) ||
    roomServices.find((service) => roomNumber && firstNumber(service.name) === roomNumber) ||
    roomServices[0]
  );
};

const findCareService = (services: ServicePrice[], careLevel?: number, roomType?: string) => {
  const roomNumber = firstNumber(roomType);
  const careServices = services.filter((service) => isFixedService(service) && service.category === 'CARE');

  return (
    careServices.find((service) => {
      const serviceText = normalizeText(`${service.id} ${service.code} ${service.name}`);
      const matchesCareLevel = careLevel ? serviceText.includes(`cl${careLevel}`) || serviceText.includes(`cap ${careLevel}`) : true;
      const matchesRoom = roomNumber ? serviceText.includes(`${roomNumber}-bed`) || firstNumber(service.name) === roomNumber : true;

      return matchesCareLevel && matchesRoom;
    }) ||
    careServices.find((service) => careLevel && normalizeText(`${service.id} ${service.code} ${service.name}`).includes(`cl${careLevel}`)) ||
    careServices[0]
  );
};

const findMealService = (services: ServicePrice[]) => {
  const mealServices = services.filter((service) => isFixedService(service) && service.category === 'MEAL');

  return (
    mealServices.find((service) => {
      const text = normalizeText(`${service.code} ${service.name}`);
      return text.includes('standard') || text.includes('tieu chuan') || text.includes('nha an');
    }) ||
    mealServices[0]
  );
};

export const suggestDefaultFixedServices = ({
  residentId,
  roomType,
  careLevel,
  servicePrices,
  effectiveFrom,
}: {
  residentId: string;
  roomType?: string;
  careLevel?: number;
  servicePrices: ServicePrice[];
  effectiveFrom: string;
}): ResidentFixedServiceAssignment[] => {
  const defaults = [
    findRoomService(servicePrices, roomType),
    findCareService(servicePrices, careLevel, roomType),
    findMealService(servicePrices),
  ].filter((service): service is ServicePrice => Boolean(service));

  return defaults.map((service) =>
    createFixedServiceAssignment({
      residentId,
      service,
      effectiveFrom,
    }),
  );
};

export const calculateFixedServiceTotal = (assignments: ResidentFixedServiceAssignment[]) =>
  assignments
    .filter(isActiveAssignment)
    .reduce((sum, assignment) => sum + assignment.totalAmount, 0);
