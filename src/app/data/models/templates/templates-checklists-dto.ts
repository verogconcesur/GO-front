import { AttachmentDTO } from '../cards/card-attachments-dto';
import WorkflowCardSlotDTO from '../workflows/workflow-card-slot-dto';
import TemplatesCommonDTO from './templates-common-dto';

export interface TemplateChecklistItemValDTO {
  booleanValue: boolean;
  fileValue: AttachmentDTO;
  id: number;
  textValue: string;
}

export interface TemplateChecklistItemDTO {
  height: number;
  id: number;
  itemVal: TemplateChecklistItemValDTO;
  label: string;
  lowerLeftX: number;
  lowerLeftY: number;
  numPage: number;
  orderNumber: number;
  sincronizedItems: number[];
  staticValue: boolean;
  typeItem: 'SIGN' | 'TEXT' | 'VARIABLE' | 'CHECK' | 'DRAWING' | 'IMAGE';
  typeSign: null | 'SIGN_USER' | 'SIGN_CLIENT';
  variable: WorkflowCardSlotDTO;
  width: number;
}

export default interface TemplatesChecklistsDTO {
  id: number;
  includeFile: boolean;
  template: TemplatesCommonDTO;
  templateChecklistItems: TemplateChecklistItemDTO[];
  templateFile: AttachmentDTO;
}
