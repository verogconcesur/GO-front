import CardColumnDTO from './card-column-dto';

export default interface CardDTO {
  id: number;
  name: string;
  newVersion: boolean;
  version: number;
  versionDate: number;
  workflowCount: number;
  cols: CardColumnDTO[];
}
