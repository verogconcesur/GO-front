import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';
import VariablesDTO from '../variables-dto';

export interface TemplatesTimelineItemsDTO {
  recipientEmail: string;
  name: string;
  id: number;
  orderNumber: number;
  messageLanding: string;
  closed: boolean;
  variables?: VariablesDTO[];
}

export default interface TemplatesTimelineDTO {
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
  templateTimelineItems: TemplatesTimelineItemsDTO[];
}
