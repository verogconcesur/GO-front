import CardColumnTabItemDTO from '../cards/card-column-tab-item-dto';
import AdvSearchOperatorDTO from './adv-search-operator-dto';
import AdvSearchVariableDTO from './adv-search-variable-dto';

export default interface AdvSearchDTO {
  id: number;
  name: string;
  userId: number;
  allUsers: boolean;
  editable: boolean;
  unionType: 'TYPE_AND' | 'TYPE_OR';
  advancedSearchItems: AdvancedSearchItem[];
  advancedSearchCols: AdvancedSearchItem[];
  advancedSearchContext: AdvancedSearchContext;
}
export interface AdvancedSearchItem {
  id: number;
  advancedSearchId: number;
  advancedSearchOperator: AdvSearchOperatorDTO;
  tabItem: CardColumnTabItemDTO;
  value: string;
  variable: AdvSearchVariableDTO;
}
export interface AdvancedSearchContext {
  id: number;
  dateCardFrom: string;
  dateCardTo: string;
  facilitiesIds: number[];
  workflowsIds: number[];
  statesIds: number[];
  substatesIds: number[];
}
