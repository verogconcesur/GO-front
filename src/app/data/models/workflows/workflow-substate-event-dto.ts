import CardColumnTabItemDTO from '../cards/card-column-tab-item-dto';

export default interface WorkflowSubstateEventDTO {
  id: number;
  requiredFields: boolean;
  requiredFieldsList: CardColumnTabItemDTO[];
}
