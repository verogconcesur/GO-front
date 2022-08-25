import CardColumnTabItemDto from './card-column-tab-item-dto';

export default interface CardColumnTabDto {
  id: number;
  orderNumber: number;
  name: string;
  type: 'CUSTOMIZABLE' | 'PREFIXED' | 'TEMPLATE';
  contentTypeId: number;
  contentSourceId?: number;
  tabItems?: CardColumnTabItemDto[];
}
