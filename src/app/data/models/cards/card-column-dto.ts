import CardColumnTabDto from './card-column-tab-dto';

export default interface CardColumnDto {
  orderNumber: number;
  name: string;
  tabs: CardColumnTabDto[];
}
