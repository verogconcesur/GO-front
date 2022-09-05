import WorkflowCardSlotDTO from './workflow-card-slot-dto';

export default interface WorkflowCardTabItemDTO {
  description: string;
  id: number;
  name: string;
  orderNumber: number;
  tabId: number;
  tabItemConfigAction: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  tabItemConfigInput: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  tabItemConfigLink: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  tabItemConfigList: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  tabItemConfigOption: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  tabItemConfigTable: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  tabItemConfigText: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  tabItemConfigTitle: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  tabItemConfigVariable: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  typeItem: 'ACTION' | 'INPUT' | 'LINK' | 'LIST' | 'OPTION' | 'TABLE' | 'TEXT' | 'TITLE' | 'VARIABLE';
}
