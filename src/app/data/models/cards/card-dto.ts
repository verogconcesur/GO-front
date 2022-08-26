import CardColumnDto from './card-column-dto';

export default interface CardDto {
  id: number;
  name: string;
  newVersion: boolean;
  version: number;
  versionDate: number;
  workflowCount: number;
  cols: CardColumnDto[];
}
