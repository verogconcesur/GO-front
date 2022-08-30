import FacilityDTO from '@data/models/organization/facility-dto';

export default interface FacilitiesGroupedByBrand {
  brandId: number[];
  brandName: string;
  facilities: FacilityDTO[];
  tooltipBrandName?: string;
}
