import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';

export interface TemplateAtachmentItemsDTO {
  name: string;
  id: number;
  orderNumber: number;
}

export interface TemplatesAttachmentDTO {
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
  templateAttachmentItems: TemplateAtachmentItemsDTO[];
  processedTemplate?: string;
}
