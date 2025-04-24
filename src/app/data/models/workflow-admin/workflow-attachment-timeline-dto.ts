import { AdvancedSearchItem } from '../adv-search/adv-search-dto';
import { TemplatesAttachmentDTO } from '../templates/templates-attachment-dto';

export interface WorkflowAttachmentTimelineDTO {
  id: number;
  name: string;
  template: TemplatesAttachmentDTO;
  templateId?: number;
  templateAttachmentItemId?: number;
  numberInput?: number;
  workflowEventCondition?: {
    id: number;
    workflowEventType: string;
    workflowEventConditionItems: AdvancedSearchItem[];
    workflowMovementRequiredAttachmentId: number;
  };
}
