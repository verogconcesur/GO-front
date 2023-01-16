import { FormControl, UntypedFormArray } from '@angular/forms';
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

export interface AuxChecklistItemsGroupByTypeDTO {
  typeItem: 'SIGN' | 'TEXT' | 'VARIABLE' | 'CHECK' | 'DRAWING' | 'IMAGE';
  typeLabel: string;
  numPages: number[];
  orderNumbers: number[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orderNumberPageAssociation: any;
  syncGroups: AuxChecklistItemsGroupBySyncDTO[];
}
export interface AuxChecklistItemsGroupBySyncDTO {
  numPages: number[];
  sincronizedItems: number[]; //orderNumbers
  selectedItem: number;
  typeItem: 'SIGN' | 'TEXT' | 'VARIABLE' | 'CHECK' | 'DRAWING' | 'IMAGE';
  typeSign: null | 'SIGN_USER' | 'SIGN_CLIENT';
  variable: WorkflowCardSlotDTO;
  syncronized: boolean;
  templateChecklistItems: UntypedFormArray;
}

export default interface TemplatesChecklistsDTO {
  id: number;
  includeFile: boolean;
  template: TemplatesCommonDTO;
  templateChecklistItems: TemplateChecklistItemDTO[];
  templateFile: AttachmentDTO;
}
