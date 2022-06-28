import BrandDTO from './brand-dto';

export default interface FacilityDTO {
  id: number;
  name?: string;
  brands?: BrandDTO[];
  numDepartments?: number;
}
