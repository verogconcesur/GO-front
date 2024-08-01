import { TemplatesAttachmentDTO } from '../templates/templates-attachment-dto';

export interface WorkflowAttachmentTimelineDTO {
  id: number;
  name: string;
  template: TemplatesAttachmentDTO;
  templateId?: number;
  templateAttachmentItemId?: number;
  numberInput?: number;
}
