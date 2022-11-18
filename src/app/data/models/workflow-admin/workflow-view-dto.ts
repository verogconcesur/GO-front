import WorkflowCardTabItemDTO from '@data/models/workflows/workflow-card-tab-item-dto';

export default interface WorkflowViewDTO {
  id: number;
  orderNumber: number;
  tabItem: WorkflowCardTabItemDTO;
  viewType: 'BOARD' | 'CALENDAR' | 'TABLE';
}
