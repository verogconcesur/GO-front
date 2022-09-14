import CardColumnTabItemDTO from './card-column-tab-item-dto';

export default interface CardColumnTabDTO {
  id: number;
  orderNumber: number;
  name: string;
  type: 'CUSTOMIZABLE' | 'PREFIXED' | 'TEMPLATE' | 'COMMENTS' | 'CLIENT_MESSAGES';
  contentTypeId: number;
  contentSourceId?: number;
  tabItems?: CardColumnTabItemDTO[];
  templateId?: number;
  colId?: number;
}
