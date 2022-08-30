import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';

export default interface TemplatesFilterDTO {
  brands: BrandDTO[];
  departments: DepartmentDTO[];
  facilities: FacilityDTO[];
  search: string;
  specialties: SpecialtyDTO[];
}
