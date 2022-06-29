import BrandDTO from './brand-dto';
import TownDto from './town-dto';

export default interface FacilityDTO {
  address?: string;
  brands?: BrandDTO[];
  cif?: string;
  email?: string;
  footer?: string;
  header?: string;
  id?: number;
  name?: string;
  numDepartments?: number;
  postalCode?: string;
  town?: TownDto;
}
