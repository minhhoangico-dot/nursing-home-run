import { useAppSettingsStore } from '@/src/stores/appSettingsStore';
import { getFacilityBranding } from '@/src/utils/facilityBranding';

export const useFacilityBranding = () => {
  const facility = useAppSettingsStore((state) => state.facility);
  return getFacilityBranding(facility);
};
