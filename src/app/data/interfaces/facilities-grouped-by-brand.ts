import FacilityDTO from '@data/models/facility-dto';

export default interface FacilitiesGroupedByBrand {
  brandId: number;
  brandName: string;
  facilities: FacilityDTO[];
}
