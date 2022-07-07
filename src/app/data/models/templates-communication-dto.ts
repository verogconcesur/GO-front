import BrandDTO from './brand-dto';
import DepartmentDTO from './department-dto';
import FacilityDTO from './facility-dto';
import SpecialtyDTO from './specialty-dto';

export default interface TemplatesCommunicationDTO {
  id: number;
  name: string;
  brands: BrandDTO[];
  departments: DepartmentDTO[];
  facilities: FacilityDTO[];
  specialties: SpecialtyDTO[];
  templateType: string;
}
