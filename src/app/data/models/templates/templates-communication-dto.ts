import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';
import VariablesDTO from '../variables-dto';
import MessageChannelDTO from './message-channels-dto';
export const CommunicationTypes: { value: string; label: string }[] = [
  { value: 'USER', label: 'common.communicationTypes.user' },
  { value: 'CUSTOMER', label: 'common.communicationTypes.customer' }
];
export interface TemplateComunicationItemsDTO {
  id: number;
  text: string;
  processedSubject: string;
  processedText: string;
  subject: string;
  messageChannel: MessageChannelDTO;
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
  comunicationType: string;
  templateComunicationItems: TemplateComunicationItemsDTO[];
}
