import CardColumnTabItemDTO from '../cards/card-column-tab-item-dto';
import AdvSearchVariableDTO from './adv-search-variable-dto';

export default interface AdvancedSearchOptionsDTO {
  cards: {
    [key: string]: CardColumnTabItemDTO[];
  };
  entities: {
    [key: string]: AdvSearchVariableDTO[];
  };
  escapedValue?: string;
}
