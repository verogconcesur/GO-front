/* eslint-disable @typescript-eslint/no-explicit-any */
import CardColumnTabItemDTO from '../cards/card-column-tab-item-dto';
import AdvSearchOperatorDTO from './adv-search-operator-dto';
import AdvSearchVariableDTO from './adv-search-variable-dto';

export default interface AdvSearchDTO {
  id: number;
  name: string;
  userId: number;
  allUsers: boolean;
  scheduledQueries?: string;
  scheduled?: boolean;
  scheduleType?: string;
  scheduledDate?: string;
  scheduledWeekDay?: string;
  scheduledMonthDay?: string;
  scheduledTime?: string;
  scheduledReceivers?: string[];
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
  orderNumber?: number;
}
export interface AdvancedSearchContext {
  dateCardFrom?: string;
  dateCardTo?: string;
  dateContextType?: string;
  facilitiesIds?: number[];
  workflowsIds?: number[];
  statesIds?: number[];
  substatesIds?: any[];
  facilities?: any[];
  workflows?: any[];
  states?: any[];
  substates?: any[];
}
