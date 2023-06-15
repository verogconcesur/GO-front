export default interface AdvSearchDTO {
  id?: number;
  name?: string;
  userId?: number;
  allUsers?: boolean;
  editable?: boolean;
  unionType?: 'TYPE_AND' | 'TYPE_OR';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  advancedSearchItems: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  advancedSearchCols: any[];
}
