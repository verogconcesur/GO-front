import BrandDTO from './brand-dto';
import TownDTO from '../location/town-dto';

export default interface FacilityDTO {
  id: number;
  address?: string;
  brands?: BrandDTO[];
  cif?: string;
  email?: string;
  footer?: string;
  header?: string;
  name?: string;
  numDepartments?: number;
  postalCode?: string;
  town?: TownDTO;
}
