import TreeNode from '@data/interfaces/tree-node';

export default interface AdvSearchVariableDTO extends TreeNode {
  id: number;
  attributeName: string;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'TIME' | 'DATETIME' | 'ENTITY';
  contentSource: ContentSourceDTO;
  entityName: string;
  name: string;
  value: string;
}
export interface ContentSourceDTO {
  id: number;
  contentType: ContentTypeDTO;
  name: string;
}
export interface ContentTypeDTO {
  id: number;
  name: string;
  type: 'CUSTOMIZABLE' | 'TEMPLATE' | 'PREFIXED';
}
