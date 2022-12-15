import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';
import VariablesDTO from '../variables-dto';

export interface TemplateCommunicationItemDTO {
  id: number;
  messageChannel: { id: number; name: string };
  processedSubject: string;
  processedText: string;
  subject: string;
  text: string;
}

export default interface TemplatesCommunicationDTO {
  id: number;
  template?: {
    brands: BrandDTO[];
    departments: DepartmentDTO[];
    facilities: FacilityDTO[];
    id: number;
    name: string;
    specialties: SpecialtyDTO[];
    templateType: string;
  };
  text?: string;
  variables?: VariablesDTO[];
  processedTemplate?: string;
  templateComunicationItems?: TemplateCommunicationItemDTO[];
}
