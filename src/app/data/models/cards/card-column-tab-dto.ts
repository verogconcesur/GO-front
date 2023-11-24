import { PermissionConstants } from '@app/constants/permission.constants';
import TreeNode from '@data/interfaces/tree-node';
import CardColumnTabItemDTO from './card-column-tab-item-dto';

export default interface CardColumnTabDTO extends TreeNode {
  id: number;
  orderNumber: number;
  name: string;
  type: 'CUSTOMIZABLE' | 'PREFIXED' | 'TEMPLATE' | 'COMMENTS' | 'CLIENT_MESSAGES';
  contentTypeId: number;
  permissionType?: PermissionConstants;
  contentSourceId?: number;
  tabItems?: CardColumnTabItemDTO[];
  templateId?: number;
  colId?: number;
  children?: CardColumnTabItemDTO[];
}
