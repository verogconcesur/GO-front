import { TabItemConfigInputDTO } from '../cards/card-column-tab-item-dto';
import WorkflowCardSlotDTO from './workflow-card-slot-dto';

export default interface WorkflowCardTabItemDTO {
  description: string;
  id: number;
  name: string;
  orderNumber: number;
  tabId: number;
  tabItemConfigAction: {
    actionType: string;
    id: number;
    tabItemId: number;
    visible: boolean;
  };
  tabItemConfigInput: TabItemConfigInputDTO;
  tabItemConfigLink: {
    color: string;
    id: number;
    link: string;
    name: string;
    tabItemId: number;
  };
  tabItemConfigList: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  tabItemConfigOption: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  tabItemConfigTable: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  tabItemConfigText: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  tabItemConfigTitle: { id: number; tabItemId: number; variable: WorkflowCardSlotDTO };
  tabItemConfigVariable: {
    id: number;
    tabItemId: number;
    variable: WorkflowCardSlotDTO;
  };
  typeItem: 'ACTION' | 'INPUT' | 'LINK' | 'LIST' | 'OPTION' | 'TABLE' | 'TEXT' | 'TITLE' | 'VARIABLE';
}
