import BrandDTO from './brand-dto';
import DepartmentDTO from './department-dto';
import FacilityDTO from './facility-dto';
import SpecialtyDTO from './specialty-dto';

export default interface TemplatesFilterDTO {
  brands: BrandDTO[];
  departments: DepartmentDTO[];
  facilities: FacilityDTO[];
  search: string;
  specialties: SpecialtyDTO[];
}
