import CardColumnTabDTO from './card-column-tab-dto';

export default interface CardColumnDTO {
  orderNumber: number;
  name: string;
  tabs: CardColumnTabDTO[];
}
