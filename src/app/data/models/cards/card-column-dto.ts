import TreeNode from '@data/interfaces/tree-node';
import CardColumnTabDTO from './card-column-tab-dto';

export default interface CardColumnDTO extends TreeNode {
  orderNumber: number;
  name: string;
  tabs: CardColumnTabDTO[];
  cardId: number;
  colType: string;
  id: number;
  children?: CardColumnTabDTO[];
}
