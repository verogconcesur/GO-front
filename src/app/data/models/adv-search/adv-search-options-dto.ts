import WorkflowCardSlotDTO from '../workflows/workflow-card-slot-dto';
import WorkflowCardTabItemDTO from '../workflows/workflow-card-tab-item-dto';

export default interface AdvancedSearchOptionsDTO {
  cards: {
    [key: string]: WorkflowCardTabItemDTO[];
  };
  entities: {
    [key: string]: WorkflowCardSlotDTO[];
  };
}
