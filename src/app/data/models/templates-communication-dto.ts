import BrandDTO from './brand-dto';
import DepartmentDTO from './department-dto';
import FacilityDTO from './facility-dto';
import SpecialtyDTO from './specialty-dto';

export default interface TemplatesCommunicationDTO {
  id: number;
  template: {
    brands: BrandDTO[];
    departments: DepartmentDTO[];
    facilities: FacilityDTO[];
    id: number;
    name: string;
    specialties: SpecialtyDTO[];
    templateType: string;
  };
  text: string;
}
