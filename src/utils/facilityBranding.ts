import type { FacilityInfo } from '@/src/types/appSettings';
import { DEFAULT_FACILITY_INFO } from '@/src/utils/modulePermissions';

export const DEFAULT_FACILITY_LOGO_SRC = '/logo.png';

export interface FacilityBranding extends FacilityInfo {
  logoSrc: string;
}

export const getFacilityBranding = (facility?: Partial<FacilityInfo> | null): FacilityBranding => {
  const mergedFacility: FacilityInfo = {
    ...DEFAULT_FACILITY_INFO,
    ...facility,
  };

  return {
    ...mergedFacility,
    logoSrc: mergedFacility.logoDataUrl?.trim() || DEFAULT_FACILITY_LOGO_SRC,
  };
};

export const fallbackFacilityLogo = (image: HTMLImageElement) => {
  if (image.getAttribute('src') === DEFAULT_FACILITY_LOGO_SRC) {
    return;
  }

  image.src = DEFAULT_FACILITY_LOGO_SRC;
};
