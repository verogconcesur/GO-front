import TemplatesTimelineDTO, { TemplatesTimelineItemsDTO } from '../templates/templates-timeline-dto';
import WorkflowSubstateDTO from '../workflows/workflow-substate-dto';

export interface WorkflowTimelineDTO {
  customerAttachTabId?: number;
  customerAttachTemplateAttachmentItemId?: number;
  templateTimelineDTO?: TemplatesTimelineDTO;
  workflowSubstateTimelineItems?: WorkflowSubstateTimelineItemDTO[];
  templateAttachmentItemId: number;
  tabId: number;
  whatsappTemplateAttachmentItemId: number;
  whatsappTabId: number;
}

export interface WorkflowSubstateTimelineItemDTO {
  templateTimelineItem?: TemplatesTimelineItemsDTO;
  workflowSubstate?: WorkflowSubstateDTO;
}
