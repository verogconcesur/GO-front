import TemplatesTimelineDTO, { TemplatesTimelineItemsDTO } from '../templates/templates-timeline-dto';
import WorkflowSubstateDTO from '../workflows/workflow-substate-dto';

export interface WorkflowTimelineDTO {
  id?: number;
  templateTimelineDTO?: TemplatesTimelineDTO;
  workflowSubstateTimelineItems?: WorkflowSubstateTimelineItemDTO[];
}

export interface WorkflowSubstateTimelineItemDTO {
  templateTimelineItem?: TemplatesTimelineItemsDTO;
  workflowSubstate?: WorkflowSubstateDTO[];
}
