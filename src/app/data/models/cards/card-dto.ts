import CardColumnDto from './card-column-dto';

export default interface CardDto {
  name: string;
  cols: CardColumnDto[];
}
