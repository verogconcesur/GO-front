import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';

export default interface TemplatesCommonDTO {
  id: number;
  name: string;
  brands: BrandDTO[];
  departments: DepartmentDTO[];
  facilities: FacilityDTO[];
  specialties: SpecialtyDTO[];
  templateType: 'COMUNICATION' | 'BUDGET' | 'ATTACHMENTS' | 'TIMELINE' | 'CHECKLISTS';
}
